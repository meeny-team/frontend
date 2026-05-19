/**
 * Meeny - Settlement API (백엔드 연결)
 *
 * /api/plays/{playId}/settlement
 *  - GET  : 현재 정산 현황 계산 (마감 전후 모두 호출 가능)
 *  - POST /close : 정산 마감 (모든 송금이 received 마킹된 경우만)
 *
 * /api/plays/{playId}/pins/{pinId}/transfers/{from}/{to}/{sent|received}
 *  - 송신자/수신자가 본인 시점에서 마킹. 응답은 갱신된 PlaySettlement.
 *
 * 백엔드 PlaySettlementResponse 를 frontend 가 쓰기 좋은 형태로 매핑.
 *  - memberId / fromMemberId / toMemberId / pinId: number → string
 *  - balance / totalPaid / totalShare / amount: long → number (그대로)
 *  - sentAt / receivedAt: ISO string | null
 */

import { request, AuthApiError } from './http';
import { ApiResponse } from './schema';

interface BackendMemberBalance {
  memberId: number;
  nickname: string;
  totalPaid: number;
  totalShare: number;
  balance: number; // totalPaid - totalShare. 양수=받을 돈, 음수=낼 돈
}

interface BackendTransfer {
  fromMemberId: number;
  fromNickname: string;
  toMemberId: number;
  toNickname: string;
  amount: number;
}

interface BackendPinTransfer {
  pinId: number;
  fromMemberId: number;
  fromNickname: string;
  toMemberId: number;
  toNickname: string;
  amount: number;
  sentAt: string | null;
  receivedAt: string | null;
}

interface BackendPlaySettlement {
  playId: number;
  settledAt: string | null;
  totalAmount: number;
  memberBalances: BackendMemberBalance[];
  transfers: BackendTransfer[];
  pinTransfers: BackendPinTransfer[];
}

export interface MemberBalance {
  memberId: string;
  nickname: string;
  totalPaid: number;
  totalShare: number;
  balance: number;
}

export interface SettlementTransfer {
  fromMemberId: string;
  fromNickname: string;
  toMemberId: string;
  toNickname: string;
  amount: number;
}

export interface PinTransfer {
  pinId: string;
  fromMemberId: string;
  fromNickname: string;
  toMemberId: string;
  toNickname: string;
  amount: number;
  sentAt: string | null;
  receivedAt: string | null;
}

export interface PlaySettlement {
  playId: string;
  settledAt: string | null;
  totalAmount: number;
  memberBalances: MemberBalance[];
  transfers: SettlementTransfer[];
  pinTransfers: PinTransfer[];
}

function mapSettlement(b: BackendPlaySettlement): PlaySettlement {
  return {
    playId: String(b.playId),
    settledAt: b.settledAt,
    totalAmount: b.totalAmount,
    memberBalances: b.memberBalances.map(mb => ({
      memberId: String(mb.memberId),
      nickname: mb.nickname,
      totalPaid: mb.totalPaid,
      totalShare: mb.totalShare,
      balance: mb.balance,
    })),
    transfers: b.transfers.map(t => ({
      fromMemberId: String(t.fromMemberId),
      fromNickname: t.fromNickname,
      toMemberId: String(t.toMemberId),
      toNickname: t.toNickname,
      amount: t.amount,
    })),
    pinTransfers: (b.pinTransfers ?? []).map(p => ({
      pinId: String(p.pinId),
      fromMemberId: String(p.fromMemberId),
      fromNickname: p.fromNickname,
      toMemberId: String(p.toMemberId),
      toNickname: p.toNickname,
      amount: p.amount,
      sentAt: p.sentAt,
      receivedAt: p.receivedAt,
    })),
  };
}

function toApiResponse<T>(err: unknown, fallback: T): ApiResponse<T> {
  if (err instanceof AuthApiError) {
    return { status: err.status, data: fallback, message: err.message };
  }
  return { status: 0, data: fallback, message: 'Network error' };
}

// 현재 정산 현황 계산
export async function fetchPlaySettlement(playId: string): Promise<ApiResponse<PlaySettlement | null>> {
  try {
    const data = await request<BackendPlaySettlement>(`/api/plays/${playId}/settlement`, {
      method: 'GET',
    });
    return { status: 200, data: mapSettlement(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 정산 마감 — 모든 송금이 received 마킹된 경우만 성공. 아니면 PLAY_NOT_SETTLEABLE.
export async function closePlaySettlement(
  playId: string,
): Promise<ApiResponse<PlaySettlement | null>> {
  try {
    const data = await request<BackendPlaySettlement>(`/api/plays/${playId}/settlement/close`, {
      method: 'POST',
    });
    return { status: 200, data: mapSettlement(data), message: '정산이 마감되었습니다.' };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

function transferUrl(playId: string, pinId: string, fromMemberId: string, toMemberId: string, suffix: 'sent' | 'received'): string {
  return `/api/plays/${playId}/pins/${pinId}/transfers/${fromMemberId}/${toMemberId}/${suffix}`;
}

// 송신자 "보냈음" 마킹 (idempotent). 권한: from = caller
export async function markPinTransferSent(
  playId: string,
  pinId: string,
  fromMemberId: string,
  toMemberId: string,
): Promise<ApiResponse<PlaySettlement | null>> {
  try {
    const data = await request<BackendPlaySettlement>(
      transferUrl(playId, pinId, fromMemberId, toMemberId, 'sent'),
      { method: 'POST' },
    );
    return { status: 200, data: mapSettlement(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 송신자 "보냈음" 취소. received 이후엔 거절(409).
export async function cancelPinTransferSent(
  playId: string,
  pinId: string,
  fromMemberId: string,
  toMemberId: string,
): Promise<ApiResponse<PlaySettlement | null>> {
  try {
    const data = await request<BackendPlaySettlement>(
      transferUrl(playId, pinId, fromMemberId, toMemberId, 'sent'),
      { method: 'DELETE' },
    );
    return { status: 200, data: mapSettlement(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}

// 수신자(paidBy) "받았음" 확인. sent 가 선행되어야 함(404 TRANSFER_NOT_FOUND).
export async function markPinTransferReceived(
  playId: string,
  pinId: string,
  fromMemberId: string,
  toMemberId: string,
): Promise<ApiResponse<PlaySettlement | null>> {
  try {
    const data = await request<BackendPlaySettlement>(
      transferUrl(playId, pinId, fromMemberId, toMemberId, 'received'),
      { method: 'POST' },
    );
    return { status: 200, data: mapSettlement(data) };
  } catch (err) {
    return toApiResponse(err, null);
  }
}
