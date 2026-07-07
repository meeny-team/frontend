/**
 * AddPinScreen 안에서 쓰이던 인라인 SVG 아이콘들. 화면 파일 슬림화 목적으로만 분리.
 * 다른 화면과 공용화가 필요해지면 src/components/icons/ 로 승격.
 */

import React from 'react';
import Svg, { Line, Polyline, Circle, Path } from 'react-native-svg';
import { colors } from '../../design';

export function XIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={2}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

export function CheckIcon({ color = colors.foreground, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function SearchIcon({ color = colors.foreground }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function MapPinIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.tertiary} strokeWidth={2}>
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
}
