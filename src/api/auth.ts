/**
 * Meeny - 백엔드 Auth API
 *
 * 백엔드의 ApiResponse<T> 형식: { success, data, message } 또는 { success: false, code, message }
 * 본 모듈은 실제 fetch만 담당. 토큰 저장과 흐름 제어는 AuthProvider 책임.
 */

import { API_BASE_URL } from '../config';

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

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // 본문이 비어있을 수도 있음(204 등). 안전하게 텍스트로 받은 뒤 JSON 파싱.
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

  // 백엔드는 200으로 항상 success 형태로 응답하지만, 본문이 없는 경우도 안전하게 처리.
  return ((parsed as BackendSuccess<T>) ?? { data: undefined as unknown as T }).data;
}

export async function socialLogin(
  provider: SocialProvider,
  token: string,
  nickname?: string,
): Promise<TokenResponse> {
  return postJson<TokenResponse>('/api/auth/social', { provider, token, nickname });
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return postJson<TokenResponse>('/api/auth/refresh', { refreshToken });
}

export async function logout(refreshToken: string): Promise<void> {
  await postJson<void>('/api/auth/logout', { refreshToken });
}
