/**
 * 둘러보기(loginAsGuest) 진입용 게스트 fixture.
 * 그 외 모든 도메인 데이터는 백엔드 API 로부터 받는다.
 *
 * 형태는 api/user.ts 의 mapUser() 결과(User: id 는 백엔드 Long → string)와 동일해야 한다.
 * 게스트 id 는 실제 백엔드 회원과 충돌하지 않도록 '0' 으로 고정.
 */

import { User } from './schema';

export const users: User[] = [
  {
    id: '0',
    nickname: '게스트',
    bio: '둘러보기 모드',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
];

export const CURRENT_USER = users[0];
