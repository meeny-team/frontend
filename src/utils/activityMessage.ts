/**
 * Activity 타입별 표시 메시지/아이콘 변환.
 * payload 의 필드 부재 시 안전한 폴백을 두어 백엔드 스키마 변화에 견디게 한다.
 */

import { Activity } from '../api';

const actorOf = (a: Activity): string => a.actor?.nickname ?? '누군가';

const playTitle = (a: Activity): string => {
  const t = a.payload?.playTitle;
  return typeof t === 'string' && t.length > 0 ? `'${t}'` : '플레이';
};

const pinTitle = (a: Activity): string => {
  const t = a.payload?.pinTitle;
  return typeof t === 'string' && t.length > 0 ? `'${t}'` : '핀';
};

const amount = (a: Activity): string => {
  const v = a.payload?.amount;
  if (typeof v !== 'number') return '';
  return ' (' + new Intl.NumberFormat('ko-KR').format(v) + '원)';
};

// 사용자에게 보여줄 한국어 한 줄
export function activityMessage(a: Activity): string {
  const who = actorOf(a);
  switch (a.type) {
    case 'CREW_JOINED':
      return `${who}님이 크루에 합류했어요`;
    case 'MEMBER_LEFT':
      return `${who}님이 크루를 떠났어요`;
    case 'PLAY_CREATED':
      return `${who}님이 ${playTitle(a)} 플레이를 시작했어요`;
    case 'PLAY_SETTLED':
      return `${who}님이 ${playTitle(a)} 정산을 마감했어요`;
    case 'PIN_ADDED':
      return `${who}님이 새 핀 ${pinTitle(a)}${amount(a)}를 추가했어요`;
    case 'PIN_UPDATED':
      return `${who}님이 ${pinTitle(a)} 핀을 수정했어요`;
    case 'PIN_DELETED':
      return `${who}님이 ${pinTitle(a)} 핀을 삭제했어요`;
    case 'TRANSFER_SENT':
      return `${who}님이 ${pinTitle(a)}${amount(a)} 송금을 보냈음으로 표시했어요`;
    case 'TRANSFER_RECEIVED':
      return `${who}님이 ${pinTitle(a)}${amount(a)} 송금을 받음으로 확인했어요`;
    default:
      return '활동';
  }
}

// 카드 좌측 작은 이모지 — type 별
export function activityEmoji(type: Activity['type']): string {
  switch (type) {
    case 'CREW_JOINED': return '👋';
    case 'MEMBER_LEFT': return '👋';
    case 'PLAY_CREATED': return '✨';
    case 'PLAY_SETTLED': return '🎉';
    case 'PIN_ADDED': return '📍';
    case 'PIN_UPDATED': return '✏️';
    case 'PIN_DELETED': return '🗑️';
    case 'TRANSFER_SENT': return '💸';
    case 'TRANSFER_RECEIVED': return '✅';
    default: return '•';
  }
}

// 상대 시간 표시 — "방금", "5분 전", "어제", "3일 전". 일주일 넘으면 절대 날짜
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day === 1) return '어제';
  if (day < 7) return `${day}일 전`;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
