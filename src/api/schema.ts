/**
 * Meeny API Schema
 * 백엔드 데이터 모델 정의
 */

// ============================================
// 공통
// ============================================

export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
}

// ============================================
// User
// ============================================

export interface User {
  id: string;
  nickname: string;
  profileImage?: string;
  bio?: string;
}

export interface UpdateUserRequest {
  nickname?: string;
  profileImage?: string;
  bio?: string;
}

// ============================================
// Crew
// ============================================

export interface Crew {
  id: string;
  name: string;
  members: string[];
  inviteCode: string;
  coverImage?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateCrewRequest {
  name: string;
  coverImage?: string;
}

export interface UpdateCrewRequest {
  name?: string;
  coverImage?: string;
}

// ============================================
// Play
// ============================================

export type PlayType = 'travel' | 'date' | 'hangout' | 'daily' | 'etc';

export interface DateRange {
  start: string;
  end?: string;
}

export interface Play {
  id: string;
  crewId: string;
  title: string;
  type: PlayType;
  dateRange: DateRange;
  region?: string;
  coverImage?: string;
  members: string[];
  tags?: string[];
  createdBy: string;
  createdAt: string;
}

export interface CreatePlayRequest {
  crewId: string;
  title: string;
  type: PlayType;
  dateRange: DateRange;
  region?: string;
  coverImage?: string;
  members: string[];
  tags?: string[];
}

export const PLAY_TYPE_LABELS: Record<PlayType, string> = {
  travel: '여행',
  date: '데이트',
  hangout: '모임',
  daily: '일상',
  etc: '기타',
};

// ============================================
// Pin
// ============================================

export type PinCategory = 'food' | 'cafe' | 'shopping' | 'transport' | 'stay' | 'activity' | 'etc';

export interface Split {
  userId: string;
  amount: number;
}

export interface Settlement {
  type: 'equal' | 'custom';
  paidBy: string;
  splits: Split[];
}

export interface Pin {
  id: string;
  playId: string;
  authorId: string;
  amount: number;
  category: PinCategory;
  title: string;
  memo?: string;
  location?: string;
  images?: string[];
  settlement: Settlement;
  createdAt: string;
}

export interface CreatePinRequest {
  playId: string;
  amount: number;
  category: PinCategory;
  title: string;
  memo?: string;
  location?: string;
  images?: string[];
  settlement: Settlement;
}

export const CATEGORY_LABELS: Record<PinCategory, string> = {
  food: '음식',
  cafe: '카페',
  shopping: '쇼핑',
  transport: '이동',
  stay: '숙박',
  activity: '액티비티',
  etc: '기타',
};

export const CATEGORY_COLORS: Record<PinCategory, string> = {
  food: '#d45c5c',
  cafe: '#d4a84c',
  shopping: '#a070b0',
  transport: '#5080b0',
  stay: '#7868b0',
  activity: '#5c9e6e',
  etc: '#8a8a8a',
};

export const CATEGORY_ICONS: Record<PinCategory, string> = {
  food: '🍽️',
  cafe: '☕',
  shopping: '🛍️',
  transport: '🚗',
  stay: '🏨',
  activity: '🎯',
  etc: '📌',
};

// ============================================
// 공통 상수
// ============================================

export const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '해외',
];
