/**
 * Meeny - Settings Screen
 * 모노 캘린더 스타일: 심플한 라인 구분 리스트
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg';
import { colors, spacing } from '../../design';
import { CURRENT_USER } from '../../api';
import { useAuth } from '../../auth/Auth';
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
  const { logout } = useAuth();

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
            <Text style={styles.profileAvatarText}>{CURRENT_USER.nickname[0]}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{CURRENT_USER.nickname}</Text>
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
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.6}>
            <Text style={styles.menuText}>이용약관</Text>
            <ChevronRightIcon />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.6}>
            <Text style={styles.menuText}>개인정보 처리방침</Text>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuRow} onPress={logout} activeOpacity={0.6}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
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
});
