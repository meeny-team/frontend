/**
 * 전세계 국가 데이터
 * World Countries Data
 */

export interface City {
  id: string;
  name: string;      // Korean name
  nameEn: string;    // English name
}

export interface Country {
  code: string;      // ISO 3166-1 alpha-2
  name: string;      // Korean name
  nameEn: string;    // English name
  flag: string;      // Emoji flag
  continent: string; // Continent in Korean
  cities?: City[];   // Major cities/regions
}

export const CONTINENTS = [
  '전체',
  '아시아',
  '유럽',
  '북아메리카',
  '남아메리카',
  '오세아니아',
  '아프리카',
];

export const COUNTRIES: Country[] = [
  // 아시아 (Asia)
  {
    code: 'JP', name: '일본', nameEn: 'Japan', flag: '🇯🇵', continent: '아시아',
    cities: [
      { id: 'tokyo', name: '도쿄', nameEn: 'Tokyo' },
      { id: 'osaka', name: '오사카', nameEn: 'Osaka' },
      { id: 'kyoto', name: '교토', nameEn: 'Kyoto' },
      { id: 'fukuoka', name: '후쿠오카', nameEn: 'Fukuoka' },
      { id: 'sapporo', name: '삿포로', nameEn: 'Sapporo' },
      { id: 'okinawa', name: '오키나와', nameEn: 'Okinawa' },
      { id: 'nagoya', name: '나고야', nameEn: 'Nagoya' },
      { id: 'hiroshima', name: '히로시마', nameEn: 'Hiroshima' },
      { id: 'kobe', name: '고베', nameEn: 'Kobe' },
      { id: 'nara', name: '나라', nameEn: 'Nara' },
    ]
  },
  {
    code: 'CN', name: '중국', nameEn: 'China', flag: '🇨🇳', continent: '아시아',
    cities: [
      { id: 'beijing', name: '베이징', nameEn: 'Beijing' },
      { id: 'shanghai', name: '상하이', nameEn: 'Shanghai' },
      { id: 'guangzhou', name: '광저우', nameEn: 'Guangzhou' },
      { id: 'shenzhen', name: '선전', nameEn: 'Shenzhen' },
      { id: 'chengdu', name: '청두', nameEn: 'Chengdu' },
      { id: 'hangzhou', name: '항저우', nameEn: 'Hangzhou' },
      { id: 'xian', name: '시안', nameEn: "Xi'an" },
      { id: 'chongqing', name: '충칭', nameEn: 'Chongqing' },
    ]
  },
  {
    code: 'TW', name: '대만', nameEn: 'Taiwan', flag: '🇹🇼', continent: '아시아',
    cities: [
      { id: 'taipei', name: '타이베이', nameEn: 'Taipei' },
      { id: 'kaohsiung', name: '가오슝', nameEn: 'Kaohsiung' },
      { id: 'taichung', name: '타이중', nameEn: 'Taichung' },
      { id: 'tainan', name: '타이난', nameEn: 'Tainan' },
      { id: 'hualien', name: '화롄', nameEn: 'Hualien' },
    ]
  },
  { code: 'HK', name: '홍콩', nameEn: 'Hong Kong', flag: '🇭🇰', continent: '아시아' },
  { code: 'MO', name: '마카오', nameEn: 'Macau', flag: '🇲🇴', continent: '아시아' },
  {
    code: 'TH', name: '태국', nameEn: 'Thailand', flag: '🇹🇭', continent: '아시아',
    cities: [
      { id: 'bangkok', name: '방콕', nameEn: 'Bangkok' },
      { id: 'chiangmai', name: '치앙마이', nameEn: 'Chiang Mai' },
      { id: 'phuket', name: '푸켓', nameEn: 'Phuket' },
      { id: 'pattaya', name: '파타야', nameEn: 'Pattaya' },
      { id: 'krabi', name: '끄라비', nameEn: 'Krabi' },
      { id: 'koh-samui', name: '코사무이', nameEn: 'Koh Samui' },
    ]
  },
  {
    code: 'VN', name: '베트남', nameEn: 'Vietnam', flag: '🇻🇳', continent: '아시아',
    cities: [
      { id: 'hanoi', name: '하노이', nameEn: 'Hanoi' },
      { id: 'ho-chi-minh', name: '호치민', nameEn: 'Ho Chi Minh' },
      { id: 'danang', name: '다낭', nameEn: 'Da Nang' },
      { id: 'nha-trang', name: '나트랑', nameEn: 'Nha Trang' },
      { id: 'hoi-an', name: '호이안', nameEn: 'Hoi An' },
      { id: 'ha-long', name: '하롱', nameEn: 'Ha Long' },
    ]
  },
  { code: 'SG', name: '싱가포르', nameEn: 'Singapore', flag: '🇸🇬', continent: '아시아' },
  {
    code: 'MY', name: '말레이시아', nameEn: 'Malaysia', flag: '🇲🇾', continent: '아시아',
    cities: [
      { id: 'kuala-lumpur', name: '쿠알라룸푸르', nameEn: 'Kuala Lumpur' },
      { id: 'penang', name: '페낭', nameEn: 'Penang' },
      { id: 'langkawi', name: '랑카위', nameEn: 'Langkawi' },
      { id: 'kota-kinabalu', name: '코타키나발루', nameEn: 'Kota Kinabalu' },
    ]
  },
  {
    code: 'ID', name: '인도네시아', nameEn: 'Indonesia', flag: '🇮🇩', continent: '아시아',
    cities: [
      { id: 'bali', name: '발리', nameEn: 'Bali' },
      { id: 'jakarta', name: '자카르타', nameEn: 'Jakarta' },
      { id: 'yogyakarta', name: '족자카르타', nameEn: 'Yogyakarta' },
      { id: 'lombok', name: '롬복', nameEn: 'Lombok' },
    ]
  },
  {
    code: 'PH', name: '필리핀', nameEn: 'Philippines', flag: '🇵🇭', continent: '아시아',
    cities: [
      { id: 'manila', name: '마닐라', nameEn: 'Manila' },
      { id: 'cebu', name: '세부', nameEn: 'Cebu' },
      { id: 'boracay', name: '보라카이', nameEn: 'Boracay' },
      { id: 'palawan', name: '팔라완', nameEn: 'Palawan' },
    ]
  },
  { code: 'IN', name: '인도', nameEn: 'India', flag: '🇮🇳', continent: '아시아' },
  { code: 'NP', name: '네팔', nameEn: 'Nepal', flag: '🇳🇵', continent: '아시아' },
  { code: 'LK', name: '스리랑카', nameEn: 'Sri Lanka', flag: '🇱🇰', continent: '아시아' },
  { code: 'BD', name: '방글라데시', nameEn: 'Bangladesh', flag: '🇧🇩', continent: '아시아' },
  { code: 'MM', name: '미얀마', nameEn: 'Myanmar', flag: '🇲🇲', continent: '아시아' },
  { code: 'KH', name: '캄보디아', nameEn: 'Cambodia', flag: '🇰🇭', continent: '아시아' },
  { code: 'LA', name: '라오스', nameEn: 'Laos', flag: '🇱🇦', continent: '아시아' },
  { code: 'BN', name: '브루나이', nameEn: 'Brunei', flag: '🇧🇳', continent: '아시아' },
  { code: 'MN', name: '몽골', nameEn: 'Mongolia', flag: '🇲🇳', continent: '아시아' },
  { code: 'AE', name: 'UAE', nameEn: 'United Arab Emirates', flag: '🇦🇪', continent: '아시아' },
  { code: 'SA', name: '사우디아라비아', nameEn: 'Saudi Arabia', flag: '🇸🇦', continent: '아시아' },
  { code: 'QA', name: '카타르', nameEn: 'Qatar', flag: '🇶🇦', continent: '아시아' },
  { code: 'KW', name: '쿠웨이트', nameEn: 'Kuwait', flag: '🇰🇼', continent: '아시아' },
  { code: 'BH', name: '바레인', nameEn: 'Bahrain', flag: '🇧🇭', continent: '아시아' },
  { code: 'OM', name: '오만', nameEn: 'Oman', flag: '🇴🇲', continent: '아시아' },
  { code: 'JO', name: '요르단', nameEn: 'Jordan', flag: '🇯🇴', continent: '아시아' },
  { code: 'IL', name: '이스라엘', nameEn: 'Israel', flag: '🇮🇱', continent: '아시아' },
  { code: 'TR', name: '튀르키예', nameEn: 'Turkey', flag: '🇹🇷', continent: '아시아' },
  { code: 'UZ', name: '우즈베키스탄', nameEn: 'Uzbekistan', flag: '🇺🇿', continent: '아시아' },
  { code: 'KZ', name: '카자흐스탄', nameEn: 'Kazakhstan', flag: '🇰🇿', continent: '아시아' },
  { code: 'GE', name: '조지아', nameEn: 'Georgia', flag: '🇬🇪', continent: '아시아' },
  { code: 'AM', name: '아르메니아', nameEn: 'Armenia', flag: '🇦🇲', continent: '아시아' },
  { code: 'AZ', name: '아제르바이잔', nameEn: 'Azerbaijan', flag: '🇦🇿', continent: '아시아' },
  { code: 'PK', name: '파키스탄', nameEn: 'Pakistan', flag: '🇵🇰', continent: '아시아' },
  { code: 'MV', name: '몰디브', nameEn: 'Maldives', flag: '🇲🇻', continent: '아시아' },

  // 유럽 (Europe)
  {
    code: 'GB', name: '영국', nameEn: 'United Kingdom', flag: '🇬🇧', continent: '유럽',
    cities: [
      { id: 'london', name: '런던', nameEn: 'London' },
      { id: 'manchester', name: '맨체스터', nameEn: 'Manchester' },
      { id: 'edinburgh', name: '에든버러', nameEn: 'Edinburgh' },
      { id: 'liverpool', name: '리버풀', nameEn: 'Liverpool' },
      { id: 'birmingham', name: '버밍엄', nameEn: 'Birmingham' },
    ]
  },
  {
    code: 'FR', name: '프랑스', nameEn: 'France', flag: '🇫🇷', continent: '유럽',
    cities: [
      { id: 'paris', name: '파리', nameEn: 'Paris' },
      { id: 'nice', name: '니스', nameEn: 'Nice' },
      { id: 'lyon', name: '리옹', nameEn: 'Lyon' },
      { id: 'marseille', name: '마르세유', nameEn: 'Marseille' },
      { id: 'bordeaux', name: '보르도', nameEn: 'Bordeaux' },
      { id: 'strasbourg', name: '스트라스부르', nameEn: 'Strasbourg' },
    ]
  },
  {
    code: 'DE', name: '독일', nameEn: 'Germany', flag: '🇩🇪', continent: '유럽',
    cities: [
      { id: 'berlin', name: '베를린', nameEn: 'Berlin' },
      { id: 'munich', name: '뮌헨', nameEn: 'Munich' },
      { id: 'frankfurt', name: '프랑크푸르트', nameEn: 'Frankfurt' },
      { id: 'hamburg', name: '함부르크', nameEn: 'Hamburg' },
      { id: 'cologne', name: '쾰른', nameEn: 'Cologne' },
    ]
  },
  {
    code: 'IT', name: '이탈리아', nameEn: 'Italy', flag: '🇮🇹', continent: '유럽',
    cities: [
      { id: 'rome', name: '로마', nameEn: 'Rome' },
      { id: 'milan', name: '밀라노', nameEn: 'Milan' },
      { id: 'venice', name: '베네치아', nameEn: 'Venice' },
      { id: 'florence', name: '피렌체', nameEn: 'Florence' },
      { id: 'naples', name: '나폴리', nameEn: 'Naples' },
      { id: 'amalfi', name: '아말피', nameEn: 'Amalfi' },
    ]
  },
  {
    code: 'ES', name: '스페인', nameEn: 'Spain', flag: '🇪🇸', continent: '유럽',
    cities: [
      { id: 'madrid', name: '마드리드', nameEn: 'Madrid' },
      { id: 'barcelona', name: '바르셀로나', nameEn: 'Barcelona' },
      { id: 'seville', name: '세비야', nameEn: 'Seville' },
      { id: 'granada', name: '그라나다', nameEn: 'Granada' },
      { id: 'valencia', name: '발렌시아', nameEn: 'Valencia' },
    ]
  },
  {
    code: 'PT', name: '포르투갈', nameEn: 'Portugal', flag: '🇵🇹', continent: '유럽',
    cities: [
      { id: 'lisbon', name: '리스본', nameEn: 'Lisbon' },
      { id: 'porto', name: '포르투', nameEn: 'Porto' },
      { id: 'sintra', name: '신트라', nameEn: 'Sintra' },
    ]
  },
  { code: 'NL', name: '네덜란드', nameEn: 'Netherlands', flag: '🇳🇱', continent: '유럽' },
  { code: 'BE', name: '벨기에', nameEn: 'Belgium', flag: '🇧🇪', continent: '유럽' },
  {
    code: 'CH', name: '스위스', nameEn: 'Switzerland', flag: '🇨🇭', continent: '유럽',
    cities: [
      { id: 'zurich', name: '취리히', nameEn: 'Zurich' },
      { id: 'geneva', name: '제네바', nameEn: 'Geneva' },
      { id: 'lucerne', name: '루체른', nameEn: 'Lucerne' },
      { id: 'interlaken', name: '인터라켄', nameEn: 'Interlaken' },
    ]
  },
  {
    code: 'AT', name: '오스트리아', nameEn: 'Austria', flag: '🇦🇹', continent: '유럽',
    cities: [
      { id: 'vienna', name: '비엔나', nameEn: 'Vienna' },
      { id: 'salzburg', name: '잘츠부르크', nameEn: 'Salzburg' },
      { id: 'hallstatt', name: '할슈타트', nameEn: 'Hallstatt' },
    ]
  },
  {
    code: 'CZ', name: '체코', nameEn: 'Czech Republic', flag: '🇨🇿', continent: '유럽',
    cities: [
      { id: 'prague', name: '프라하', nameEn: 'Prague' },
      { id: 'cesky-krumlov', name: '체스키크룸로프', nameEn: 'Cesky Krumlov' },
    ]
  },
  { code: 'PL', name: '폴란드', nameEn: 'Poland', flag: '🇵🇱', continent: '유럽' },
  { code: 'HU', name: '헝가리', nameEn: 'Hungary', flag: '🇭🇺', continent: '유럽' },
  {
    code: 'GR', name: '그리스', nameEn: 'Greece', flag: '🇬🇷', continent: '유럽',
    cities: [
      { id: 'athens', name: '아테네', nameEn: 'Athens' },
      { id: 'santorini', name: '산토리니', nameEn: 'Santorini' },
      { id: 'mykonos', name: '미코노스', nameEn: 'Mykonos' },
      { id: 'crete', name: '크레타', nameEn: 'Crete' },
    ]
  },
  { code: 'HR', name: '크로아티아', nameEn: 'Croatia', flag: '🇭🇷', continent: '유럽' },
  { code: 'SI', name: '슬로베니아', nameEn: 'Slovenia', flag: '🇸🇮', continent: '유럽' },
  { code: 'SK', name: '슬로바키아', nameEn: 'Slovakia', flag: '🇸🇰', continent: '유럽' },
  { code: 'RO', name: '루마니아', nameEn: 'Romania', flag: '🇷🇴', continent: '유럽' },
  { code: 'BG', name: '불가리아', nameEn: 'Bulgaria', flag: '🇧🇬', continent: '유럽' },
  { code: 'RS', name: '세르비아', nameEn: 'Serbia', flag: '🇷🇸', continent: '유럽' },
  { code: 'ME', name: '몬테네그로', nameEn: 'Montenegro', flag: '🇲🇪', continent: '유럽' },
  { code: 'AL', name: '알바니아', nameEn: 'Albania', flag: '🇦🇱', continent: '유럽' },
  { code: 'MK', name: '북마케도니아', nameEn: 'North Macedonia', flag: '🇲🇰', continent: '유럽' },
  { code: 'BA', name: '보스니아헤르체고비나', nameEn: 'Bosnia and Herzegovina', flag: '🇧🇦', continent: '유럽' },
  { code: 'XK', name: '코소보', nameEn: 'Kosovo', flag: '🇽🇰', continent: '유럽' },
  { code: 'DK', name: '덴마크', nameEn: 'Denmark', flag: '🇩🇰', continent: '유럽' },
  { code: 'SE', name: '스웨덴', nameEn: 'Sweden', flag: '🇸🇪', continent: '유럽' },
  { code: 'NO', name: '노르웨이', nameEn: 'Norway', flag: '🇳🇴', continent: '유럽' },
  { code: 'FI', name: '핀란드', nameEn: 'Finland', flag: '🇫🇮', continent: '유럽' },
  { code: 'IS', name: '아이슬란드', nameEn: 'Iceland', flag: '🇮🇸', continent: '유럽' },
  { code: 'IE', name: '아일랜드', nameEn: 'Ireland', flag: '🇮🇪', continent: '유럽' },
  { code: 'EE', name: '에스토니아', nameEn: 'Estonia', flag: '🇪🇪', continent: '유럽' },
  { code: 'LV', name: '라트비아', nameEn: 'Latvia', flag: '🇱🇻', continent: '유럽' },
  { code: 'LT', name: '리투아니아', nameEn: 'Lithuania', flag: '🇱🇹', continent: '유럽' },
  { code: 'UA', name: '우크라이나', nameEn: 'Ukraine', flag: '🇺🇦', continent: '유럽' },
  { code: 'BY', name: '벨라루스', nameEn: 'Belarus', flag: '🇧🇾', continent: '유럽' },
  { code: 'MD', name: '몰도바', nameEn: 'Moldova', flag: '🇲🇩', continent: '유럽' },
  { code: 'RU', name: '러시아', nameEn: 'Russia', flag: '🇷🇺', continent: '유럽' },
  { code: 'LU', name: '룩셈부르크', nameEn: 'Luxembourg', flag: '🇱🇺', continent: '유럽' },
  { code: 'MC', name: '모나코', nameEn: 'Monaco', flag: '🇲🇨', continent: '유럽' },
  { code: 'MT', name: '몰타', nameEn: 'Malta', flag: '🇲🇹', continent: '유럽' },
  { code: 'CY', name: '키프로스', nameEn: 'Cyprus', flag: '🇨🇾', continent: '유럽' },
  { code: 'AD', name: '안도라', nameEn: 'Andorra', flag: '🇦🇩', continent: '유럽' },
  { code: 'LI', name: '리히텐슈타인', nameEn: 'Liechtenstein', flag: '🇱🇮', continent: '유럽' },
  { code: 'SM', name: '산마리노', nameEn: 'San Marino', flag: '🇸🇲', continent: '유럽' },
  { code: 'VA', name: '바티칸', nameEn: 'Vatican City', flag: '🇻🇦', continent: '유럽' },

  // 북아메리카 (North America)
  {
    code: 'US', name: '미국', nameEn: 'United States', flag: '🇺🇸', continent: '북아메리카',
    cities: [
      { id: 'new-york', name: '뉴욕', nameEn: 'New York' },
      { id: 'los-angeles', name: '로스앤젤레스', nameEn: 'Los Angeles' },
      { id: 'san-francisco', name: '샌프란시스코', nameEn: 'San Francisco' },
      { id: 'las-vegas', name: '라스베이거스', nameEn: 'Las Vegas' },
      { id: 'hawaii', name: '하와이', nameEn: 'Hawaii' },
      { id: 'miami', name: '마이애미', nameEn: 'Miami' },
      { id: 'chicago', name: '시카고', nameEn: 'Chicago' },
      { id: 'seattle', name: '시애틀', nameEn: 'Seattle' },
      { id: 'boston', name: '보스턴', nameEn: 'Boston' },
      { id: 'washington-dc', name: '워싱턴 DC', nameEn: 'Washington DC' },
    ]
  },
  {
    code: 'CA', name: '캐나다', nameEn: 'Canada', flag: '🇨🇦', continent: '북아메리카',
    cities: [
      { id: 'vancouver', name: '밴쿠버', nameEn: 'Vancouver' },
      { id: 'toronto', name: '토론토', nameEn: 'Toronto' },
      { id: 'montreal', name: '몬트리올', nameEn: 'Montreal' },
      { id: 'banff', name: '밴프', nameEn: 'Banff' },
      { id: 'quebec', name: '퀘벡', nameEn: 'Quebec City' },
    ]
  },
  { code: 'MX', name: '멕시코', nameEn: 'Mexico', flag: '🇲🇽', continent: '북아메리카' },
  { code: 'CU', name: '쿠바', nameEn: 'Cuba', flag: '🇨🇺', continent: '북아메리카' },
  { code: 'JM', name: '자메이카', nameEn: 'Jamaica', flag: '🇯🇲', continent: '북아메리카' },
  { code: 'HT', name: '아이티', nameEn: 'Haiti', flag: '🇭🇹', continent: '북아메리카' },
  { code: 'DO', name: '도미니카공화국', nameEn: 'Dominican Republic', flag: '🇩🇴', continent: '북아메리카' },
  { code: 'PR', name: '푸에르토리코', nameEn: 'Puerto Rico', flag: '🇵🇷', continent: '북아메리카' },
  { code: 'BS', name: '바하마', nameEn: 'Bahamas', flag: '🇧🇸', continent: '북아메리카' },
  { code: 'BZ', name: '벨리즈', nameEn: 'Belize', flag: '🇧🇿', continent: '북아메리카' },
  { code: 'GT', name: '과테말라', nameEn: 'Guatemala', flag: '🇬🇹', continent: '북아메리카' },
  { code: 'HN', name: '온두라스', nameEn: 'Honduras', flag: '🇭🇳', continent: '북아메리카' },
  { code: 'SV', name: '엘살바도르', nameEn: 'El Salvador', flag: '🇸🇻', continent: '북아메리카' },
  { code: 'NI', name: '니카라과', nameEn: 'Nicaragua', flag: '🇳🇮', continent: '북아메리카' },
  { code: 'CR', name: '코스타리카', nameEn: 'Costa Rica', flag: '🇨🇷', continent: '북아메리카' },
  { code: 'PA', name: '파나마', nameEn: 'Panama', flag: '🇵🇦', continent: '북아메리카' },

  // 남아메리카 (South America)
  { code: 'BR', name: '브라질', nameEn: 'Brazil', flag: '🇧🇷', continent: '남아메리카' },
  { code: 'AR', name: '아르헨티나', nameEn: 'Argentina', flag: '🇦🇷', continent: '남아메리카' },
  { code: 'CL', name: '칠레', nameEn: 'Chile', flag: '🇨🇱', continent: '남아메리카' },
  { code: 'PE', name: '페루', nameEn: 'Peru', flag: '🇵🇪', continent: '남아메리카' },
  { code: 'CO', name: '콜롬비아', nameEn: 'Colombia', flag: '🇨🇴', continent: '남아메리카' },
  { code: 'VE', name: '베네수엘라', nameEn: 'Venezuela', flag: '🇻🇪', continent: '남아메리카' },
  { code: 'EC', name: '에콰도르', nameEn: 'Ecuador', flag: '🇪🇨', continent: '남아메리카' },
  { code: 'BO', name: '볼리비아', nameEn: 'Bolivia', flag: '🇧🇴', continent: '남아메리카' },
  { code: 'PY', name: '파라과이', nameEn: 'Paraguay', flag: '🇵🇾', continent: '남아메리카' },
  { code: 'UY', name: '우루과이', nameEn: 'Uruguay', flag: '🇺🇾', continent: '남아메리카' },
  { code: 'GY', name: '가이아나', nameEn: 'Guyana', flag: '🇬🇾', continent: '남아메리카' },
  { code: 'SR', name: '수리남', nameEn: 'Suriname', flag: '🇸🇷', continent: '남아메리카' },

  // 오세아니아 (Oceania)
  {
    code: 'AU', name: '호주', nameEn: 'Australia', flag: '🇦🇺', continent: '오세아니아',
    cities: [
      { id: 'sydney', name: '시드니', nameEn: 'Sydney' },
      { id: 'melbourne', name: '멜버른', nameEn: 'Melbourne' },
      { id: 'brisbane', name: '브리즈번', nameEn: 'Brisbane' },
      { id: 'gold-coast', name: '골드코스트', nameEn: 'Gold Coast' },
      { id: 'cairns', name: '케언즈', nameEn: 'Cairns' },
      { id: 'perth', name: '퍼스', nameEn: 'Perth' },
    ]
  },
  {
    code: 'NZ', name: '뉴질랜드', nameEn: 'New Zealand', flag: '🇳🇿', continent: '오세아니아',
    cities: [
      { id: 'auckland', name: '오클랜드', nameEn: 'Auckland' },
      { id: 'queenstown', name: '퀸스타운', nameEn: 'Queenstown' },
      { id: 'wellington', name: '웰링턴', nameEn: 'Wellington' },
      { id: 'rotorua', name: '로토루아', nameEn: 'Rotorua' },
    ]
  },
  { code: 'FJ', name: '피지', nameEn: 'Fiji', flag: '🇫🇯', continent: '오세아니아' },
  { code: 'PG', name: '파푸아뉴기니', nameEn: 'Papua New Guinea', flag: '🇵🇬', continent: '오세아니아' },
  { code: 'NC', name: '뉴칼레도니아', nameEn: 'New Caledonia', flag: '🇳🇨', continent: '오세아니아' },
  { code: 'PF', name: '프랑스령폴리네시아', nameEn: 'French Polynesia', flag: '🇵🇫', continent: '오세아니아' },
  { code: 'GU', name: '괌', nameEn: 'Guam', flag: '🇬🇺', continent: '오세아니아' },
  { code: 'WS', name: '사모아', nameEn: 'Samoa', flag: '🇼🇸', continent: '오세아니아' },
  { code: 'TO', name: '통가', nameEn: 'Tonga', flag: '🇹🇴', continent: '오세아니아' },
  { code: 'VU', name: '바누아투', nameEn: 'Vanuatu', flag: '🇻🇺', continent: '오세아니아' },
  { code: 'SB', name: '솔로몬제도', nameEn: 'Solomon Islands', flag: '🇸🇧', continent: '오세아니아' },
  { code: 'PW', name: '팔라우', nameEn: 'Palau', flag: '🇵🇼', continent: '오세아니아' },
  { code: 'FM', name: '미크로네시아', nameEn: 'Micronesia', flag: '🇫🇲', continent: '오세아니아' },
  { code: 'MH', name: '마샬군도', nameEn: 'Marshall Islands', flag: '🇲🇭', continent: '오세아니아' },

  // 아프리카 (Africa)
  { code: 'EG', name: '이집트', nameEn: 'Egypt', flag: '🇪🇬', continent: '아프리카' },
  { code: 'MA', name: '모로코', nameEn: 'Morocco', flag: '🇲🇦', continent: '아프리카' },
  { code: 'TN', name: '튀니지', nameEn: 'Tunisia', flag: '🇹🇳', continent: '아프리카' },
  { code: 'ZA', name: '남아프리카공화국', nameEn: 'South Africa', flag: '🇿🇦', continent: '아프리카' },
  { code: 'KE', name: '케냐', nameEn: 'Kenya', flag: '🇰🇪', continent: '아프리카' },
  { code: 'TZ', name: '탄자니아', nameEn: 'Tanzania', flag: '🇹🇿', continent: '아프리카' },
  { code: 'ET', name: '에티오피아', nameEn: 'Ethiopia', flag: '🇪🇹', continent: '아프리카' },
  { code: 'NG', name: '나이지리아', nameEn: 'Nigeria', flag: '🇳🇬', continent: '아프리카' },
  { code: 'GH', name: '가나', nameEn: 'Ghana', flag: '🇬🇭', continent: '아프리카' },
  { code: 'SN', name: '세네갈', nameEn: 'Senegal', flag: '🇸🇳', continent: '아프리카' },
  { code: 'CI', name: '코트디부아르', nameEn: "Cote d'Ivoire", flag: '🇨🇮', continent: '아프리카' },
  { code: 'CM', name: '카메룬', nameEn: 'Cameroon', flag: '🇨🇲', continent: '아프리카' },
  { code: 'UG', name: '우간다', nameEn: 'Uganda', flag: '🇺🇬', continent: '아프리카' },
  { code: 'RW', name: '르완다', nameEn: 'Rwanda', flag: '🇷🇼', continent: '아프리카' },
  { code: 'ZM', name: '잠비아', nameEn: 'Zambia', flag: '🇿🇲', continent: '아프리카' },
  { code: 'ZW', name: '짐바브웨', nameEn: 'Zimbabwe', flag: '🇿🇼', continent: '아프리카' },
  { code: 'BW', name: '보츠와나', nameEn: 'Botswana', flag: '🇧🇼', continent: '아프리카' },
  { code: 'NA', name: '나미비아', nameEn: 'Namibia', flag: '🇳🇦', continent: '아프리카' },
  { code: 'MZ', name: '모잠비크', nameEn: 'Mozambique', flag: '🇲🇿', continent: '아프리카' },
  { code: 'MG', name: '마다가스카르', nameEn: 'Madagascar', flag: '🇲🇬', continent: '아프리카' },
  { code: 'MU', name: '모리셔스', nameEn: 'Mauritius', flag: '🇲🇺', continent: '아프리카' },
  { code: 'SC', name: '세이셸', nameEn: 'Seychelles', flag: '🇸🇨', continent: '아프리카' },
  { code: 'DZ', name: '알제리', nameEn: 'Algeria', flag: '🇩🇿', continent: '아프리카' },
  { code: 'LY', name: '리비아', nameEn: 'Libya', flag: '🇱🇾', continent: '아프리카' },
  { code: 'SD', name: '수단', nameEn: 'Sudan', flag: '🇸🇩', continent: '아프리카' },
  { code: 'AO', name: '앙골라', nameEn: 'Angola', flag: '🇦🇴', continent: '아프리카' },
  { code: 'CD', name: '콩고민주공화국', nameEn: 'DR Congo', flag: '🇨🇩', continent: '아프리카' },
  { code: 'ML', name: '말리', nameEn: 'Mali', flag: '🇲🇱', continent: '아프리카' },
  { code: 'NE', name: '니제르', nameEn: 'Niger', flag: '🇳🇪', continent: '아프리카' },
  { code: 'BF', name: '부르키나파소', nameEn: 'Burkina Faso', flag: '🇧🇫', continent: '아프리카' },
];

// Popular countries for quick access
export const POPULAR_COUNTRIES = ['JP', 'CN', 'TW', 'TH', 'VN', 'US', 'FR', 'IT', 'ES', 'AU'];

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function searchCountries(query: string): Country[] {
  if (!query.trim()) return COUNTRIES;

  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(
    c =>
      c.name.includes(query) ||
      c.nameEn.toLowerCase().includes(lowerQuery) ||
      c.code.toLowerCase() === lowerQuery
  );
}

export function getCountriesByContinent(continent: string): Country[] {
  if (continent === '전체') return COUNTRIES;
  return COUNTRIES.filter(c => c.continent === continent);
}

export function getPopularCountries(): Country[] {
  return POPULAR_COUNTRIES.map(code => getCountryByCode(code)).filter(
    (c): c is Country => c !== undefined
  );
}
