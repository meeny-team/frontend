/**
 * Meeny - 환경 설정 모음
 *
 * 빌드 타임에 __DEV__ 로 dev/release 분기. release 빌드 전 PROD_API_BASE_URL 을 운영 도메인으로 교체.
 * 시크릿(예: AWS access key)은 백엔드에 두고 클라이언트 환경변수로 노출하지 말 것.
 */

import { Platform } from 'react-native';

// release 빌드(__DEV__ === false) 시 사용. 운영 도메인이 확정되면 교체.
const PROD_API_BASE_URL = 'https://api.meeny.app';

// Android emulator는 호스트의 localhost를 10.0.2.2로 봐야 한다.
// iOS 시뮬레이터는 그대로 localhost.
// 실기기 테스트 시 같은 와이파이 PC의 IP로 직접 바꿔 사용.
const DEV_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_BASE_URL = __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL;

// Google OAuth: ID token의 audience로 쓰이는 Web Client ID.
// 백엔드의 GOOGLE_CLIENT_IDS 에 이 값이 포함되어 있어야 audience 검증 통과.
// 참고: client ID 는 secret 이 아닌 공개 식별자다. 환경별로 다른 ID 가 필요해지면 __DEV__ 로 분기.
export const GOOGLE_WEB_CLIENT_ID =
  '257431637052-18j21pbcm3dk5uldiatu0hi7t8l3ls0c.apps.googleusercontent.com';
