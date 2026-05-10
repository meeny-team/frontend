/**
 * 순수 로직 테스트(api/auth)에서 react-native 의 native 의존을 우회하기 위한 stub.
 * Platform.OS 등 가벼운 상수만 사용하는 모듈을 위한 최소 표면.
 */

module.exports = {
  Platform: { OS: 'ios', select: (obj) => obj.ios ?? obj.default },
  NativeModules: {},
};
