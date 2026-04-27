/**
 * Region API
 * 지역 데이터 관리 - 백엔드에서 동적으로 관리 가능
 */

import { ApiResponse, RegionGroup, DOMESTIC_REGIONS, OVERSEAS_REGIONS } from './schema';
import { apiCall } from './client';

// 국내 지역 목록 조회
// TODO: 백엔드 연동 시 실제 API 호출로 변경
export async function fetchDomesticRegions(): Promise<ApiResponse<RegionGroup[]>> {
  // 현재는 로컬 상수 사용, 백엔드 구현 후 API 호출로 변경
  return apiCall(DOMESTIC_REGIONS);
}

// 해외 지역 목록 조회
// TODO: 백엔드 연동 시 실제 API 호출로 변경
export async function fetchOverseasRegions(): Promise<ApiResponse<RegionGroup[]>> {
  // 현재는 로컬 상수 사용, 백엔드 구현 후 API 호출로 변경
  return apiCall(OVERSEAS_REGIONS);
}

// 전체 지역 목록 조회
export async function fetchAllRegions(): Promise<ApiResponse<{ domestic: RegionGroup[]; overseas: RegionGroup[] }>> {
  return apiCall({
    domestic: DOMESTIC_REGIONS,
    overseas: OVERSEAS_REGIONS,
  });
}

// 지역 검색
export async function searchRegions(query: string): Promise<ApiResponse<string[]>> {
  const lowerQuery = query.toLowerCase();
  const allRegions = [
    ...DOMESTIC_REGIONS.flatMap(g => g.regions.map(r => `${g.label} ${r}`)),
    ...OVERSEAS_REGIONS.flatMap(g => g.regions.map(r => `${g.label} ${r}`)),
  ];

  const results = allRegions.filter(region =>
    region.toLowerCase().includes(lowerQuery)
  );

  return apiCall(results);
}
