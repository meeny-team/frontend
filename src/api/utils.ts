/**
 * Meeny Utilities
 * 포맷팅, ID 생성, 데이터 조회 헬퍼 함수
 */

import { User, Crew, Play, Pin, DateRange } from './schema';
import { users, crews, plays, pins } from './mock';

// ============================================
// 포맷팅
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDateRange(dateRange: DateRange): string {
  const format = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (dateRange.end) {
    return `${format(dateRange.start)} - ${format(dateRange.end)}`;
  }
  return format(dateRange.start);
}

// ============================================
// ID 생성
// ============================================

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}`;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

// ============================================
// 데이터 조회 헬퍼
// ============================================

export function getUserById(userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function getCrewById(crewId: string): Crew | undefined {
  return crews.find(c => c.id === crewId);
}

export function getPlayById(playId: string): Play | undefined {
  return plays.find(p => p.id === playId);
}

export function getPlaysByCrewId(crewId: string): Play[] {
  return plays.filter(p => p.crewId === crewId);
}

export function getPinsByPlayId(playId: string): Pin[] {
  return pins.filter(p => p.playId === playId);
}

export function getPlayTotalAmount(playId: string): number {
  return pins
    .filter(pin => pin.playId === playId)
    .reduce((sum, pin) => sum + pin.amount, 0);
}

export function getPlayAverageAmount(playId: string): number {
  const play = plays.find(p => p.id === playId);
  if (!play || play.members.length === 0) return 0;
  const total = getPlayTotalAmount(playId);
  return Math.round(total / play.members.length);
}

export function getPlayMembers(playId: string): User[] {
  const play = plays.find(p => p.id === playId);
  if (!play) return [];
  return play.members
    .map(id => users.find(u => u.id === id))
    .filter((u): u is User => u !== undefined);
}
