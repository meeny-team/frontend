/**
 * Meeny - Pin API (백엔드 연결)
 *
 * 백엔드 PinResponse 를 frontend Pin 타입으로 매핑.
 *  - id/playId/authorId/settlement.paidBy/splits.userId: number → string
 *  - category: enum (FOOD) → lowercase (food)
 *  - 백엔드는 settlement / splits 분리, frontend Settlement 안에 splits 가 nested → 병합
 */

import { request, AuthApiError } from './http';
import { Pin, PinCategory, ApiResponse, CreatePinRequest } from './schema';

interface BackendSettlement {
  type: 'EQUAL' | 'CUSTOM';
  paidBy: number;
}

interface BackendSplit {
  userId: number;
  amount: number;
}

interface BackendPinResponse {
  id: number;
  playId: number;
  authorId: number;
  amount: number;
  category: 'FOOD' | 'CAFE' | 'SHOPPING' | 'TRANSPORT' | 'STAY' | 'ACTIVITY' | 'ETC';
  title: string;
  memo: string | null;
  location: string | null;
  images: string[] | null;
  settlement: BackendSettlement;
  splits: BackendSplit[];
  createdAt: string;
}

function mapPin(b: BackendPinResponse): Pin {
  return {
    id: String(b.id),
    playId: String(b.playId),
    authorId: String(b.authorId),
    amount: b.amount,
    category: b.category.toLowerCase() as PinCategory,
    title: b.title,
    memo: b.memo ?? undefined,
    location: b.location ?? undefined,
    images: b.images ?? undefined,
    settlement: {
      type: b.settlement.type.toLowerCase() as 'equal' | 'custom',
      paidBy: String(b.settlement.paidBy),
      splits: b.splits.map(s => ({ userId: String(s.userId), amount: s.amount })),
    },
    createdAt: b.createdAt,
  };
}

// frontend CreatePinRequest 의 settlement(splits 포함) 를 백엔드의 분리된 형태로 변환
function toBackendBody(
  req: Partial<CreatePinRequest>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (req.playId !== undefined) body.playId = Number(req.playId);
  if (req.amount !== undefined) body.amount = req.amount;
  if (req.category !== undefined) body.category = req.category.toUpperCase();
  if (req.title !== undefined) body.title = req.title;
  if (req.memo !== undefined) body.memo = req.memo;
  if (req.location !== undefined) body.location = req.location;
  if (req.images !== undefined) body.images = req.images;
  if (req.settlement !== undefined) {
    body.settlement = {
      type: req.settlement.type.toUpperCase(),
      paidBy: Number(req.settlement.paidBy),
    };
    body.splits = req.settlement.splits.map(s => ({
      userId: Number(s.userId),
      amount: s.amount,
    }));
  }
  return body;
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

// 플레이의 핀 목록 조회
export async function fetchPinsByPlayId(playId: string): Promise<ApiResponse<Pin[]>> {
  try {
    const data = await request<BackendPinResponse[]>(`/api/plays/${playId}/pins`, { method: 'GET' });
    return { status: 200, data: data.map(mapPin) };
  } catch (err) {
    return toApiResponse(err, [] as Pin[]);
  }
}

// 핀 상세 조회
export async function fetchPinById(pinId: string): Promise<ApiResponse<Pin | null>> {
  try {
    const data = await request<BackendPinResponse>(`/api/pins/${pinId}`, { method: 'GET' });
    return { status: 200, data: mapPin(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 새 핀 생성
export async function createPin(req: CreatePinRequest): Promise<ApiResponse<Pin | null>> {
  try {
    const data = await request<BackendPinResponse>('/api/pins', {
      method: 'POST',
      body: toBackendBody(req),
    });
    return { status: 200, data: mapPin(data), message: '핀이 생성되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 핀 업데이트
export async function updatePin(
  pinId: string,
  req: Partial<CreatePinRequest>,
): Promise<ApiResponse<Pin | null>> {
  try {
    const data = await request<BackendPinResponse>(`/api/pins/${pinId}`, {
      method: 'PATCH',
      body: toBackendBody(req),
    });
    return { status: 200, data: mapPin(data), message: '핀이 수정되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 핀 삭제
export async function deletePin(pinId: string): Promise<ApiResponse<boolean>> {
  try {
    await request<void>(`/api/pins/${pinId}`, { method: 'DELETE' });
    return { status: 204, data: true };
  } catch (err) {
    return toApiResponse(err, false);
  }
}
