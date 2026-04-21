/**
 * User API
 */

import { User, ApiResponse, UpdateUserRequest } from './schema';
import { users, CURRENT_USER } from './mock';
import { apiCall } from './client';

// 현재 사용자 조회
export async function fetchCurrentUser(): Promise<ApiResponse<User>> {
  return apiCall(CURRENT_USER);
}

// 사용자 조회
export async function fetchUserById(userId: string): Promise<ApiResponse<User | null>> {
  const user = users.find(u => u.id === userId) || null;
  return apiCall(user);
}

// 여러 사용자 조회
export async function fetchUsersByIds(userIds: string[]): Promise<ApiResponse<User[]>> {
  const foundUsers = users.filter(u => userIds.includes(u.id));
  return apiCall(foundUsers);
}

// 현재 사용자 정보 업데이트
export async function updateCurrentUser(request: UpdateUserRequest): Promise<ApiResponse<User>> {
  const user = users.find(u => u.id === CURRENT_USER.id);
  if (user) {
    if (request.nickname) user.nickname = request.nickname;
    if (request.profileImage !== undefined) user.profileImage = request.profileImage;
    if (request.bio !== undefined) user.bio = request.bio;
  }
  return apiCall(CURRENT_USER, 500);
}
