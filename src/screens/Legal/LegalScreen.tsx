/**
 * Meeny - Legal Screen
 *
 * 이용약관 / 개인정보 처리방침 인앱 화면.
 * 두 화면이 헤더와 본문 텍스트만 다르므로 type 라우트 파라미터로 분기한다.
 *
 * 본문은 운영 출시 전 실제 텍스트로 교체할 자리(placeholder). 외부 호스팅으로
 * 옮길 경우 이 화면을 Linking.openURL 로 대체할 수 있다.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Polyline } from 'react-native-svg';
import { colors, spacing } from '../../design';

export type LegalType = 'terms' | 'privacy';

type LegalRouteParams = { type: LegalType };

// AuthorizedStack / UnauthorizedStack 양쪽에서 같은 라우트 이름 'Legal' 로 등록하므로
// 어느 스택이든 동일하게 동작.
type RouteProps = RouteProp<{ Legal: LegalRouteParams }, 'Legal'>;

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={1.5}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

const TITLES: Record<LegalType, string> = {
  terms: '이용약관',
  privacy: '개인정보 처리방침',
};

const BODIES: Record<LegalType, string> = {
  terms:
    '본 이용약관은 Meeny 서비스 이용에 관한 조건과 절차, 회사와 이용자 간의 권리·의무 및 책임 사항 등 기본적인 사항을 규정합니다.\n\n' +
    '※ 정식 출시 전 약관 본문이 갱신될 예정입니다. 최신 내용은 출시 시점에 이 화면을 통해 확인하실 수 있습니다.',
  privacy:
    'Meeny 는 이용자의 개인정보 보호를 중요하게 여기며, 관련 법령을 준수합니다. 본 처리방침은 Meeny 가 어떤 정보를 수집하고, 어떻게 이용·보관·파기하는지 안내합니다.\n\n' +
    '※ 정식 출시 전 처리방침 본문이 갱신될 예정입니다. 최신 내용은 출시 시점에 이 화면을 통해 확인하실 수 있습니다.',
};

export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { type } = route.params;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.title}>{TITLES[type]}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.body}>{BODIES[type]}</Text>
        <View style={{ height: insets.bottom + spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
  },
  headerRight: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.secondary,
  },
});
