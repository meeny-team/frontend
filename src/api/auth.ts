import { apiRequest, setTokens } from './client';

interface SocialLoginRequest {
  provider: 'KAKAO' | 'GOOGLE' | 'APPLE';
  token: string;
  nickname?: string;
}

interface SocialLoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function socialLogin(params: SocialLoginRequest): Promise<void> {
  const response = await apiRequest<SocialLoginResponse>('/api/auth/social', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.success) {
    throw new Error(response.message);
  }

  await setTokens(response.data.accessToken, response.data.refreshToken);
}
