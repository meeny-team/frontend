/**
 * Meeny - 카테고리 통계 API
 *
 * 백엔드 CategoryStatsResponse 를 매핑.
 *  - byCategory[].category: enum (FOOD) → lowercase (food)
 */

import { request, AuthApiError } from './http';
import { ApiResponse, PinCategory } from './schema';

type BackendCategory = 'FOOD' | 'CAFE' | 'SHOPPING' | 'TRANSPORT' | 'STAY' | 'ACTIVITY' | 'ETC';

interface BackendCategoryStat {
  category: BackendCategory;
  totalAmount: number;
  count: number;
  percentage: number;
}

interface BackendCategoryStats {
  totalAmount: number;
  totalCount: number;
  byCategory: BackendCategoryStat[];
}

export interface CategoryStat {
  category: PinCategory;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface CategoryStats {
  totalAmount: number;
  totalCount: number;
  byCategory: CategoryStat[];
}

function mapStats(b: BackendCategoryStats): CategoryStats {
  return {
    totalAmount: b.totalAmount,
    totalCount: b.totalCount,
    byCategory: b.byCategory.map(s => ({
      category: s.category.toLowerCase() as PinCategory,
      totalAmount: s.totalAmount,
      count: s.count,
      percentage: s.percentage,
    })),
  };
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

// 플레이 단위 카테고리 통계
export async function fetchPlayStats(playId: string): Promise<ApiResponse<CategoryStats | null>> {
  try {
    const data = await request<BackendCategoryStats>(`/api/plays/${playId}/stats`, { method: 'GET' });
    return { status: 200, data: mapStats(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 크루 단위 카테고리 통계. from/to 는 ISO LocalDateTime (예: "2026-01-01T00:00:00").
export async function fetchCrewStats(
  crewId: string,
  range?: { from?: string; to?: string },
): Promise<ApiResponse<CategoryStats | null>> {
  const params = new URLSearchParams();
  if (range?.from) params.append('from', range.from);
  if (range?.to) params.append('to', range.to);
  const qs = params.toString();
  try {
    const data = await request<BackendCategoryStats>(
      `/api/crews/${crewId}/stats${qs ? `?${qs}` : ''}`,
      { method: 'GET' },
    );
    return { status: 200, data: mapStats(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}
