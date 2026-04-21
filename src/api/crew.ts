/**
 * Crew API
 */

import { Crew, ApiResponse, CreateCrewRequest, UpdateCrewRequest } from './schema';
import { crews, CURRENT_USER } from './mock';
import { apiCall } from './client';
import { generateInviteCode, generateId } from './utils';

// 내 크루 목록 조회
export async function fetchMyCrews(): Promise<ApiResponse<Crew[]>> {
  const myCrews = crews.filter(c => c.members.includes(CURRENT_USER.id));
  return apiCall(myCrews);
}

// 크루 상세 조회
export async function fetchCrewById(crewId: string): Promise<ApiResponse<Crew | null>> {
  const crew = crews.find(c => c.id === crewId) || null;
  return apiCall(crew);
}

// 새 크루 생성
export async function createCrew(request: CreateCrewRequest): Promise<ApiResponse<Crew>> {
  const newCrew: Crew = {
    id: generateId('c'),
    name: request.name,
    members: [CURRENT_USER.id],
    inviteCode: generateInviteCode(),
    coverImage: request.coverImage,
    createdBy: CURRENT_USER.id,
    createdAt: new Date().toISOString(),
  };

  crews.push(newCrew);
  return apiCall(newCrew, 500);
}

// 크루 정보 업데이트
export async function updateCrew(crewId: string, request: UpdateCrewRequest): Promise<ApiResponse<Crew | null>> {
  const crew = crews.find(c => c.id === crewId);

  if (!crew) {
    return { status: 404, data: null, message: '크루를 찾을 수 없습니다.' };
  }

  if (request.name) crew.name = request.name;
  if (request.coverImage !== undefined) crew.coverImage = request.coverImage;

  return apiCall(crew, 500);
}

// 초대 코드로 크루 참여
export async function joinCrewByCode(inviteCode: string): Promise<ApiResponse<Crew | null>> {
  const crew = crews.find(c => c.inviteCode === inviteCode);

  if (!crew) {
    return { status: 404, data: null, message: '유효하지 않은 초대 코드입니다.' };
  }

  if (crew.members.includes(CURRENT_USER.id)) {
    return { status: 400, data: null, message: '이미 참여 중인 크루입니다.' };
  }

  crew.members.push(CURRENT_USER.id);
  return apiCall(crew, 500);
}

// 크루 탈퇴
export async function leaveCrew(crewId: string): Promise<ApiResponse<boolean>> {
  const crew = crews.find(c => c.id === crewId);

  if (!crew) {
    return { status: 404, data: false, message: '크루를 찾을 수 없습니다.' };
  }

  const index = crew.members.indexOf(CURRENT_USER.id);
  if (index > -1) {
    crew.members.splice(index, 1);
  }

  return apiCall(true, 300);
}

// 크루 삭제
export async function deleteCrew(crewId: string): Promise<ApiResponse<boolean>> {
  const index = crews.findIndex(c => c.id === crewId);

  if (index === -1) {
    return { status: 404, data: false, message: '크루를 찾을 수 없습니다.' };
  }

  crews.splice(index, 1);
  return apiCall(true, 300);
}
