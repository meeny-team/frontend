/**
 * Meeny API Client
 * Mock API layer - 실제 백엔드 없이 더미 데이터로 동작
 */

import { ApiResponse } from './schema';

// 네트워크 지연 시뮬레이션
const delay = (ms: number = 300) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

// 기본 API 호출 래퍼
export async function apiCall<T>(
  mockData: T,
  delayMs: number = 300
): Promise<ApiResponse<T>> {
  await delay(delayMs);
  return {
    status: 200,
    data: mockData,
  };
}

// 에러 응답 생성
export function apiError(message: string, status: number = 400): ApiResponse<null> {
  return {
    status,
    data: null,
    message,
  };
}
