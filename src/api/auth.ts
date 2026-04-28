import { apiRequest, setTokens, getRefreshToken, clearTokens } from './client';

interface SocialLoginRequest {
  provider: 'KAKAO' | 'GOOGLE' | 'APPLE';
  token: string;
  nickname?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export async function socialLogin(params: SocialLoginRequest): Promise<void> {
  const tokens = await apiRequest<TokenResponse>('/api/auth/social', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  await setTokens(tokens.accessToken, tokens.refreshToken);
}

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const tokens = await apiRequest<TokenResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    await setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  } catch {
    await clearTokens();
    return null;
  }
}

export async function logoutBackend(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return;
  try {
    await apiRequest<void>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // 백엔드 호출 실패해도 로컬 로그아웃은 진행
  }
}
