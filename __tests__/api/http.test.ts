/**
 * api/http 테스트 — 401 → refresh → 재시도 라이프사이클
 *
 * 이 모듈이 깨지면:
 *  - 토큰이 만료된 호출이 그냥 401 로 떨어져 화면이 빈 상태로 보임
 *  - refresh 실패 시에도 사용자가 로그인 화면으로 떨어지지 않아 무한 401
 *  - registerRefreshFn 이 안 박혀 있으면 자동 재시도 자체가 동작 안 함
 *
 * 그래서 정상 흐름 / 401 후 refresh 성공 / refresh 실패 → 세션 만료 알림
 * 세 가지 시나리오를 모두 본다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthApiError,
  registerRefreshFn,
  request,
} from '../../src/api/http';
import {
  clearSession,
  saveTokens,
  setOnSessionExpired,
} from '../../src/auth/session';

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response;
}

let fetchMock: jest.Mock;

beforeEach(async () => {
  fetchMock = jest.fn();
  (globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  await AsyncStorage.clear();
  await clearSession();
  setOnSessionExpired(null);
});

describe('request - happy path', () => {
  test('성공 응답의 data 필드만 풀어서 반환', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, { success: true, data: { id: 1, nickname: 'k' } }),
    );

    const result = await request<{ id: number; nickname: string }>('/api/users/me', {
      method: 'GET',
    });
    expect(result).toEqual({ id: 1, nickname: 'k' });
  });

  test('auth=true(default) 면 Authorization 헤더에 access token 첨부', async () => {
    await saveTokens({ accessToken: 'AT', refreshToken: 'RT' });
    fetchMock.mockResolvedValueOnce(mockResponse(200, { success: true, data: null }));

    await request('/api/x', { method: 'GET' });

    const init = fetchMock.mock.calls[0][1];
    expect(init.headers.Authorization).toBe('Bearer AT');
  });

  test('auth=false 면 Authorization 헤더 미첨부 — 로그인/리프레시 호출용', async () => {
    await saveTokens({ accessToken: 'AT', refreshToken: 'RT' });
    fetchMock.mockResolvedValueOnce(mockResponse(200, { success: true, data: null }));

    await request('/api/auth/social', { method: 'POST', body: {}, auth: false });
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers.Authorization).toBeUndefined();
  });

  test('body 는 JSON.stringify 되어 전송', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { success: true, data: null }));
    await request('/api/x', { method: 'POST', body: { a: 1 }, auth: false });
    expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}');
  });
});

describe('request - 에러 매핑', () => {
  test('백엔드의 success:false → AuthApiError(code, message, status)', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(400, { success: false, code: 'BAD_REQUEST', message: '잘못된 요청' }),
    );

    await expect(request('/api/x', { method: 'GET', auth: false })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: '잘못된 요청',
      status: 400,
    });
  });

  test('빈 본문 + 비-2xx → UNKNOWN code 로 폴백', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(500, ''));
    await expect(request('/api/x', { method: 'GET', auth: false })).rejects.toBeInstanceOf(
      AuthApiError,
    );
  });

  test('204 No Content (빈 본문, 2xx) → undefined 반환, 에러 아님', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(204, ''));
    await expect(request('/api/x', { method: 'DELETE', auth: false })).resolves.toBeUndefined();
  });
});

describe('request - 401 자동 refresh 재시도', () => {
  test('401 → refresh 성공 → 새 토큰으로 재시도 → 성공', async () => {
    await saveTokens({ accessToken: 'OLD', refreshToken: 'R_OLD' });

    const refreshFn = jest
      .fn()
      .mockResolvedValue({ accessToken: 'NEW', refreshToken: 'R_NEW' });
    registerRefreshFn(refreshFn);

    fetchMock
      .mockResolvedValueOnce(
        mockResponse(401, { success: false, code: 'UNAUTHORIZED', message: '만료' }),
      )
      .mockResolvedValueOnce(mockResponse(200, { success: true, data: { ok: 1 } }));

    const result = await request<{ ok: number }>('/api/me', { method: 'GET' });

    expect(result).toEqual({ ok: 1 });
    expect(refreshFn).toHaveBeenCalledTimes(1);
    expect(refreshFn).toHaveBeenCalledWith('R_OLD');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    // 재시도 호출은 새 토큰을 사용해야 함.
    const retryInit = fetchMock.mock.calls[1][1];
    expect(retryInit.headers.Authorization).toBe('Bearer NEW');
  });

  test('401 → refresh 실패 → SESSION_EXPIRED + onExpired 콜백 + 세션 비움', async () => {
    await saveTokens({ accessToken: 'OLD', refreshToken: 'R_OLD' });

    const refreshFn = jest.fn().mockRejectedValue(new Error('refresh denied'));
    registerRefreshFn(refreshFn);

    const onExpired = jest.fn();
    setOnSessionExpired(onExpired);

    fetchMock.mockResolvedValueOnce(
      mockResponse(401, { success: false, code: 'UNAUTHORIZED', message: '만료' }),
    );

    await expect(request('/api/me', { method: 'GET' })).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
      status: 401,
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
    // 세션이 비워져야 다음 자동 시도가 또 일어나지 않음.
    expect(await AsyncStorage.getItem('meeny.tokens.v1')).toBeNull();
  });

  test('auth=false 호출은 401 이어도 자동 refresh 안 함 (refresh 자체가 401 났을 때 무한 루프 방지)', async () => {
    await saveTokens({ accessToken: 'OLD', refreshToken: 'R_OLD' });
    const refreshFn = jest.fn();
    registerRefreshFn(refreshFn);

    fetchMock.mockResolvedValueOnce(
      mockResponse(401, { success: false, code: 'UNAUTHORIZED', message: '만료' }),
    );

    await expect(
      request('/api/auth/refresh', { method: 'POST', body: {}, auth: false }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 });

    expect(refreshFn).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
