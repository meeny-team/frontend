/**
 * setSentryUser 헬퍼 — Sentry.setUser / setTag 를 세션 상태와 동기화하는지 검증.
 *
 * Sentry init 자체는 이 모듈 최상단에서 실행되므로 mock 을 먼저 세팅해야 한다.
 */

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
}));

import * as Sentry from '@sentry/react-native';
import { setSentryUser } from '../src/sentry';

describe('setSentryUser', () => {
  beforeEach(() => {
    (Sentry.setUser as jest.Mock).mockClear();
    (Sentry.setTag as jest.Mock).mockClear();
  });

  test('id 세팅 시 문자열 id 로 setUser 호출 + is_guest=false 태그', () => {
    setSentryUser(42);
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: '42' });
    expect(Sentry.setTag).toHaveBeenCalledWith('is_guest', 'false');
  });

  test('게스트 로그인 시 is_guest=true 태그', () => {
    setSentryUser(7, true);
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: '7' });
    expect(Sentry.setTag).toHaveBeenCalledWith('is_guest', 'true');
  });

  test('null 은 setUser(null) + tag 클리어', () => {
    setSentryUser(null);
    expect(Sentry.setUser).toHaveBeenCalledWith(null);
    expect(Sentry.setTag).toHaveBeenCalledWith('is_guest', null);
  });

  test('string id 도 그대로 문자열로 전달', () => {
    setSentryUser('abc-123');
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'abc-123' });
  });

  test('email/nickname 등 PII 는 절대 첨부하지 않음', () => {
    setSentryUser(1);
    const callArgs = (Sentry.setUser as jest.Mock).mock.calls[0][0];
    expect(Object.keys(callArgs)).toEqual(['id']);
  });
});
