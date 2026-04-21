/**
 * Meeny Design System - Colors
 * 모노 캘린더 스타일: 흰색/검정 베이스 + 베이지 포인트
 */

export const colors = {
  // Base - 깔끔한 흰색
  background: '#ffffff',
  surface: '#fafafa',
  elevated: '#f5f5f5',
  subtle: '#f0f0f0',

  // Text - 검정 계열
  foreground: '#1a1a1a',
  secondary: '#4a4a4a',
  tertiary: '#8a8a8a',
  muted: '#b0b0b0',
  placeholder: '#c8c8c8',

  // Border
  border: '#e8e8e8',
  borderLight: '#f0f0f0',
  borderSubtle: '#f5f5f5',

  // Brand - 베이지 포인트
  brand: '#c9a978',
  brandLight: '#d9bc8e',
  brandForeground: '#ffffff',
  brandMuted: 'rgba(201, 169, 120, 0.12)',
  brandHover: '#b89860',
  brandSubtle: 'rgba(201, 169, 120, 0.06)',

  // Semantic
  positive: '#5c9e6e',
  positiveMuted: 'rgba(92, 158, 110, 0.1)',
  negative: '#d45c5c',
  negativeMuted: 'rgba(212, 92, 92, 0.1)',
  warning: '#d4a84c',
  warningMuted: 'rgba(212, 168, 76, 0.1)',

  // Category Colors
  categoryFood: '#d45c5c',
  categoryCafe: '#d4a84c',
  categoryShopping: '#a070b0',
  categoryTransport: '#5080b0',
  categoryStay: '#7868b0',
  categoryActivity: '#5c9e6e',
  categoryEtc: '#8a8a8a',

  // Play Type Colors
  playTravel: '#5080b0',
  playDate: '#a070b0',
  playHangout: '#d4a84c',
  playDaily: '#5c9e6e',
  playEtc: '#8a8a8a',

  // Social Login
  kakao: '#FEE500',
  kakaoForeground: '#1a1a1a',
  apple: '#1a1a1a',
  appleForeground: '#ffffff',

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  glass: 'rgba(255, 255, 255, 0.95)',

  // Gradient
  gradientBrand: ['#c9a978', '#b89860'],
  gradientSurface: ['#ffffff', '#fafafa'],
} as const;

export type ColorKey = keyof typeof colors;
