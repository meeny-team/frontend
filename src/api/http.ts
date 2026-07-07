/**
 * Meeny - HTTP client
 *
 * 백엔드의 ApiResponse<T> 형식을 가정하고 래핑한 fetch.
 *  - 인증이 필요한 호출은 자동으로 session 의 accessToken 을 첨부
 *  - 401 응답 시 refreshSession 을 통해 새 토큰을 받아 한 번 재시도
 *  - refresh 자체가 실패하면 session 비우고 onSessionExpired 알림
 *  - AbortController 로 요청 타임아웃 (기본 15s) — 3G/지하철 환경 무한 hang 방지
 */

import { API_BASE_URL } from '../config';
import {
  clearSession,
  getAccessToken,
  notifySessionExpired,
  refreshSession,
} from '../auth/session';

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

export const DEFAULT_TIMEOUT_MS = 15_000;
// 타임아웃 도달 시 AuthApiError 로 표준화 — 화면에서는 code 로 분기 가능
export const TIMEOUT_ERROR_CODE = 'REQUEST_TIMEOUT';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  // auth=false 인 호출(로그인/리프레시/로그아웃)은 access token 첨부도, 401 자동 refresh 도 적용 안 됨.
  auth?: boolean;
  // 밀리초. 지정 안 하면 DEFAULT_TIMEOUT_MS.
  timeoutMs?: number;
}

async function rawFetch(
  path: string,
  method: string,
  body: unknown,
  accessToken: string | null,
  timeoutMs: number,
): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    timeoutMs,
  );
}

/**
 * fetch + AbortController 조합. 타임아웃 도달 시 요청 취소하고 AuthApiError(REQUEST_TIMEOUT) 던짐.
 * 외부 (uploads.ts 등) 에서도 재사용할 수 있게 export.
 */
export async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    // AbortController.abort() 는 fetch 를 AbortError 로 reject. RN 에서 name 만 신뢰 가능.
    if (isAbortError(err)) {
      throw new AuthApiError(
        TIMEOUT_ERROR_CODE,
        `요청이 ${Math.round(timeoutMs / 1000)}초 안에 완료되지 않았습니다.`,
        0,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === 'object'
    && err !== null
    && 'name' in err
    && (err as { name: unknown }).name === 'AbortError'
  );
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

// 외부에서 주입되는 refreshTokens 함수(auth.ts 가 등록).
// http 모듈은 auth 모듈을 직접 import 하지 않고 함수 포인터만 받는다 — 순환 import 회피.
type RefreshFn = (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
let registeredRefreshFn: RefreshFn | null = null;
export function registerRefreshFn(fn: RefreshFn): void {
  registeredRefreshFn = fn;
}

export async function request<T>(path: string, init: RequestOptions): Promise<T> {
  const auth = init.auth ?? true;
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!auth) {
    const res = await rawFetch(path, init.method, init.body, null, timeoutMs);
    return parseResponse<T>(res);
  }

  let res = await rawFetch(path, init.method, init.body, getAccessToken(), timeoutMs);
  if (res.status !== 401) {
    return parseResponse<T>(res);
  }

  if (!registeredRefreshFn) {
    // 부팅 직후 등 등록 전이라면 그냥 401 으로 종료
    return parseResponse<T>(res);
  }

  // 401 → refresh 시도. session.refreshSession 이 in-flight promise 를 공유해 백엔드 refresh 호출은 한 번만.
  try {
    const issued = await refreshSession(registeredRefreshFn);
    res = await rawFetch(path, init.method, init.body, issued.accessToken, timeoutMs);
    return parseResponse<T>(res);
  } catch {
    await clearSession();
    notifySessionExpired();
    throw new AuthApiError('SESSION_EXPIRED', '세션이 만료되었습니다. 다시 로그인해주세요.', 401);
  }
}
