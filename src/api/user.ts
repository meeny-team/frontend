/**
 * User API
 */

import { User, ApiResponse, UpdateUserRequest } from './schema';
import { users, CURRENT_USER } from './mock';
import { apiCall, apiRequest } from './client';

export async function fetchMe(): Promise<User> {
  return apiRequest<User>('/api/users/me');
}

export async function updateMe(request: UpdateUserRequest): Promise<User> {
  return apiRequest<User>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export async function withdrawMe(): Promise<void> {
  await apiRequest<void>('/api/users/me', { method: 'DELETE' });
}

// === 아래는 mock (다른 도메인 백엔드 연동 전까지 유지) ===

export async function fetchUserById(userId: string): Promise<ApiResponse<User | null>> {
  const user = users.find(u => u.id === userId) || null;
  return apiCall(user);
}

export async function fetchUsersByIds(userIds: string[]): Promise<ApiResponse<User[]>> {
  const foundUsers = users.filter(u => userIds.includes(u.id));
  return apiCall(foundUsers);
}

// 레거시 alias - 신규 코드에서는 fetchMe 사용
export async function fetchCurrentUser(): Promise<ApiResponse<User>> {
  return apiCall(CURRENT_USER);
}

// 레거시 alias - 신규 코드에서는 updateMe 사용
export async function updateCurrentUser(request: UpdateUserRequest): Promise<ApiResponse<User>> {
  const user = users.find(u => u.id === CURRENT_USER.id);
  if (user) {
    if (request.nickname) user.nickname = request.nickname;
    if (request.profileImage !== undefined) user.profileImage = request.profileImage;
    if (request.bio !== undefined) user.bio = request.bio;
  }
  return apiCall(CURRENT_USER, 500);
}
