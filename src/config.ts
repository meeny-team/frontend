/**
 * Meeny - 환경 설정 모음
 *
 * 운영/개발 분기를 환경변수 없이 단순화하기 위해 한 곳에 모은다.
 * 추후 react-native-config 등으로 .env 분리할 때 이 파일을 진입점으로 둔다.
 */

import { Platform } from 'react-native';

// Android emulator는 호스트의 localhost를 10.0.2.2로 봐야 한다.
// iOS 시뮬레이터는 그대로 localhost.
// 실기기 테스트 시 같은 와이파이 PC의 IP로 직접 바꿔 사용.
export const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

// Google OAuth: ID token의 audience로 쓰이는 Web Client ID.
// 백엔드의 GOOGLE_CLIENT_IDS 에 이 값이 포함되어 있어야 audience 검증 통과.
export const GOOGLE_WEB_CLIENT_ID =
  '257431637052-18j21pbcm3dk5uldiatu0hi7t8l3ls0c.apps.googleusercontent.com';
