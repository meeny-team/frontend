/**
 * @format
 */

// Sentry 초기화는 다른 모든 import 보다 먼저. 부트스트랩 중 에러까지 캡처하려면 최상단이어야 함.
import './src/sentry';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
