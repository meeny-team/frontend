/**
 * Meeny Mock Data
 * 백엔드 없이 테스트용 더미 데이터
 */

import { User, Crew, Play, Pin } from './schema';

// ============================================
// Users
// ============================================

export const CURRENT_USER_ID = 'u1';

export const users: User[] = [
  { id: 'u1', nickname: '지민', bio: '맛집 탐방러', profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { id: 'u2', nickname: '수현', bio: '카페 러버', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { id: 'u3', nickname: '민수', bio: '여행 좋아해요', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
  { id: 'u4', nickname: '예진', bio: '사진 찍는 거 좋아함', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  { id: 'u5', nickname: '도윤', bio: '운동하고 맛있는 거 먹기' },
];

export const CURRENT_USER = users.find(u => u.id === CURRENT_USER_ID)!;

// ============================================
// Crews
// ============================================

export const crews: Crew[] = [
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
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    createdBy: 'u3',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'c3',
    name: '회사 점심팟',
    members: ['u1', 'u2'],
    inviteCode: 'WRK456',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    createdBy: 'u1',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// ============================================
// Plays
// ============================================

export const plays: Play[] = [
  {
    id: 'p1',
    crewId: 'c1',
    title: '3월 제주도',
    type: 'travel',
    dateRange: { start: '2024-03-15', end: '2024-03-17' },
    regions: ['제주 제주시', '제주 서귀포시'],
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    members: ['u1', 'u2', 'u3', 'u4'],
    tags: ['힐링', '맛집투어', '바다'],
    createdBy: 'u1',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'p2',
    crewId: 'c2',
    title: '신년 모임',
    type: 'hangout',
    dateRange: { start: '2024-01-06' },
    regions: ['서울 강남구'],
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    members: ['u1', 'u2', 'u3', 'u4', 'u5'],
    tags: ['신년', '고기'],
    createdBy: 'u3',
    createdAt: '2024-01-06T00:00:00Z',
  },
  {
    id: 'p3',
    crewId: 'c2',
    title: '성수동 카페',
    type: 'hangout',
    dateRange: { start: '2024-04-01' },
    regions: ['서울 성동구'],
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    members: ['u1', 'u2', 'u3'],
    tags: ['카페', '디저트'],
    createdBy: 'u2',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'p4',
    crewId: 'c3',
    title: '4월 점심',
    type: 'daily',
    dateRange: { start: '2024-04-10' },
    regions: ['서울 영등포구'],
    members: ['u1', 'u2'],
    tags: ['점심'],
    createdBy: 'u1',
    createdAt: '2024-04-10T00:00:00Z',
  },
];

// ============================================
// Pins
// ============================================

export const pins: Pin[] = [
  {
    id: 'pin1',
    playId: 'p1',
    authorId: 'u1',
    amount: 120000,
    category: 'food',
    title: '흑돼지 맛집',
    memo: '제주 3대 흑돼지 맛집! 고기가 정말 부드럽고 맛있었어요. 다음에 또 가고 싶다.',
    location: '제주시 연동',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
      'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
    ],
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
    memo: '바다가 보이는 루프탑 카페. 뷰가 미쳤음',
    location: '애월읍',
    images: [
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    ],
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
    memo: '에어비앤비 독채 펜션. 넓고 깨끗하고 좋았음!',
    location: '서귀포시',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    ],
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
  {
    id: 'pin4',
    playId: 'p1',
    authorId: 'u4',
    amount: 45000,
    category: 'transport',
    title: '렌트카 주유',
    memo: '이틀치 기름값',
    location: '제주시',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    ],
    settlement: {
      type: 'equal',
      paidBy: 'u4',
      splits: [
        { userId: 'u1', amount: 11250 },
        { userId: 'u2', amount: 11250 },
        { userId: 'u3', amount: 11250 },
        { userId: 'u4', amount: 11250 },
      ],
    },
    createdAt: '2024-03-16T10:00:00Z',
  },
  {
    id: 'pin5',
    playId: 'p1',
    authorId: 'u1',
    amount: 65000,
    category: 'activity',
    title: '카약 체험',
    memo: '투명 카약 타고 바다 위에서 인생샷 찍음',
    location: '우도',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80',
    ],
    settlement: {
      type: 'equal',
      paidBy: 'u1',
      splits: [
        { userId: 'u1', amount: 16250 },
        { userId: 'u2', amount: 16250 },
        { userId: 'u3', amount: 16250 },
        { userId: 'u4', amount: 16250 },
      ],
    },
    createdAt: '2024-03-16T14:00:00Z',
  },
  {
    id: 'pin6',
    playId: 'p2',
    authorId: 'u3',
    amount: 250000,
    category: 'food',
    title: '고기집',
    memo: '신년 기념 한우 소고기! 역시 고기는 한우지',
    location: '강남역',
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    ],
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
  {
    id: 'pin7',
    playId: 'p2',
    authorId: 'u2',
    amount: 85000,
    category: 'cafe',
    title: '2차 디저트',
    memo: '배터지게 먹고 디저트 카페 ㅋㅋ',
    location: '강남역',
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
    ],
    settlement: {
      type: 'equal',
      paidBy: 'u2',
      splits: [
        { userId: 'u1', amount: 17000 },
        { userId: 'u2', amount: 17000 },
        { userId: 'u3', amount: 17000 },
        { userId: 'u4', amount: 17000 },
        { userId: 'u5', amount: 17000 },
      ],
    },
    createdAt: '2024-01-06T21:00:00Z',
  },
  {
    id: 'pin8',
    playId: 'p3',
    authorId: 'u2',
    amount: 45000,
    category: 'cafe',
    title: '성수 카페',
    memo: '인스타 핫플! 분위기 너무 좋았음',
    location: '성수동',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    ],
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
  {
    id: 'pin9',
    playId: 'p3',
    authorId: 'u1',
    amount: 38000,
    category: 'shopping',
    title: '편집샵 구경',
    memo: '예쁜 소품들 구경하다가 몇 개 삼',
    location: '성수동',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    ],
    settlement: {
      type: 'custom',
      paidBy: 'u1',
      splits: [
        { userId: 'u1', amount: 20000 },
        { userId: 'u2', amount: 10000 },
        { userId: 'u3', amount: 8000 },
      ],
    },
    createdAt: '2024-04-01T16:00:00Z',
  },
  {
    id: 'pin10',
    playId: 'p4',
    authorId: 'u1',
    amount: 32000,
    category: 'food',
    title: '점심 식사',
    memo: '회사 근처 새로 생긴 일식집',
    location: '회사 근처',
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    ],
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
