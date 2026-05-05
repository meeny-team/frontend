/**
 * Meeny - 백엔드 Auth API
 *
 * 응답 형식: { success: true, data, message } 또는 { success: false, code, message }
 *
 * 인증이 필요한 호출은 자동으로 session 의 accessToken 을 첨부하고, 401 응답 시
 * refresh 를 한 번 시도한 뒤 새 토큰으로 원 요청을 재시도한다. refresh 자체가
 * 실패하면 세션을 비우고 onSessionExpired 를 알린다.
 */

import { API_BASE_URL } from '../config';
import {
  clearSession,
  getAccessToken,
  notifySessionExpired,
  refreshSession,
} from '../auth/session';

export type SocialProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface BackendSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface BackendFailure {
  success: false;
  code: string;
  message: string;
}

export class AuthApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function rawFetch(
  path: string,
  method: 'GET' | 'POST',
  body: unknown,
  accessToken: string | null,
): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function parseResponse<T>(res: Response): Promise<T> {
  // 본문이 비어있을 수도 있음(204 등).
  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as BackendSuccess<T> | BackendFailure) : undefined;

  if (!res.ok || (parsed && parsed.success === false)) {
    const failure = parsed as BackendFailure | undefined;
    throw new AuthApiError(
      failure?.code ?? 'UNKNOWN',
      failure?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return ((parsed as BackendSuccess<T>) ?? { data: undefined as unknown as T }).data;
}

interface RequestInit {
  method: 'GET' | 'POST';
  body?: unknown;
  // auth=false 인 호출(로그인/리프레시/로그아웃)은 access token 도, 401 자동 refresh 도 적용 안 됨.
  auth?: boolean;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const auth = init.auth ?? true;

  if (!auth) {
    const res = await rawFetch(path, init.method, init.body, null);
    return parseResponse<T>(res);
  }

  let res = await rawFetch(path, init.method, init.body, getAccessToken());
  if (res.status !== 401) {
    return parseResponse<T>(res);
  }

  // 401 → refresh 시도. 동시에 401 이 여러 개 떨어져도 session.refreshSession 이
  // in-flight promise 를 공유해 백엔드 refresh 호출은 한 번만.
  try {
    const issued = await refreshSession(refreshTokens);
    res = await rawFetch(path, init.method, init.body, issued.accessToken);
    return parseResponse<T>(res);
  } catch {
    // refresh 자체가 실패하면 세션 종료 + 외부 알림(=AuthProvider 가 user state 를 비움)
    await clearSession();
    notifySessionExpired();
    throw new AuthApiError('SESSION_EXPIRED', '세션이 만료되었습니다. 다시 로그인해주세요.', 401);
  }
}

export async function socialLogin(
  provider: SocialProvider,
  token: string,
  nickname?: string,
): Promise<TokenResponse> {
  return request<TokenResponse>('/api/auth/social', {
    method: 'POST',
    body: { provider, token, nickname },
    auth: false,
  });
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return request<TokenResponse>('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    auth: false,
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await request<void>('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    auth: false,
  });
}

export interface MemberProfile {
  id: number;
  nickname: string;
  email: string | null;
  profileImage: string | null;
  bio: string | null;
}

export async function fetchMe(): Promise<MemberProfile> {
  return request<MemberProfile>('/api/users/me', { method: 'GET' });
}
