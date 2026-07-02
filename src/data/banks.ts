/**
 * Meeny — 한국 은행 코드 리스트
 *
 * KFTC 은행 코드(3자리) 를 그대로 사용한다. 표시 순서는 사용 빈도 대략순.
 * 백엔드는 코드값만 저장하고 검증도 프론트가 담당 (사이드 프로젝트 스코프).
 */

export interface Bank {
  code: string;
  name: string;
}

export const BANKS: Bank[] = [
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
  { code: '089', name: '케이뱅크' },
  { code: '088', name: '신한은행' },
  { code: '004', name: 'KB국민은행' },
  { code: '081', name: '하나은행' },
  { code: '020', name: '우리은행' },
  { code: '011', name: 'NH농협은행' },
  { code: '003', name: 'IBK기업은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '한국씨티은행' },
  { code: '031', name: 'iM뱅크(대구)' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },
  { code: '035', name: '제주은행' },
  { code: '007', name: '수협은행' },
  { code: '071', name: '우체국' },
  { code: '045', name: '새마을금고' },
  { code: '048', name: '신협' },
];

const BANK_BY_CODE = new Map(BANKS.map(b => [b.code, b]));

export function bankName(code?: string | null): string | undefined {
  if (!code) return undefined;
  return BANK_BY_CODE.get(code)?.name;
}
