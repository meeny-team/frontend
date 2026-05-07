/**
 * Meeny - Settings Screen
 * 모노 캘린더 스타일: 심플한 라인 구분 리스트
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Polyline } from 'react-native-svg';
import { colors, spacing } from '../../design';
import { useAuth } from '../../auth/Auth';
import { getAccessToken } from '../../auth/session';
import { withdrawCurrentUser } from '../../api';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedStack';

type NavigationProp = NativeStackNavigationProp<AuthorizedStackParamList>;

// ============ Icons ============

function ChevronLeftIcon({ size = 24, color = colors.foreground }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function ChevronRightIcon({ size = 16, color = colors.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

// ============ Main Screen ============

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const nickname = user?.nickname ?? '게스트';
  const [withdrawing, setWithdrawing] = useState(false);

  // 회원탈퇴: 백엔드에 탈퇴 요청 후 로컬 세션까지 정리. 게스트(토큰 없음)는 메뉴 숨김.
  const handleWithdraw = () => {
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까? 모든 데이터가 영구적으로 삭제되며 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            if (withdrawing) return;
            setWithdrawing(true);
            const res = await withdrawCurrentUser();
            if (!res.data) {
              setWithdrawing(false);
              Alert.alert('탈퇴 실패', res.message ?? '잠시 후 다시 시도해주세요.');
              return;
            }
            // 백엔드 탈퇴는 성공 — 이어서 로컬 세션/소셜 토큰 정리.
            await logout();
            // 로그아웃이 user 를 null 로 비우면 AuthorizedStack 이 사라지므로 별도 navigate 불필요.
          },
        },
      ],
    );
  };

  const isLoggedIn = !!getAccessToken();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
        >
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Row */}
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate('ProfileEdit')}
          activeOpacity={0.6}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{nickname[0] ?? '?'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{nickname}</Text>
            <Text style={styles.profileSub}>프로필 수정</Text>
          </View>
          <ChevronRightIcon />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>정보</Text>

          <TouchableOpacity style={styles.menuRow} activeOpacity={0.6}>
            <Text style={styles.menuText}>버전</Text>
            <Text style={styles.menuValueText}>1.0.0</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Legal', { type: 'terms' })}
            activeOpacity={0.6}
          >
            <Text style={styles.menuText}>이용약관</Text>
            <ChevronRightIcon />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
            activeOpacity={0.6}
          >
            <Text style={styles.menuText}>개인정보 처리방침</Text>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuRow} onPress={logout} activeOpacity={0.6}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          {isLoggedIn && (
            <>
              <View style={styles.rowDivider} />
              <TouchableOpacity
                style={styles.menuRow}
                onPress={handleWithdraw}
                disabled={withdrawing}
                activeOpacity={0.6}
              >
                <Text style={styles.withdrawText}>
                  {withdrawing ? '탈퇴 처리 중...' : '회원탈퇴'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
  },
  headerRight: {
    width: 44,
  },

  // Profile Row
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.secondary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
  },
  profileSub: {
    fontSize: 14,
    color: colors.tertiary,
  },

  // Dividers
  divider: {
    height: 8,
    backgroundColor: colors.surface,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl,
  },

  // Section
  section: {
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.tertiary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },

  // Menu Row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  menuText: {
    fontSize: 16,
    color: colors.foreground,
  },
  menuValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuValueText: {
    fontSize: 15,
    color: colors.tertiary,
  },
  logoutText: {
    fontSize: 16,
    color: colors.negative,
  },
  withdrawText: {
    fontSize: 14,
    color: colors.tertiary,
  },
});
