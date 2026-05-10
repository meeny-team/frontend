/**
 * Meeny - Crew API (백엔드 연결)
 *
 * 백엔드 응답(CrewResponse) 을 frontend 의 Crew 타입으로 매핑해 반환.
 *  - id/createdBy: number → string (mock 시절 schema 와 호환)
 *  - memberIds → members
 *
 * 호출자(HomeScreen 등) 는 기존 mock API 와 같은 시그니처(ApiResponse<T>) 를 받으므로
 * 영향 최소.
 */

import { request, AuthApiError } from './http';
import { Crew, ApiResponse, CreateCrewRequest, UpdateCrewRequest } from './schema';

interface BackendMemberSummary {
  id: number;
  nickname: string;
  profileImage: string | null;
}

interface BackendCrewResponse {
  id: number;
  name: string;
  inviteCode: string;
  coverImage: string | null;
  createdBy: number;
  createdAt: string;
  members: BackendMemberSummary[];
}

function mapCrew(b: BackendCrewResponse): Crew {
  return {
    id: String(b.id),
    name: b.name,
    members: b.members.map(m => ({
      id: String(m.id),
      nickname: m.nickname,
      profileImage: m.profileImage ?? undefined,
    })),
    inviteCode: b.inviteCode,
    coverImage: b.coverImage ?? undefined,
    createdBy: String(b.createdBy),
    createdAt: b.createdAt,
  };
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

// 내 크루 목록 조회
export async function fetchMyCrews(): Promise<ApiResponse<Crew[]>> {
  try {
    const data = await request<BackendCrewResponse[]>('/api/crews', { method: 'GET' });
    return { status: 200, data: data.map(mapCrew) };
  } catch (err) {
    return toApiResponse(err, [] as Crew[]);
  }
}

// 크루 상세 조회 (멤버만)
export async function fetchCrewById(crewId: string): Promise<ApiResponse<Crew | null>> {
  try {
    const data = await request<BackendCrewResponse>(`/api/crews/${crewId}`, { method: 'GET' });
    return { status: 200, data: mapCrew(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 새 크루 생성 — 생성자가 자동으로 첫 멤버
export async function createCrew(req: CreateCrewRequest): Promise<ApiResponse<Crew | null>> {
  try {
    const data = await request<BackendCrewResponse>('/api/crews', {
      method: 'POST',
      body: req,
    });
    return { status: 200, data: mapCrew(data), message: '크루가 생성되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 크루 정보 수정 (생성자만)
export async function updateCrew(
  crewId: string,
  req: UpdateCrewRequest,
): Promise<ApiResponse<Crew | null>> {
  try {
    const data = await request<BackendCrewResponse>(`/api/crews/${crewId}`, {
      method: 'PATCH',
      body: req,
    });
    return { status: 200, data: mapCrew(data), message: '크루가 수정되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 초대 코드로 크루 참여
export async function joinCrewByCode(inviteCode: string): Promise<ApiResponse<Crew | null>> {
  try {
    const data = await request<BackendCrewResponse>('/api/crews/join', {
      method: 'POST',
      body: { inviteCode },
    });
    return { status: 200, data: mapCrew(data), message: '크루에 참여했습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 크루 탈퇴 (미정산 잔액 없어야 함)
export async function leaveCrew(crewId: string): Promise<ApiResponse<boolean>> {
  try {
    await request<void>(`/api/crews/${crewId}/me`, { method: 'DELETE' });
    return { status: 204, data: true };
  } catch (err) {
    return toApiResponse(err, false);
  }
}

// 백엔드에는 별도 크루 삭제 엔드포인트가 없음 — 호환을 위해 탈퇴(leave) 로 alias.
// 모든 멤버가 탈퇴하면 사실상 비어 있는 크루가 된다.
export async function deleteCrew(crewId: string): Promise<ApiResponse<boolean>> {
  return leaveCrew(crewId);
}
