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
  regions?: string[];
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
  regions?: string[];
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

// 지역 그룹 타입
export interface RegionGroup {
  label: string;
  regions: string[];
}

// 국내 지역 (시/군/구 단위)
export const DOMESTIC_REGIONS: RegionGroup[] = [
  {
    label: '서울 강남구',
    regions: ['전체', '강남역', '역삼역', '삼성역', '선릉역', '신논현역', '논현동', '압구정', '청담동', '신사동', '가로수길', '도산공원', '학동역', '언주역'],
  },
  {
    label: '서울 서초구',
    regions: ['전체', '서초역', '교대역', '강남역', '양재역', '반포', '방배동', '서래마을', '예술의전당'],
  },
  {
    label: '서울 송파구',
    regions: ['전체', '잠실역', '잠실새내', '석촌호수', '롯데월드', '방이동', '오금역', '문정동', '가락시장', '송리단길'],
  },
  {
    label: '서울 마포구',
    regions: ['전체', '홍대입구', '합정', '상수', '망원동', '연남동', '연희동', '신촌', '이대역', '공덕역', '마포역', '상암동'],
  },
  {
    label: '서울 용산구',
    regions: ['전체', '이태원', '한남동', '경리단길', '녹사평역', '용산역', '삼각지역', '해방촌', '후암동', '한강진역'],
  },
  {
    label: '서울 성동구',
    regions: ['전체', '성수동', '서울숲', '뚝섬역', '왕십리역', '한양대역', '행당동', '금호동'],
  },
  {
    label: '서울 광진구',
    regions: ['전체', '건대입구', '자양동', '화양동', '어린이대공원', '군자역', '아차산역'],
  },
  {
    label: '서울 종로구',
    regions: ['전체', '광화문', '종로', '익선동', '북촌', '서촌', '삼청동', '인사동', '경복궁', '창덕궁', '대학로', '혜화역'],
  },
  {
    label: '서울 중구',
    regions: ['전체', '을지로', '명동', '충무로', '동대문', '신당동', '약수역', '남산', '서울역'],
  },
  {
    label: '서울 영등포구',
    regions: ['전체', '여의도', '영등포역', '당산역', '선유도', '문래동', '양평동', '영등포시장'],
  },
  {
    label: '서울 강서구',
    regions: ['전체', '마곡', '발산역', '화곡역', '김포공항역', '가양역'],
  },
  {
    label: '서울 강동구',
    regions: ['전체', '천호역', '강동역', '암사동', '길동', '명일동', '고덕역'],
  },
  {
    label: '서울 관악구',
    regions: ['전체', '신림역', '서울대입구역', '낙성대역', '봉천동', '샤로수길'],
  },
  {
    label: '서울 동작구',
    regions: ['전체', '사당역', '이수역', '노량진', '동작역', '흑석동'],
  },
  {
    label: '서울 서대문구',
    regions: ['전체', '신촌역', '이대역', '홍제역', '연희동', '북아현동'],
  },
  {
    label: '서울 노원구',
    regions: ['전체', '노원역', '수락산역', '상계역', '태릉입구역', '공릉동'],
  },
  {
    label: '서울 강북구',
    regions: ['전체', '수유역', '미아역', '4.19 민주묘지', '북한산'],
  },
  {
    label: '서울 성북구',
    regions: ['전체', '성신여대입구', '길음역', '정릉동', '성북동', '혜화문'],
  },
  {
    label: '경기',
    regions: ['전체', '수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '광명시', '김포시', '군포시', '광주시', '이천시', '양주시', '오산시', '구리시', '안성시', '포천시', '의왕시', '하남시', '여주시', '양평군', '동두천시', '과천시', '가평군', '연천군'],
  },
  {
    label: '인천',
    regions: ['전체', '중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
  },
  {
    label: '부산',
    regions: ['전체', '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'],
  },
  {
    label: '대구',
    regions: ['전체', '중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
  },
  {
    label: '대전',
    regions: ['전체', '동구', '중구', '서구', '유성구', '대덕구'],
  },
  {
    label: '광주',
    regions: ['전체', '동구', '서구', '남구', '북구', '광산구'],
  },
  {
    label: '울산',
    regions: ['전체', '중구', '남구', '동구', '북구', '울주군'],
  },
  {
    label: '세종',
    regions: ['전체', '세종시'],
  },
  {
    label: '강원',
    regions: ['전체', '춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
  },
  {
    label: '충북',
    regions: ['전체', '청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
  },
  {
    label: '충남',
    regions: ['전체', '천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
  },
  {
    label: '전북',
    regions: ['전체', '전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
  },
  {
    label: '전남',
    regions: ['전체', '목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
  },
  {
    label: '경북',
    regions: ['전체', '포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
  },
  {
    label: '경남',
    regions: ['전체', '창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
  },
  {
    label: '제주',
    regions: ['전체', '제주시', '서귀포시'],
  },
];

// 해외 지역 (국가/도시 단위)
export const OVERSEAS_REGIONS: RegionGroup[] = [
  {
    label: '일본',
    regions: ['전체', '도쿄', '오사카', '교토', '후쿠오카', '삿포로', '나고야', '오키나와', '요코하마', '고베', '나라'],
  },
  {
    label: '중국',
    regions: ['전체', '상하이', '베이징', '광저우', '선전', '청두', '항저우', '시안', '충칭'],
  },
  {
    label: '동남아시아',
    regions: ['전체', '방콕', '싱가포르', '호치민', '하노이', '다낭', '발리', '자카르타', '쿠알라룸푸르', '마닐라', '세부'],
  },
  {
    label: '유럽',
    regions: ['전체', '파리', '런던', '로마', '바르셀로나', '암스테르담', '프라하', '빈', '베를린', '뮌헨', '밀라노', '베네치아', '취리히'],
  },
  {
    label: '미주',
    regions: ['전체', '뉴욕', '로스앤젤레스', '샌프란시스코', '라스베이거스', '하와이', '시애틀', '시카고', '밴쿠버', '토론토'],
  },
  {
    label: '오세아니아',
    regions: ['전체', '시드니', '멜버른', '오클랜드', '퀸즈타운', '괌', '사이판'],
  },
];

// 전체 지역 목록 (검색용)
export const ALL_REGIONS = [
  ...DOMESTIC_REGIONS.flatMap(g => g.regions.map(r => `${g.label} ${r}`)),
  ...OVERSEAS_REGIONS.flatMap(g => g.regions.map(r => `${g.label} ${r}`)),
];
