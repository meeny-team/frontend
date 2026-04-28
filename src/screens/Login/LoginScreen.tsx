/**
 * Meeny - Login Screen
 * Clean, professional design
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, spacing, radius } from '../../design';
import { useAuth } from '../../auth/Auth';

const { width } = Dimensions.get('window');

// Kakao Icon
function KakaoIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="#191600">
      <Path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.041 5.893l-.857 3.182a.25.25 0 0 0 .374.279l3.682-2.455c.88.148 1.797.226 2.76.226 5.523 0 10-3.477 10-7.75S17.523 3 12 3" />
    </Svg>
  );
}

// Apple Icon
function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#000000">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </Svg>
  );
}

// Arrow Icon
function ArrowRightIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.tertiary} strokeWidth={2}>
      <Path d="M5 12h14M12 5l7 7-7 7" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { loginWithKakao } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoMark}>
            <Text style={styles.logoSymbol}>M</Text>
          </View>
          <Text style={styles.logoText}>Meeny</Text>
          <Text style={styles.tagline}>같은 돈, 다른 소비</Text>
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.descText}>
            친구들과 소비를 공유하고{'\n'}
            서로의 지출 패턴을 비교해보세요
          </Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.kakaoButton} onPress={loginWithKakao} activeOpacity={0.8}>
            <KakaoIcon />
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.appleButton} onPress={loginWithKakao} activeOpacity={0.8}>
            <AppleIcon />
            <Text style={styles.appleButtonText}>Apple로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestButton} onPress={loginWithKakao} activeOpacity={0.7}>
            <Text style={styles.guestButtonText}>둘러보기</Text>
            <ArrowRightIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.terms}>
          시작하면 <Text style={styles.link}>이용약관</Text> 및{' '}
          <Text style={styles.link}>개인정보처리방침</Text>에 동의합니다
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoSymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 15,
    color: colors.secondary,
  },
  descSection: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  descText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.tertiary,
    textAlign: 'center',
  },
  buttonSection: {
    gap: spacing.md,
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.kakao,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.kakaoForeground,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.apple,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appleForeground,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 16,
    marginTop: spacing.sm,
  },
  guestButtonText: {
    fontSize: 15,
    color: colors.tertiary,
  },
  footer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing['2xl'],
  },
  terms: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.tertiary,
  },
});
