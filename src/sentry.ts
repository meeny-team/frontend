/**
 * Sentry 초기화 — 앱 진입점(index.js) 최상단에서 import 되어
 * 다른 코드보다 먼저 실행돼야 한다. (그래야 부트스트랩 중 발생한
 * 에러까지 캡처됨)
 *
 * DSN 은 공개 식별자라 코드에 박아도 무방하다 — 단, 환경별 빌드는
 * SENTRY_DSN 환경변수로도 덮어쓸 수 있게 두었다.
 */
import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from './config';

const isProd = !__DEV__;

Sentry.init({
  dsn: SENTRY_DSN,
  // dev 빌드는 Sentry 로 안 보냄 (로컬 노이즈 차단)
  enabled: isProd && SENTRY_DSN.length > 0,
  environment: isProd ? 'production' : 'development',
  // refresh 토큰, JWT 같은 PII 가 자동 첨부되지 않도록 보수적으로
  sendDefaultPii: false,
  // 트레이스 샘플링 — 1인 운영이라 트래픽 적어서 10% 면 충분, 무료 quota 보호
  tracesSampleRate: 0.1,
  // 정상 사용자 액션 breadcrumb 은 켜두고, console 은 dev 만 의미있어서 끔
  enableNativeCrashHandling: true,
  attachStacktrace: true,
  // 민감 데이터 스크럽 — Authorization 헤더, 토큰 값 제거
  beforeSend(event) {
    if (event.request?.headers) {
      delete (event.request.headers as Record<string, string>).Authorization;
      delete (event.request.headers as Record<string, string>).authorization;
    }
    return event;
  },
  beforeBreadcrumb(breadcrumb) {
    // 네트워크 응답 본문에 토큰 등이 섞이는 걸 막기 위해 data.response_body_size 정도만 남김
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      if (breadcrumb.data) {
        delete (breadcrumb.data as Record<string, unknown>).response_body;
        delete (breadcrumb.data as Record<string, unknown>).request_body;
      }
    }
    return breadcrumb;
  },
});

/**
 * Sentry user context 를 세션 상태와 동기화한다.
 *
 * - id 만 첨부 (email/nickname 은 PII 정책상 제외)
 * - is_guest 태그로 게스트 공유 계정 이벤트를 필터링할 수 있게 함
 * - null 이면 클리어 — 로그아웃/세션 만료 시 이전 사용자로 잘못 붙지 않도록
 *
 * AuthProvider 의 로그인/로그아웃/세션만료 훅에서 호출한다.
 */
export function setSentryUser(id: string | number | null, isGuest = false): void {
  if (id === null || id === undefined) {
    Sentry.setUser(null);
    Sentry.setTag('is_guest', null);
    return;
  }
  Sentry.setUser({ id: String(id) });
  Sentry.setTag('is_guest', isGuest ? 'true' : 'false');
}
