/**
 * Meeny Mock Data
 *
 * 화면들이 모두 백엔드 API(/api/crews, /api/plays, /api/pins) 와 연결됐음.
 * crews/plays/pins 더미 데이터는 더 이상 사용되지 않으므로 빈 배열로 둔다
 * (schema 타입 변경에 따른 형식 깨짐 회피 + 외부에서 참조 시 안전한 빈 값).
 *
 * users / CURRENT_USER 만 둘러보기(loginAsGuest) 진입용 mock 으로 유지.
 */

import { User, Crew, Play, Pin } from './schema';

// ============================================
// Users — 둘러보기(게스트) 모드 진입 시 mock user 표시용
// ============================================

export const CURRENT_USER_ID = 'u1';

export const users: User[] = [
  { id: 'u1', nickname: '지민', bio: '맛집 탐방러', profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
];

export const CURRENT_USER = users.find(u => u.id === CURRENT_USER_ID)!;

// ============================================
// Crews / Plays / Pins — 백엔드 연결 후 더 이상 mock 데이터 사용 안 함
// ============================================

export const crews: Crew[] = [];
export const plays: Play[] = [];
export const pins: Pin[] = [];
