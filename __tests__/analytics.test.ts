/**
 * analytics 헬퍼 테스트.
 *
 * 정책 invariant:
 *  - dev 빌드에서는 이벤트 전송 X (전역 __DEV__=true)
 *  - 로그인 전 (distinctId null) 상태는 no-op
 *  - 게스트 세션은 no-op
 *  - PII 를 담지 않는지 — properties 는 명시적 필드만
 */

// 이 파일은 __DEV__ true 인 jest 환경에서 실행되므로
// analytics.ts 는 자동 비활성 상태다. enabled 를 강제로 열기 위해
// config 를 mock 해 POSTHOG_KEY 를 채우고 __DEV__ 를 false 로 만든다.
//
// jest.config 의 resetModules:true 로 매 테스트마다 모듈이 새로 로드되므로
// 각 테스트가 시작될 때 __DEV__=false 를 세팅한 뒤 require 로 다시 로드해야
// 최신 값이 반영된다.

jest.mock('../src/config', () => ({
  POSTHOG_KEY: 'phc_TESTKEY',
  POSTHOG_HOST: 'https://us.i.posthog.com',
  API_BASE_URL: 'http://localhost:8080',
  GOOGLE_WEB_CLIENT_ID: 'x',
  SENTRY_DSN: '',
}));

let captureEvent: typeof import('../src/analytics').captureEvent;
let identifyUser: typeof import('../src/analytics').identifyUser;
let resetUser: typeof import('../src/analytics').resetUser;
let fetchMock: jest.Mock;

beforeEach(() => {
  (globalThis as { __DEV__: boolean }).__DEV__ = false;
  fetchMock = jest.fn().mockResolvedValue({ ok: true });
  (globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  const mod = require('../src/analytics');
  captureEvent = mod.captureEvent;
  identifyUser = mod.identifyUser;
  resetUser = mod.resetUser;
});

afterEach(() => {
  (globalThis as { __DEV__: boolean }).__DEV__ = true;
});

describe('captureEvent', () => {
  test('로그인 전 (distinctId 없음) 은 no-op', () => {
    captureEvent('crew_create');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('게스트 세션은 no-op', () => {
    identifyUser(42, true);
    captureEvent('crew_create');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('정상 유저 세션 → POST /capture/ 호출', () => {
    identifyUser(42, false);
    captureEvent('crew_create', { has_cover_image: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://us.i.posthog.com/capture/');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.event).toBe('crew_create');
    expect(body.distinct_id).toBe('42');
    expect(body.api_key).toBe('phc_TESTKEY');
    expect(body.properties.has_cover_image).toBe(true);
    expect(body.properties.$lib).toBe('meeny-app');
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('id 는 항상 문자열로 변환 (숫자/문자 모두 허용)', () => {
    identifyUser('user-abc', false);
    captureEvent('login_success');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.distinct_id).toBe('user-abc');
  });

  test('resetUser 이후는 no-op', () => {
    identifyUser(42, false);
    resetUser();
    captureEvent('crew_create');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('fetch 실패해도 예외를 던지지 않음 (fire-and-forget)', async () => {
    identifyUser(42, false);
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    expect(() => captureEvent('crew_create')).not.toThrow();
    // catch 가 붙어 있어 unhandled rejection 도 없어야 함
    await new Promise(r => setImmediate(r));
  });
});
