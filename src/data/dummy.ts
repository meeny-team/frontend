/**
 * Meeny - Data Models & Dummy Data
 * 크루(Crew) > 플레이(Play) > 핀(Pin) 구조
 */

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  nickname: string;
  profileImage?: string;
  bio?: string;
}

export interface Crew {
  id: string;
  name: string;
  members: string[];
  inviteCode: string;
  coverImage?: string;
  createdBy: string;
  createdAt: string;
}

export type PlayType = 'travel' | 'date' | 'hangout' | 'daily' | 'etc';

export interface Play {
  id: string;
  crewId: string;
  title: string;
  type: PlayType;
  dateRange: {
    start: string;
    end?: string;
  };
  coverImage?: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}

export type PinCategory = 'food' | 'cafe' | 'shopping' | 'transport' | 'stay' | 'activity' | 'etc';

export interface Pin {
  id: string;
  playId: string;
  authorId: string;
  amount: number;
  category: PinCategory;
  title: string;
  memo?: string;
  location?: string;
  settlement: {
    type: 'equal' | 'custom';
    paidBy: string;
    splits: {
      userId: string;
      amount: number;
    }[];
  };
  createdAt: string;
}

// ============================================
// LABELS
// ============================================

export const PLAY_TYPE_LABELS: Record<PlayType, string> = {
  travel: '여행',
  date: '데이트',
  hangout: '모임',
  daily: '일상',
  etc: '기타',
};

export const CATEGORY_LABELS: Record<PinCategory, string> = {
  food: '음식',
  cafe: '카페',
  shopping: '쇼핑',
  transport: '이동',
  stay: '숙박',
  activity: '액티비티',
  etc: '기타',
};

// ============================================
// DUMMY DATA
// ============================================

export const CURRENT_USER: User = {
  id: 'u1',
  nickname: '지민',
  bio: '맛집 탐방러',
};

export const DUMMY_USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', nickname: '수현' },
  { id: 'u3', nickname: '민수' },
  { id: 'u4', nickname: '예진' },
  { id: 'u5', nickname: '도윤' },
];

