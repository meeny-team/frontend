/**
 * Meeny - Activity Log API (백엔드 연결)
 *
 * /api/crews/{crewId}/activities?limit=50
 *  - 크루 멤버만 조회 가능. 최신순 N 건. 시스템 발생 활동은 actor null, 탈퇴자는 마스킹 닉네임.
 *
 * payload 는 type 별로 다른 구조의 객체 — 화면 렌더 시 type 기준으로 필드 접근.
 */

import { request, AuthApiError } from './http';
import { ApiResponse } from './schema';

export type ActivityType =
  | 'CREW_JOINED'
  | 'MEMBER_LEFT'
  | 'PLAY_CREATED'
  | 'PLAY_SETTLED'
  | 'PIN_ADDED'
  | 'PIN_UPDATED'
  | 'PIN_DELETED'
  | 'TRANSFER_SENT'
  | 'TRANSFER_RECEIVED';

export interface ActivityActor {
  memberId: string;
  nickname: string;
  profileImage: string | null;
}

// payload 는 type 별로 다른 키를 가짐 — 알려진 키만 옵셔널로 선언, 그 외는 fallback unknown 처리
export interface ActivityPayload {
  playId?: number | string;
  playTitle?: string;
  pinId?: number | string;
  pinTitle?: string;
  amount?: number;
  fromMemberId?: number | string;
  toMemberId?: number | string;
  [k: string]: unknown;
}

export interface Activity {
  id: string;
  type: ActivityType;
  actor: ActivityActor | null;
  payload: ActivityPayload | null;
  createdAt: string;
}

interface BackendActor {
  memberId: number;
  nickname: string;
  profileImage: string | null;
}

interface BackendActivity {
  id: number;
  type: ActivityType;
  actor: BackendActor | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

function mapActivity(a: BackendActivity): Activity {
  return {
    id: String(a.id),
    type: a.type,
    actor: a.actor
      ? {
          memberId: String(a.actor.memberId),
          nickname: a.actor.nickname,
          profileImage: a.actor.profileImage,
        }
      : null,
    payload: (a.payload ?? null) as ActivityPayload | null,
    createdAt: a.createdAt,
  };
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

export async function fetchCrewActivities(
  crewId: string,
  limit: number = 50,
): Promise<ApiResponse<Activity[]>> {
  try {
    const data = await request<BackendActivity[]>(
      `/api/crews/${crewId}/activities?limit=${limit}`,
      { method: 'GET' },
    );
    return { status: 200, data: data.map(mapActivity) };
  } catch (err) {
    return toApiResponse(err, [] as Activity[]);
  }
}
