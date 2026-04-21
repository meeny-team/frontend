/**
 * Kakao Local API
 * 장소 검색 (키워드 검색)
 */

// TODO: 배포 전 백엔드 프록시로 변경 필요
// 환경 변수에서 API 키 로드 (react-native-config 또는 .env 사용)
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || '';

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  phone?: string;
}

export interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

/**
 * 키워드로 장소 검색
 */
export async function searchPlaces(query: string, page: number = 1): Promise<KakaoPlace[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&page=${page}&size=10`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Kakao API error:', response.status);
      return [];
    }

    const data: KakaoSearchResponse = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Kakao search error:', error);
    return [];
  }
}

/**
 * 현재 위치 기준 주변 장소 검색
 */
export async function searchNearbyPlaces(
  query: string,
  latitude: number,
  longitude: number,
  radius: number = 1000
): Promise<KakaoPlace[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${longitude}&y=${latitude}&radius=${radius}&page=1&size=10`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Kakao API error:', response.status);
      return [];
    }

    const data: KakaoSearchResponse = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Kakao search error:', error);
    return [];
  }
}
