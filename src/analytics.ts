/**
 * Meeny - Analytics (PostHog capture HTTP endpoint)
 *
 * SDK 대신 raw fetch 로 PostHog `/capture/` 엔드포인트를 호출한다.
 * SDK 는 expo-device / expo-application 등 무거운 peer dep 을 요구하는데,
 * 이 앱에 필요한 건 login / crew_create / pin_create / settlement_close /
 * settlement_share 5개 이벤트 뿐이라 소형 어댑터로 충분.
 *
 * 정책:
 *  - dev 빌드는 no-op (로컬 통계 오염 방지)
 *  - POSTHOG_KEY 미설정이면 no-op
 *  - fire-and-forget — 이벤트 실패가 앱 흐름을 절대 방해하지 않도록 catch + 조용히 무시
 *  - distinct_id 는 로그인 후 서버 memberId. 로그인 전 이벤트는 발생시키지 않는다
 *    (앱 사용자는 로그인 후에만 의미있는 액션을 하므로)
 *  - PII 는 담지 않는다 — email/nickname 은 절대 프로퍼티에 넣지 말 것
 */

import { POSTHOG_HOST, POSTHOG_KEY } from './config';

const isProd = !__DEV__;
const enabled = isProd && POSTHOG_KEY.length > 0;

let currentDistinctId: string | null = null;
let currentIsGuest = false;

export type MeenyEvent =
  | 'login_success'
  | 'crew_create'
  | 'pin_create'
  | 'settlement_close'
  | 'settlement_share';

/**
 * 로그인 성공/세션 복원 시 호출. Sentry.setUser 와 동일한 지점.
 * id 는 문자열/숫자 모두 허용 (MemberProfile.id: number / User.id: string).
 */
export function identifyUser(id: string | number, isGuest: boolean): void {
  currentDistinctId = String(id);
  currentIsGuest = isGuest;
}

/**
 * 로그아웃 / 세션 만료 시 호출. 이후 capture 는 no-op (distinctId 없음).
 */
export function resetUser(): void {
  currentDistinctId = null;
  currentIsGuest = false;
}

/**
 * 이벤트 캡처. fire-and-forget — 실패는 조용히 무시.
 * 게스트 세션은 스킵 (공유 데모 계정 활동이 실제 사용자 통계를 오염시키지 않도록).
 */
export function captureEvent(name: MeenyEvent, properties?: Record<string, unknown>): void {
  if (!enabled) return;
  if (!currentDistinctId) return;
  if (currentIsGuest) return;

  const body = {
    api_key: POSTHOG_KEY,
    event: name,
    distinct_id: currentDistinctId,
    timestamp: new Date().toISOString(),
    properties: {
      $lib: 'meeny-app',
      ...properties,
    },
  };

  // 15s timeout — 이벤트가 앱 리소스를 오래 붙잡지 않도록
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .catch(() => {
      /* fire-and-forget */
    })
    .finally(() => clearTimeout(timer));
}
