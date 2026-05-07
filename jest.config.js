/**
 * Meeny - Jest 설정
 *
 * 두 개의 프로젝트로 나눔:
 *  - logic: 순수 TypeScript 로직 (api util/http, auth/session). node 환경에서 native 모듈 의존 없이 빠르게 돌림.
 *  - rn: 추후 RN 컴포넌트/훅 테스트용 자리. 현재는 비어 있고, native 모듈 mock 정리되면 활성화.
 *
 * 컴포넌트 스모크 테스트는 RNGestureHandlerModule 등 TurboModule 로드를 강제해 mock 정리 PR 전까지 보류.
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        // node 'current' 로 타겟해야 async/await 가 native 로 컴파일되어
        // regeneratorRuntime 의존이 사라진다.
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
        babelrc: false,
        configFile: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
    '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.js',
  },
  globals: {
    __DEV__: true,
  },
  clearMocks: true,
  resetModules: true,
};
