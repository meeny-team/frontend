/**
 * Meeny - 환경 설정 모음
 *
 * 디폴트로 운영 backend (api.meeny.store) 를 본다. 시뮬레이터/실기기에서 별도 설정 없이 바로
 * 통합 동작 검증 가능. 로컬 backend 를 띄워 빠르게 반복 테스트할 때만 USE_LOCAL_BACKEND 를 켠다.
 * 시크릿(예: AWS access key)은 백엔드에 두고 클라이언트 환경변수로 노출하지 말 것.
 */

import { Platform } from 'react-native';

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

// Sentry DSN — 공개 식별자라 코드 하드코딩 OK. 비어 있으면 sentry.ts 가 자동으로 비활성화.
export const SENTRY_DSN =
  'https://9e40c608f97309a01ed9ae7940a7ed79@o4511488644481024.ingest.us.sentry.io/4511488645988352';
