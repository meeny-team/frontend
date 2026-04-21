/**
 * Play API
 */

import { Play, ApiResponse, CreatePlayRequest } from './schema';
import { plays, pins, CURRENT_USER } from './mock';
import { apiCall } from './client';
import { generateId } from './utils';

// 크루의 플레이 목록 조회
export async function fetchPlaysByCrewId(crewId: string): Promise<ApiResponse<Play[]>> {
  const crewPlays = plays.filter(p => p.crewId === crewId);
  return apiCall(crewPlays);
}

// 플레이 상세 조회
export async function fetchPlayById(playId: string): Promise<ApiResponse<Play | null>> {
  const play = plays.find(p => p.id === playId) || null;
  return apiCall(play);
}

// 새 플레이 생성
export async function createPlay(request: CreatePlayRequest): Promise<ApiResponse<Play>> {
  const newPlay: Play = {
    id: generateId('p'),
    crewId: request.crewId,
    title: request.title,
    type: request.type,
    dateRange: request.dateRange,
    region: request.region,
    coverImage: request.coverImage,
    members: request.members,
    tags: request.tags,
    createdBy: CURRENT_USER.id,
    createdAt: new Date().toISOString(),
  };

  plays.push(newPlay);
  return apiCall(newPlay, 500);
}

// 플레이 업데이트
export async function updatePlay(playId: string, request: Partial<CreatePlayRequest>): Promise<ApiResponse<Play | null>> {
  const play = plays.find(p => p.id === playId);

  if (!play) {
    return { status: 404, data: null, message: '플레이를 찾을 수 없습니다.' };
  }

  if (request.title) play.title = request.title;
  if (request.type) play.type = request.type;
  if (request.dateRange) play.dateRange = request.dateRange;
  if (request.region !== undefined) play.region = request.region;
  if (request.coverImage !== undefined) play.coverImage = request.coverImage;
  if (request.members) play.members = request.members;
  if (request.tags !== undefined) play.tags = request.tags;

  return apiCall(play, 500);
}

// 플레이 삭제
export async function deletePlay(playId: string): Promise<ApiResponse<boolean>> {
  const index = plays.findIndex(p => p.id === playId);

  if (index === -1) {
    return { status: 404, data: false, message: '플레이를 찾을 수 없습니다.' };
  }

  plays.splice(index, 1);
  return apiCall(true, 300);
}

// 플레이 총 금액 조회
export async function fetchPlayTotalAmount(playId: string): Promise<ApiResponse<number>> {
  const total = pins
    .filter(pin => pin.playId === playId)
    .reduce((sum, pin) => sum + pin.amount, 0);
  return apiCall(total);
}
