/**
 * 테스트 부트스트랩
 *  - 글로벌 fetch 를 jest.fn 으로 박아 두면 각 테스트가 mockResolvedValueOnce 로 응답을 주입.
 *  - API_BASE_URL 의존을 위해 ../config 의 export 를 직접 쓰는 모듈은 별도 mock 불필요(고정 문자열).
 */

if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = jest.fn();
}
