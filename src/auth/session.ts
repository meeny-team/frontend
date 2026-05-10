/**
 * Meeny - Auth Session
 *
 * 토큰을 한 군데에 모아 둔 single source of truth.
 *  - in-memory 캐시: 매 API 호출마다 AsyncStorage 를 읽지 않게
 *  - AsyncStorage 영속화: 앱 재시작 후에도 자동 로그인
 *  - in-flight refresh 캐싱: 동시에 401 이 여러 개 떨어져도 백엔드의 refresh
 *    는 단 한 번만 호출되도록 (백엔드는 reuse detection 이 켜져 있어 같은 refresh
 *    토큰을 두 번 사용하면 모든 토큰을 무효화함 — 절대 동시 호출되면 안 됨)
 *  - onSessionExpired 콜백: refresh 가 실패해 세션이 끝났을 때 외부(AuthProvider)
 *    가 UI 상태(user/tokens) 를 비우고 로그인 화면으로 떨어지도록 알림
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenResponse } from '../api/auth';

const KEY = 'meeny.tokens.v1';

let cached: TokenResponse | null = null;
let inflightRefresh: Promise<TokenResponse> | null = null;
let onExpired: (() => void) | null = null;

export function getAccessToken(): string | null {
  return cached?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return cached?.refreshToken ?? null;
}

export async function loadFromStorage(): Promise<TokenResponse | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    cached = null;
    return null;
  }
  try {
    cached = JSON.parse(raw) as TokenResponse;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export async function saveTokens(tokens: TokenResponse): Promise<void> {
  cached = tokens;
  await AsyncStorage.setItem(KEY, JSON.stringify(tokens));
}

export async function clearSession(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(KEY);
}

export function setOnSessionExpired(cb: (() => void) | null): void {
  onExpired = cb;
}

export function notifySessionExpired(): void {
  onExpired?.();
}

// 한 번에 한 refresh 만 보장. 호출자가 여럿이어도 모두 같은 promise 를 await.
export function refreshSession(
  refreshFn: (refreshToken: string) => Promise<TokenResponse>,
): Promise<TokenResponse> {
  if (inflightRefresh) return inflightRefresh;

  const rt = getRefreshToken();
  if (!rt) {
    return Promise.reject(new Error('No refresh token'));
  }

  inflightRefresh = refreshFn(rt)
    .then(async issued => {
      await saveTokens(issued);
      return issued;
    })
    .finally(() => {
      inflightRefresh = null;
    });

  return inflightRefresh;
}
