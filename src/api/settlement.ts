/**
 * Meeny - Settlement API (백엔드 연결)
 *
 * /api/plays/{playId}/settlement
 *  - GET  : 현재 정산 현황 계산 (마감 전후 모두 호출 가능)
 *  - POST /close : 정산 마감 (모든 멤버의 balance == 0 일 때만 가능)
 *
 * 백엔드 PlaySettlementResponse 를 frontend 가 쓰기 좋은 형태로 매핑.
 *  - memberId / fromMemberId / toMemberId: number → string
 *  - balance / totalPaid / totalShare / amount: long → number (그대로)
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

interface BackendPlaySettlement {
  playId: number;
  settledAt: string | null;
  totalAmount: number;
  memberBalances: BackendMemberBalance[];
  transfers: BackendTransfer[];
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

export interface PlaySettlement {
  playId: string;
  settledAt: string | null;
  totalAmount: number;
  memberBalances: MemberBalance[];
  transfers: SettlementTransfer[];
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

// 정산 마감 — 모든 멤버 balance == 0 인 경우만 성공. 아니면 PLAY_NOT_SETTLEABLE.
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