export const DUMMY_CREWS: Crew[] = [
  {
    id: 'c1',
    name: '제주 여행',
    members: ['u1', 'u2', 'u3', 'u4'],
    inviteCode: 'JEJ123',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    createdBy: 'u1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    name: '대학 동기',
    members: ['u1', 'u2', 'u3', 'u4', 'u5'],
    inviteCode: 'UNI789',
    createdBy: 'u3',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'c3',
    name: '회사 점심팟',
    members: ['u1', 'u2'],
    inviteCode: 'WRK456',
    createdBy: 'u1',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

export const DUMMY_PLAYS: Play[] = [
  {
    id: 'p1',
    crewId: 'c1',
    title: '3월 제주도',
    type: 'travel',
    dateRange: { start: '2024-03-15', end: '2024-03-17' },
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    members: ['u1', 'u2', 'u3', 'u4'],
    createdBy: 'u1',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'p2',
    crewId: 'c2',
    title: '신년 모임',
    type: 'hangout',
    dateRange: { start: '2024-01-06' },
    members: ['u1', 'u2', 'u3', 'u4', 'u5'],
    createdBy: 'u3',
    createdAt: '2024-01-06T00:00:00Z',
  },
  {
    id: 'p3',
    crewId: 'c2',
    title: '성수동 카페',
    type: 'hangout',
    dateRange: { start: '2024-04-01' },
    members: ['u1', 'u2', 'u3'],
    createdBy: 'u2',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'p4',
    crewId: 'c3',
    title: '4월 점심',
    type: 'daily',
    dateRange: { start: '2024-04-10' },
    members: ['u1', 'u2'],
    createdBy: 'u1',
    createdAt: '2024-04-10T00:00:00Z',
  },
];

export const DUMMY_PINS: Pin[] = [
  // 제주 여행 핀
  {
    id: 'pin1',
    playId: 'p1',
    authorId: 'u1',
    amount: 120000,
    category: 'food',
    title: '흑돼지 맛집',
    location: '제주시 연동',
    settlement: {
      type: 'equal',
      paidBy: 'u1',
      splits: [
        { userId: 'u1', amount: 30000 },
        { userId: 'u2', amount: 30000 },
        { userId: 'u3', amount: 30000 },
        { userId: 'u4', amount: 30000 },
      ],
    },
    createdAt: '2024-03-15T12:00:00Z',
  },
  {
    id: 'pin2',
    playId: 'p1',
    authorId: 'u2',
    amount: 80000,
    category: 'cafe',
    title: '오션뷰 카페',
    location: '애월읍',
    settlement: {
      type: 'equal',
      paidBy: 'u2',
      splits: [
        { userId: 'u1', amount: 20000 },
        { userId: 'u2', amount: 20000 },
        { userId: 'u3', amount: 20000 },
        { userId: 'u4', amount: 20000 },
      ],
    },
    createdAt: '2024-03-15T15:00:00Z',
  },
  {
    id: 'pin3',
    playId: 'p1',
    authorId: 'u3',
    amount: 240000,
    category: 'stay',
    title: '숙소',
    location: '서귀포시',
    settlement: {
      type: 'equal',
      paidBy: 'u3',
      splits: [
        { userId: 'u1', amount: 60000 },
        { userId: 'u2', amount: 60000 },
        { userId: 'u3', amount: 60000 },
        { userId: 'u4', amount: 60000 },
      ],
    },
    createdAt: '2024-03-15T20:00:00Z',
  },
  // 신년 모임 핀
  {
    id: 'pin4',
    playId: 'p2',
    authorId: 'u3',
    amount: 250000,
    category: 'food',
    title: '고기집',
    location: '강남역',
    settlement: {
      type: 'equal',
      paidBy: 'u3',
      splits: [
        { userId: 'u1', amount: 50000 },
        { userId: 'u2', amount: 50000 },
        { userId: 'u3', amount: 50000 },
        { userId: 'u4', amount: 50000 },
        { userId: 'u5', amount: 50000 },
      ],
    },
    createdAt: '2024-01-06T19:00:00Z',
  },
  // 성수동 카페 핀
  {
    id: 'pin5',
    playId: 'p3',
    authorId: 'u2',
    amount: 45000,
    category: 'cafe',
    title: '성수 카페',
    location: '성수동',
    settlement: {
      type: 'equal',
      paidBy: 'u2',
      splits: [
        { userId: 'u1', amount: 15000 },
        { userId: 'u2', amount: 15000 },
        { userId: 'u3', amount: 15000 },
      ],
    },
    createdAt: '2024-04-01T14:00:00Z',
  },
  // 회사 점심 핀
  {
    id: 'pin6',
    playId: 'p4',
    authorId: 'u1',
    amount: 32000,
    category: 'food',
    title: '점심 식사',
    location: '회사 근처',
    settlement: {
      type: 'equal',
      paidBy: 'u1',
      splits: [
        { userId: 'u1', amount: 16000 },
        { userId: 'u2', amount: 16000 },
      ],
    },
    createdAt: '2024-04-10T12:30:00Z',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getUserById(userId: string): User | undefined {
  return DUMMY_USERS.find(u => u.id === userId);
}

export function getCrewById(crewId: string): Crew | undefined {
  return DUMMY_CREWS.find(c => c.id === crewId);
}

export function getCrewsByUserId(userId: string): Crew[] {
  return DUMMY_CREWS.filter(crew => crew.members.includes(userId));
}

export function getPlaysByCrewId(crewId: string): Play[] {
  return DUMMY_PLAYS.filter(play => play.crewId === crewId);
}

export function getPinsByPlayId(playId: string): Pin[] {
  return DUMMY_PINS.filter(pin => pin.playId === playId);
}

export function getPlayTotalAmount(playId: string): number {
  return DUMMY_PINS
    .filter(pin => pin.playId === playId)
    .reduce((sum, pin) => sum + pin.amount, 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}
