/**
 * auth/session 테스트
 *
 * 보안 핵심 — 백엔드 refresh token 은 reuse-detection 이 켜져 있어 한 번 쓴 토큰을 다시 쓰면
 * 모든 세션이 무효화된다. 클라이언트는 절대 동시 refresh 호출을 보내선 안 됨.
 * 이 테스트는 그 단일 호출 보장(in-flight dedup)을 회귀로부터 지킨다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  loadFromStorage,
  notifySessionExpired,
  refreshSession,
  saveTokens,
  setOnSessionExpired,
} from '../../src/auth/session';

const STORAGE_KEY = 'meeny.tokens.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
  await clearSession();
  setOnSessionExpired(null);
});

describe('saveTokens / getAccessToken / getRefreshToken', () => {
  test('saveTokens 후 in-memory 캐시에서 즉시 조회 가능', async () => {
    await saveTokens({ accessToken: 'A1', refreshToken: 'R1' });
    expect(getAccessToken()).toBe('A1');
    expect(getRefreshToken()).toBe('R1');
  });

  test('saveTokens 는 AsyncStorage 에도 영속화', async () => {
    await saveTokens({ accessToken: 'A1', refreshToken: 'R1' });
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual({ accessToken: 'A1', refreshToken: 'R1' });
  });
});

describe('loadFromStorage', () => {
  test('저장된 값이 있으면 캐시에 채우고 반환', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken: 'A2', refreshToken: 'R2' }),
    );
    const loaded = await loadFromStorage();
    expect(loaded).toEqual({ accessToken: 'A2', refreshToken: 'R2' });
    expect(getAccessToken()).toBe('A2');
  });

  test('값이 없으면 null', async () => {
    expect(await loadFromStorage()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  test('손상된 JSON 이면 캐시를 비우고 null — 앱이 부팅에서 죽지 않게', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{broken json');
    expect(await loadFromStorage()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});

describe('clearSession', () => {
  test('in-memory 와 AsyncStorage 둘 다 비움', async () => {
    await saveTokens({ accessToken: 'A', refreshToken: 'R' });
    await clearSession();
    expect(getAccessToken()).toBeNull();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('refreshSession - in-flight dedup', () => {
  test('동시에 여러 호출이 들어와도 refreshFn 은 정확히 1회만 호출됨', async () => {
    await saveTokens({ accessToken: 'A_old', refreshToken: 'R_old' });

    let resolveRefresh: ((v: { accessToken: string; refreshToken: string }) => void) | null = null;
    const refreshFn = jest.fn(
      () =>
        new Promise<{ accessToken: string; refreshToken: string }>(resolve => {
          resolveRefresh = resolve;
        }),
    );

    const p1 = refreshSession(refreshFn);
    const p2 = refreshSession(refreshFn);
    const p3 = refreshSession(refreshFn);

    expect(refreshFn).toHaveBeenCalledTimes(1);
    expect(refreshFn).toHaveBeenCalledWith('R_old');

    resolveRefresh!({ accessToken: 'A_new', refreshToken: 'R_new' });
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(r1).toEqual({ accessToken: 'A_new', refreshToken: 'R_new' });
    expect(r2).toBe(r1);
    expect(r3).toBe(r1);
    expect(getAccessToken()).toBe('A_new');
    expect(getRefreshToken()).toBe('R_new');
  });

  test('refresh 성공 후 후속 호출은 새 토큰으로 다시 한 번 더 호출', async () => {
    await saveTokens({ accessToken: 'A_old', refreshToken: 'R_old' });
    const refreshFn = jest
      .fn()
      .mockResolvedValueOnce({ accessToken: 'A_new', refreshToken: 'R_new' })
      .mockResolvedValueOnce({ accessToken: 'A_new2', refreshToken: 'R_new2' });

    await refreshSession(refreshFn);
    await refreshSession(refreshFn);

    expect(refreshFn).toHaveBeenCalledTimes(2);
    expect(refreshFn).toHaveBeenNthCalledWith(1, 'R_old');
    expect(refreshFn).toHaveBeenNthCalledWith(2, 'R_new');
  });

  test('refresh token 이 없으면 reject — 호출 자체 안 함', async () => {
    const refreshFn = jest.fn();
    await expect(refreshSession(refreshFn)).rejects.toThrow('No refresh token');
    expect(refreshFn).not.toHaveBeenCalled();
  });

  test('refreshFn 이 실패하면 in-flight 가 해제되어 다음 호출 재시도 가능', async () => {
    await saveTokens({ accessToken: 'A_old', refreshToken: 'R_old' });
    const refreshFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ accessToken: 'A_ok', refreshToken: 'R_ok' });

    await expect(refreshSession(refreshFn)).rejects.toThrow('boom');
    // 실패 후에도 다음 호출이 막히면 안 됨.
    const second = await refreshSession(refreshFn);
    expect(second.accessToken).toBe('A_ok');
    expect(refreshFn).toHaveBeenCalledTimes(2);
  });
});

describe('setOnSessionExpired / notifySessionExpired', () => {
  test('등록한 콜백이 호출됨', () => {
    const cb = jest.fn();
    setOnSessionExpired(cb);
    notifySessionExpired();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('null 로 해제 가능 — 메모리 누수/이중 호출 방지', () => {
    const cb = jest.fn();
    setOnSessionExpired(cb);
    setOnSessionExpired(null);
    notifySessionExpired();
    expect(cb).not.toHaveBeenCalled();
  });

  test('등록 없이도 안전 — silent no-op', () => {
    expect(() => notifySessionExpired()).not.toThrow();
  });
});
