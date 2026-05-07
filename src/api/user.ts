/**
 * Meeny - User(Member) API
 *
 * 백엔드 /api/users/me 에 대응. 프로필 조회/수정/탈퇴.
 * 응답은 frontend 의 User 타입(id: string)으로 매핑한다.
 */

import { request, AuthApiError } from './http';
import { User, ApiResponse, UpdateUserRequest } from './schema';

interface BackendMemberProfile {
  id: number;
  nickname: string;
  email: string | null;
  profileImage: string | null;
  bio: string | null;
}

function mapUser(b: BackendMemberProfile): User {
  return {
    id: String(b.id),
    nickname: b.nickname,
    profileImage: b.profileImage ?? undefined,
    bio: b.bio ?? undefined,
  };
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

// 현재 로그인한 사용자 프로필 조회
export async function fetchCurrentUser(): Promise<ApiResponse<User | null>> {
  try {
    const data = await request<BackendMemberProfile>('/api/users/me', { method: 'GET' });
    return { status: 200, data: mapUser(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 현재 로그인한 사용자 프로필 수정
export async function updateCurrentUser(
  req: UpdateUserRequest,
): Promise<ApiResponse<User | null>> {
  try {
    const data = await request<BackendMemberProfile>('/api/users/me', {
      method: 'PATCH',
      body: req,
    });
    return { status: 200, data: mapUser(data), message: '프로필이 수정되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 회원 탈퇴
export async function withdrawCurrentUser(): Promise<ApiResponse<boolean>> {
  try {
    await request<void>('/api/users/me', { method: 'DELETE' });
    return { status: 204, data: true };
  } catch (err) {
    return toApiResponse(err, false);
  }
}
