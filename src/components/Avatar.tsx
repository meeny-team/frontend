/**
 * Meeny - 공용 사용자 아바타
 *
 * profileImage 가 있으면 사진을, 없으면 닉네임 첫 글자를 컬러 원에 표시.
 * 사이즈/배경/글자색 등은 호출부 스타일과 맞추기 위해 props 로 노출.
 * borderWidth 등 추가 데코는 style 로 덧붙여 (이미지/폴백 둘 다 적용).
 */

import React, { memo } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../design';

interface AvatarProps {
  nickname: string;
  profileImage?: string | null;
  size: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
  // 이미지/폴백 둘 다 적용되도록 두 타입 모두 허용. 호출부에서 marginBottom/borderWidth 등 공통 속성만 쓰면 충돌 없음.
  style?: StyleProp<ViewStyle> | StyleProp<ImageStyle>;
}

export const Avatar = memo(function Avatar({
  nickname,
  profileImage,
  size,
  fontSize,
  backgroundColor = colors.elevated,
  textColor = colors.foreground,
  style,
}: AvatarProps) {
  const borderRadius = size / 2;
  const initial = nickname?.[0] ?? '?';
  const computedFontSize = fontSize ?? Math.round(size * 0.42);

  if (profileImage) {
    return (
      <Image
        source={{ uri: profileImage }}
        style={[
          { width: size, height: size, borderRadius, backgroundColor },
          style as StyleProp<ImageStyle>,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius, backgroundColor },
        style as StyleProp<ViewStyle>,
      ]}
    >
      <Text style={[styles.initial, { fontSize: computedFontSize, color: textColor }]}>
        {initial}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '600',
  },
});
