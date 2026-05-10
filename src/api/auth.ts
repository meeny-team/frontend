/**
 * Meeny - 백엔드 Auth API
 *
 * 공통 fetch/401 인터셉트는 http.ts 가 담당. 본 모듈은 auth 도메인 호출만.
 */

import { request, AuthApiError, registerRefreshFn } from './http';

export { AuthApiError };

export type SocialProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
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

// http 모듈에 refresh 함수를 등록 — 401 자동 재시도 시 사용.
// 모듈 로드 시점에 한 번만 실행.
registerRefreshFn(refreshTokens);

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
