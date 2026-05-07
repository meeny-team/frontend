/**
 * Meeny Utilities
 * 포맷팅, ID 생성 헬퍼.
 *
 * 동기 getXxxById / getPlayTotalAmount 등 mock 기반 조회 함수는 화면이 모두
 * 백엔드 API 와 연결되면서 사용처가 사라져 제거됨. 필요 시 백엔드 호출
 * (fetchXxx) 를 사용.
 */

import { DateRange } from './schema';

// ============================================
// 포맷팅
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDateRange(dateRange: DateRange): string {
  const format = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (dateRange.end) {
    return `${format(dateRange.start)} - ${format(dateRange.end)}`;
  }
  return format(dateRange.start);
}

// ============================================
// ID 생성 (mock 시절 사용. 백엔드 연결 후 진짜 ID 는 백엔드가 발급)
// ============================================

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}`;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

// ============================================
// 이미지 URL 가드
// ============================================

// 이미지 업로드용 S3 가 아직 배포되지 않은 단계에서, 디바이스 로컬 경로(file://, content://)
// 가 그대로 백엔드 DB 에 저장되는 회귀를 막기 위한 가드.
// http(s) URL 만 백엔드로 전송 가능하다고 본다. S3 배포 이후엔 이 가드를 제거하고 업로드 흐름을 추가.
export function isUploadableImageUrl(uri: string | null | undefined): uri is string {
  if (!uri) return false;
  return uri.startsWith('http://') || uri.startsWith('https://');
}
