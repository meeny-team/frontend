/**
 * api/utils 순수 함수 테스트
 *
 * 포맷팅은 화면 곳곳(정산/플레이/핀 카드)에서 KRW · 날짜 표기에 그대로 노출되므로
 * 회귀가 발생하면 UI 가 깨진다. 잠재적 사고: 화폐가 음수일 때, 날짜에 시각이 붙은 ISO 일 때.
 */

import {
  formatCurrency,
  formatDate,
  formatDateRange,
  generateId,
  generateInviteCode,
} from '../../src/api/utils';

describe('formatCurrency', () => {
  test('정수 KRW 표기 — 천 단위 콤마, ₩ 기호, 소수 없음', () => {
    expect(formatCurrency(35000)).toBe('₩35,000');
    expect(formatCurrency(0)).toBe('₩0');
  });

  test('소수점은 maximumFractionDigits=0 으로 잘림', () => {
    expect(formatCurrency(1234.7)).toBe('₩1,235');
  });

  test('음수 금액도 표기 가능 — 환불/차감 케이스', () => {
    expect(formatCurrency(-5000)).toContain('5,000');
  });
});

describe('formatDate', () => {
  test('YYYY-MM-DD ISO → "M월 D일"', () => {
    expect(formatDate('2026-01-09')).toBe('1월 9일');
    expect(formatDate('2026-12-31')).toBe('12월 31일');
  });
});

describe('formatDateRange', () => {
  test('end 가 있으면 "M/D - M/D"', () => {
    expect(formatDateRange({ start: '2026-05-01', end: '2026-05-07' })).toBe('5/1 - 5/7');
  });

  test('end 가 없으면 단일 날짜만', () => {
    expect(formatDateRange({ start: '2026-05-01' })).toBe('5/1');
  });
});

describe('generateInviteCode', () => {
  test('대문자/숫자 6자리', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  test('충돌 가능성은 있지만 대량 생성 시 거의 모두 unique', () => {
    const set = new Set<string>();
    for (let i = 0; i < 200; i++) set.add(generateInviteCode());
    // 200 개 생성 시 중복 5개 미만이면 OK (36^6 공간이라 사실상 충돌 안 남)
    expect(set.size).toBeGreaterThan(195);
  });
});

describe('generateId', () => {
  test('prefix 가 그대로 붙음', () => {
    expect(generateId('crew_')).toMatch(/^crew_\d+$/);
  });
});
