/**
 * Meeny - Play API (백엔드 연결)
 *
 * 백엔드 PlayResponse 를 frontend Play 타입으로 매핑.
 *  - id/crewId/createdBy: number → string
 *  - memberIds(number[]) → members(string[])
 *  - type: enum (TRAVEL) → lowercase (travel)
 *  - regions(string[]) → region(string) — 첫 번째 값만 사용 (frontend 가 단일)
 */

import { request, AuthApiError } from './http';
import { Play, PlayType, ApiResponse, CreatePlayRequest } from './schema';

interface BackendDateRange {
  start: string; // ISO LocalDate
  end: string | null;
}

interface BackendMemberSummary {
  id: number;
  nickname: string;
  profileImage: string | null;
}

interface BackendPlayResponse {
  id: number;
  crewId: number;
  title: string;
  type: 'TRAVEL' | 'DATE' | 'HANGOUT' | 'DAILY' | 'ETC';
  dateRange: BackendDateRange;
  members: BackendMemberSummary[];
  regions: string[];
  tags: string[];
  coverImage: string | null;
  createdBy: number;
  createdAt: string;
}

function mapPlay(b: BackendPlayResponse): Play {
  return {
    id: String(b.id),
    crewId: String(b.crewId),
    title: b.title,
    type: b.type.toLowerCase() as PlayType,
    dateRange: {
      start: b.dateRange.start,
      end: b.dateRange.end ?? undefined,
    },
    members: b.members.map(m => ({
      id: String(m.id),
      nickname: m.nickname,
      profileImage: m.profileImage ?? undefined,
    })),
    region: b.regions[0] ?? undefined,
    tags: b.tags,
    coverImage: b.coverImage ?? undefined,
    createdBy: String(b.createdBy),
    createdAt: b.createdAt,
  };
}

interface BackendCreatePlayBody {
  crewId: number;
  title: string;
  type: string; // uppercase enum
  dateRange: { start: string; end?: string };
  memberIds: number[];
  regions: string[];
  tags: string[];
  coverImage?: string;
}

function toBackendBody(req: Partial<CreatePlayRequest> & { crewId?: string }): Partial<BackendCreatePlayBody> {
  const body: Partial<BackendCreatePlayBody> = {};
  if (req.crewId !== undefined) body.crewId = Number(req.crewId);
  if (req.title !== undefined) body.title = req.title;
  if (req.type !== undefined) body.type = req.type.toUpperCase();
  if (req.dateRange !== undefined) {
    body.dateRange = { start: req.dateRange.start, end: req.dateRange.end };
  }
  if (req.memberIds !== undefined) body.memberIds = req.memberIds.map(Number);
  if (req.region !== undefined) body.regions = req.region ? [req.region] : [];
  if (req.tags !== undefined) body.tags = req.tags;
  if (req.coverImage !== undefined) body.coverImage = req.coverImage;
  return body;
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

// 크루의 플레이 목록 조회
export async function fetchPlaysByCrewId(crewId: string): Promise<ApiResponse<Play[]>> {
  try {
    const data = await request<BackendPlayResponse[]>(`/api/crews/${crewId}/plays`, { method: 'GET' });
    return { status: 200, data: data.map(mapPlay) };
  } catch (err) {
    return toApiResponse(err, [] as Play[]);
  }
}

// 플레이 상세 조회
export async function fetchPlayById(playId: string): Promise<ApiResponse<Play | null>> {
  try {
    const data = await request<BackendPlayResponse>(`/api/plays/${playId}`, { method: 'GET' });
    return { status: 200, data: mapPlay(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 새 플레이 생성
export async function createPlay(req: CreatePlayRequest): Promise<ApiResponse<Play | null>> {
  try {
    const data = await request<BackendPlayResponse>('/api/plays', {
      method: 'POST',
      body: toBackendBody(req),
    });
    return { status: 200, data: mapPlay(data), message: '플레이가 생성되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 플레이 업데이트
export async function updatePlay(
  playId: string,
  req: Partial<CreatePlayRequest>,
): Promise<ApiResponse<Play | null>> {
  try {
    const data = await request<BackendPlayResponse>(`/api/plays/${playId}`, {
      method: 'PATCH',
      body: toBackendBody(req),
    });
    return { status: 200, data: mapPlay(data), message: '플레이가 수정되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 플레이 삭제
export async function deletePlay(playId: string): Promise<ApiResponse<boolean>> {
  try {
    await request<void>(`/api/plays/${playId}`, { method: 'DELETE' });
    return { status: 204, data: true };
  } catch (err) {
    return toApiResponse(err, false);
  }
}

// 플레이 총 결제 금액 — 백엔드의 settlement 응답에서 totalAmount 사용 (별도 엔드포인트 없음)
export async function fetchPlayTotalAmount(playId: string): Promise<ApiResponse<number>> {
  try {
    const data = await request<{ totalAmount: number }>(`/api/plays/${playId}/settlement`, {
      method: 'GET',
    });
    return { status: 200, data: data.totalAmount };
  } catch (err) {
    return toApiResponse(err, 0);
  }
}
