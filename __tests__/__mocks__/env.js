// Jest 용 @env mock.
// react-native-dotenv 의 babel plugin 은 RN 빌드에만 적용되고 jest 환경에서는
// @env 모듈이 resolve 되지 않아 import 가 깨진다. config.ts 가 ?? '' 로 폴백하므로
// 모든 키를 undefined 로 반환해도 안전.
module.exports = {};
