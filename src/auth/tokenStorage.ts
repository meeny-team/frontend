/**
 * Meeny - Token Storage
 *
 * accessToken/refreshToken 영속 저장. 앱 재시작 시 자동 로그인의 기반.
 * Keychain 같은 보안 저장소 도입 전까지 AsyncStorage(평문) 사용.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenResponse } from '../api/auth';

const KEY = 'meeny.tokens.v1';

export async function saveTokens(tokens: TokenResponse): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(tokens));
}

export async function loadTokens(): Promise<TokenResponse | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenResponse;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
