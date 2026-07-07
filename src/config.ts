/**
 * Meeny - 환경 설정 모음
 *
 * 디폴트로 운영 backend (api.meeny.store) 를 본다. 시뮬레이터/실기기에서 별도 설정 없이 바로
 * 통합 동작 검증 가능. 로컬 backend 를 띄워 빠르게 반복 테스트할 때만 USE_LOCAL_BACKEND 를 켠다.
 * 시크릿(예: AWS access key)은 백엔드에 두고 클라이언트 환경변수로 노출하지 말 것.
 */

import { Platform } from 'react-native';
import {
  SENTRY_DSN as ENV_SENTRY_DSN,
  POSTHOG_KEY as ENV_POSTHOG_KEY,
  POSTHOG_HOST as ENV_POSTHOG_HOST,
} from '@env';

const PROD_API_BASE_URL = 'https://api.meeny.store';

// Android emulator는 호스트의 localhost를 10.0.2.2로 봐야 한다.
// iOS 시뮬레이터는 그대로 localhost.
// 실기기 테스트 시 같은 와이파이 PC의 IP로 직접 바꿔 사용.
const DEV_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

// 로컬 backend (./gradlew bootRun) 띄워서 빠르게 반복 테스트할 때만 true 로. 평소엔 false.
const USE_LOCAL_BACKEND = false;

export const API_BASE_URL =
  __DEV__ && USE_LOCAL_BACKEND ? DEV_API_BASE_URL : PROD_API_BASE_URL;

// Google OAuth: ID token의 audience로 쓰이는 Web Client ID.
// 백엔드의 GOOGLE_CLIENT_IDS 에 이 값이 포함되어 있어야 audience 검증 통과.
// 참고: client ID 는 secret 이 아닌 공개 식별자다. 환경별로 다른 ID 가 필요해지면 __DEV__ 로 분기.
export const GOOGLE_WEB_CLIENT_ID =
  '257431637052-18j21pbcm3dk5uldiatu0hi7t8l3ls0c.apps.googleusercontent.com';

// Sentry DSN — .env 의 SENTRY_DSN 를 빌드타임에 주입 (react-native-dotenv).
// 비어 있으면 sentry.ts 가 자동으로 비활성화. 환경별로 다른 DSN 쓰고 싶으면 .env 만 갈아끼우면 됨.
export const SENTRY_DSN = ENV_SENTRY_DSN ?? '';

// PostHog — .env 의 POSTHOG_KEY 를 빌드타임에 주입. 비어 있으면 analytics 모듈이 자동 no-op.
// HOST 는 EU 클라우드 / self-hosted 등 위치별로 다름. 미지정 시 US 기본.
export const POSTHOG_KEY = ENV_POSTHOG_KEY ?? '';
export const POSTHOG_HOST = ENV_POSTHOG_HOST ?? 'https://us.i.posthog.com';
