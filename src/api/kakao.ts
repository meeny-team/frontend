/**
 * Place Search API
 *
 * 백엔드 /api/places/search 프록시 경유 — 카카오 REST API 키는 서버에서만 보유.
 * 인증된 호출이므로 http.request() 가 access token 첨부 + 401 자동 refresh 처리.
 */

import { request, AuthApiError } from './http';

// 백엔드 PlaceResponse 와 동일 모양. snake_case 필드 (place_name 등) 는 더 이상 노출하지 않음.
export interface KakaoPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string | null;
  latitude: number;
  longitude: number;
}

interface BackendCoordinate {
  latitude?: number;
  longitude?: number;
  radius?: number;
}

async function searchByQuery(
  query: string,
  page: number,
  coord?: BackendCoordinate,
): Promise<KakaoPlace[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({ query, page: String(page) });
  if (coord?.latitude !== undefined && coord?.longitude !== undefined) {
    params.set('latitude', String(coord.latitude));
    params.set('longitude', String(coord.longitude));
    if (coord.radius !== undefined) params.set('radius', String(coord.radius));
  }

  try {
    return await request<KakaoPlace[]>(`/api/places/search?${params.toString()}`, {
      method: 'GET',
    });
  } catch (err) {
    if (err instanceof AuthApiError) {
      console.warn('[places] search failed:', err.code, err.message);
    } else {
      console.warn('[places] network error');
    }
    return [];
  }
}

// 키워드 검색 (전국)
export async function searchPlaces(query: string, page: number = 1): Promise<KakaoPlace[]> {
  return searchByQuery(query, page, undefined);
}

// 좌표 기반 반경 검색
export async function searchNearbyPlaces(
  query: string,
  latitude: number,
  longitude: number,
  radius: number = 1000,
): Promise<KakaoPlace[]> {
  return searchByQuery(query, 1, { latitude, longitude, radius });
}
