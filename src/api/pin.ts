/**
 * Pin API
 */

import { Pin, ApiResponse, CreatePinRequest } from './schema';
import { pins, CURRENT_USER } from './mock';
import { apiCall } from './client';
import { generateId } from './utils';

// 플레이의 핀 목록 조회
export async function fetchPinsByPlayId(playId: string): Promise<ApiResponse<Pin[]>> {
  const playPins = pins.filter(p => p.playId === playId);
  return apiCall(playPins);
}

// 핀 상세 조회
export async function fetchPinById(pinId: string): Promise<ApiResponse<Pin | null>> {
  const pin = pins.find(p => p.id === pinId) || null;
  return apiCall(pin);
}

// 새 핀 생성
export async function createPin(request: CreatePinRequest): Promise<ApiResponse<Pin>> {
  const newPin: Pin = {
    id: generateId('pin'),
    playId: request.playId,
    authorId: CURRENT_USER.id,
    amount: request.amount,
    category: request.category,
    title: request.title,
    memo: request.memo,
    location: request.location,
    images: request.images,
    settlement: request.settlement,
    createdAt: new Date().toISOString(),
  };

  pins.push(newPin);
  return apiCall(newPin, 500);
}

// 핀 업데이트
export async function updatePin(pinId: string, request: Partial<CreatePinRequest>): Promise<ApiResponse<Pin | null>> {
  const pin = pins.find(p => p.id === pinId);

  if (!pin) {
    return { status: 404, data: null, message: '핀을 찾을 수 없습니다.' };
  }

  if (request.amount !== undefined) pin.amount = request.amount;
  if (request.category) pin.category = request.category;
  if (request.title) pin.title = request.title;
  if (request.memo !== undefined) pin.memo = request.memo;
  if (request.location !== undefined) pin.location = request.location;
  if (request.images !== undefined) pin.images = request.images;
  if (request.settlement) pin.settlement = request.settlement;

  return apiCall(pin, 500);
}

// 핀 삭제
export async function deletePin(pinId: string): Promise<ApiResponse<boolean>> {
  const index = pins.findIndex(p => p.id === pinId);

  if (index === -1) {
    return { status: 404, data: false, message: '핀을 찾을 수 없습니다.' };
  }

  pins.splice(index, 1);
  return apiCall(true, 300);
}
