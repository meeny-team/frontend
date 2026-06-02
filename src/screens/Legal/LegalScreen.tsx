/**
 * Meeny - Legal Screen
 *
 * 이용약관 / 개인정보 처리방침 인앱 화면.
 * 두 화면이 헤더와 본문만 다르므로 type 라우트 파라미터로 분기한다.
 *
 * 본문은 운영 출시 시점에 법무 검토를 거쳐 다시 다듬을 것을 전제로 한,
 * Meeny 서비스의 실제 기능(소셜 로그인, 크루-플레이-핀, 이미지 업로드, 정산)
 * 에 맞춘 표준 KR 앱 약관/처리방침 초안.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Polyline } from 'react-native-svg';
import { colors, spacing } from '../../design';

export type LegalType = 'terms' | 'privacy';

type LegalRouteParams = { type: LegalType };

type RouteProps = RouteProp<{ Legal: LegalRouteParams }, 'Legal'>;

function ChevronLeftIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth={1.5}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

interface LegalSection {
  heading: string;
  body: string;
}

const TITLES: Record<LegalType, string> = {
  terms: '이용약관',
  privacy: '개인정보 처리방침',
};

const EFFECTIVE_DATE = '2026년 5월 7일';

const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: '제1조 (목적)',
    body:
      '본 약관은 Meeny(이하 "서비스")를 이용함에 있어 서비스 제공자(이하 "운영자")와 이용자 간의 권리, 의무 및 책임사항, 그 밖에 필요한 사항을 규정함을 목적으로 합니다.',
  },
  {
    heading: '제2조 (용어의 정의)',
    body:
      '1. "서비스"란 운영자가 제공하는 Meeny 모바일 애플리케이션 및 부수 기능을 의미합니다.\n' +
      '2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.\n' +
      '3. "크루"란 함께 지출을 기록·공유하는 이용자 그룹을 의미합니다.\n' +
      '4. "플레이"란 크루 내에서 진행하는 이벤트(여행, 모임 등)의 단위를 의미합니다.\n' +
      '5. "핀"이란 플레이에 등록되는 개별 지출 항목을 의미합니다.\n' +
      '6. "정산"이란 플레이에 기록된 핀을 기반으로 멤버 간 송금 관계를 계산하는 기능을 의미합니다.',
  },
  {
    heading: '제3조 (약관의 효력 및 변경)',
    body:
      '1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.\n' +
      '2. 운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정사유를 명시하여 적용일자 7일 전부터 공지합니다. 다만 이용자에게 불리한 변경의 경우에는 30일 전부터 공지합니다.\n' +
      '3. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.',
  },
  {
    heading: '제4조 (서비스의 제공 및 변경)',
    body:
      '1. 운영자는 다음과 같은 서비스를 제공합니다.\n' +
      '  - 크루 생성·참여 및 관리\n' +
      '  - 플레이 생성·관리 및 멤버 초대\n' +
      '  - 핀(지출) 기록 및 정산\n' +
      '  - 프로필 및 이미지 관리\n' +
      '  - 기타 운영자가 정하는 부수 서비스\n' +
      '2. 운영자는 운영상·기술상 필요에 따라 서비스의 일부 또는 전부를 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 다만 긴급한 시스템 장애·점검의 경우 사후에 공지할 수 있습니다.',
  },
  {
    heading: '제5조 (회원가입 및 계정)',
    body:
      '1. 회원가입은 Google, 카카오, Apple 등 운영자가 지원하는 소셜 로그인 수단을 통해 이루어집니다.\n' +
      '2. 만 14세 미만 아동은 서비스를 이용할 수 없습니다.\n' +
      '3. 이용자는 1인 1계정을 원칙으로 하며, 자신의 계정을 타인에게 양도·대여할 수 없습니다.\n' +
      '4. 이용자는 회원 정보(닉네임, 프로필 이미지, 자기소개)를 직접 변경할 수 있으며, 정확하고 최신의 정보를 유지해야 합니다.',
  },
  {
    heading: '제6조 (이용자의 의무)',
    body:
      '이용자는 다음 행위를 하여서는 안 됩니다.\n' +
      '1. 타인의 정보를 도용하거나 허위 정보를 등록하는 행위\n' +
      '2. 운영자 또는 제3자의 저작권 등 지식재산권을 침해하는 행위\n' +
      '3. 서비스의 안정적 운영을 방해하거나 시스템에 무단 접근을 시도하는 행위\n' +
      '4. 음란·폭력적 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 게시·전송하는 행위\n' +
      '5. 영리 목적의 광고성 정보를 다른 이용자에게 전송하는 행위\n' +
      '6. 정산 정보를 임의로 조작하거나 허위로 입력해 다른 이용자에게 손해를 끼치는 행위',
  },
  {
    heading: '제7조 (게시물의 권리와 책임)',
    body:
      '1. 이용자가 서비스 내에 등록한 게시물(텍스트, 이미지, 핀 데이터 등)의 저작권은 해당 이용자에게 귀속됩니다.\n' +
      '2. 운영자는 서비스의 운영, 표시, 백업, 전송, 배포, 홍보를 위한 목적에 한하여 해당 게시물을 사용할 수 있으며, 이 경우 저작인격권을 침해하지 않습니다.\n' +
      '3. 이용자가 게시한 게시물이 제3자의 권리를 침해하는 경우 그 책임은 해당 이용자에게 있습니다.\n' +
      '4. 운영자는 관련 법령 위반 게시물에 대해 사전 통지 없이 삭제·비공개 처리할 수 있습니다.',
  },
  {
    heading: '제8조 (서비스 이용의 제한 및 계약 해지)',
    body:
      '1. 운영자는 이용자가 본 약관 또는 관련 법령을 위반한 경우 사전 통지 후 서비스 이용을 일시 중지하거나 계정을 영구 정지할 수 있습니다.\n' +
      '2. 이용자는 언제든지 서비스 내 "회원 탈퇴" 기능을 통해 이용계약을 해지할 수 있습니다.\n' +
      '3. 회원 탈퇴 시 이용자가 작성한 게시물 중 다른 이용자와 공유된 항목(공동 크루의 핀 등)은 정산 무결성을 위해 익명 처리된 상태로 남을 수 있습니다.',
  },
  {
    heading: '제9조 (면책조항)',
    body:
      '1. 운영자는 천재지변, 전쟁, 기간통신사업자의 서비스 중단, 해킹 등 운영자의 합리적 관리 범위를 벗어난 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.\n' +
      '2. 운영자는 이용자 간 또는 이용자와 제3자 간의 거래·정산·송금 과정에서 발생한 손해에 대해 책임을 지지 않습니다. 정산 결과는 참고용이며, 실제 송금은 이용자의 책임 하에 이루어집니다.\n' +
      '3. 운영자는 이용자가 서비스에 게재한 정보의 정확성, 신뢰성에 대해 보증하지 않습니다.',
  },
  {
    heading: '제10조 (분쟁의 해결 및 준거법)',
    body:
      '1. 본 약관과 관련하여 발생한 분쟁은 우선 운영자와 이용자가 상호 협의하여 해결합니다.\n' +
      '2. 협의가 이루어지지 않는 경우 민사소송법에 따른 관할법원에 소를 제기할 수 있습니다.\n' +
      '3. 본 약관의 해석 및 운영자와 이용자 간의 분쟁에 대해서는 대한민국 법령을 적용합니다.',
  },
  {
    heading: '부칙',
    body: `본 약관은 ${EFFECTIVE_DATE}부터 시행합니다.`,
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: '1. 개인정보의 처리 목적',
    body:
      'Meeny(이하 "서비스")는 다음의 목적을 위하여 개인정보를 처리하며, 처리 목적이 변경되는 경우에는 사전에 동의를 구합니다.\n' +
      '· 회원 가입 및 본인 식별\n' +
      '· 서비스 제공(크루·플레이·핀 기록 및 정산)\n' +
      '· 회원 간 활동 표시(닉네임, 프로필 이미지)\n' +
      '· 부정 이용 방지 및 서비스 안정성 확보\n' +
      '· 고객 문의 응대 및 분쟁 처리',
  },
  {
    heading: '2. 수집하는 개인정보 항목',
    body:
      '회원가입 및 서비스 이용 과정에서 다음 정보를 수집합니다.\n\n' +
      '[필수]\n' +
      '· 소셜 로그인 식별자 (Google, 카카오, Apple 의 provider, providerId)\n' +
      '· 이메일\n' +
      '· 닉네임\n\n' +
      '[선택]\n' +
      '· 프로필 이미지\n' +
      '· 자기소개\n\n' +
      '[자동 수집]\n' +
      '· 서비스 이용 기록(크루·플레이·핀·정산 활동)\n' +
      '· 이용자가 업로드한 이미지(핀 영수증, 크루 커버 등)\n' +
      '· 단말 정보, IP 주소, 접속 로그(보안·디버깅 용도)',
  },
  {
    heading: '3. 개인정보의 보유 및 이용기간',
    body:
      '1. 회원의 개인정보는 회원 탈퇴 시 지체 없이 파기합니다.\n' +
      '2. 다만 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.\n' +
      '  - 통신비밀보호법: 로그인 기록, 접속 IP 정보 (3개월)\n' +
      '  - 전자상거래법: 분쟁 해결을 위한 기록 (3년)\n' +
      '3. 정산 무결성 보존을 위해, 다른 이용자와 공유된 핀(지출) 데이터는 작성자 탈퇴 후에도 익명 처리된 상태로 해당 크루 내에 유지될 수 있습니다.',
  },
  {
    heading: '4. 개인정보의 제3자 제공',
    body:
      '서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.\n' +
      '· 이용자가 사전에 동의한 경우\n' +
      '· 법령의 규정에 의거하거나 수사 목적으로 법정 절차에 따라 요구되는 경우',
  },
  {
    heading: '5. 개인정보 처리 위탁',
    body:
      '서비스는 원활한 운영을 위해 다음과 같이 개인정보 처리 업무를 외부에 위탁합니다.\n\n' +
      '· Amazon Web Services (AWS): 데이터 및 이미지 저장(S3), 서버 호스팅\n' +
      '· Google LLC: Google 소셜 로그인 인증\n' +
      '· Kakao Corp.: 카카오 소셜 로그인 인증\n' +
      '· Apple Inc.: Apple 소셜 로그인 인증\n\n' +
      '위탁 업무 내용은 회원 식별 및 서비스 제공에 한정되며, 위탁 계약 시 관련 법령에 따라 안전하게 관리되도록 규정하고 있습니다.',
  },
  {
    heading: '6. 정보주체의 권리·의무 및 행사 방법',
    body:
      '이용자는 언제든지 다음의 권리를 행사할 수 있습니다.\n' +
      '· 개인정보 열람·정정: 앱 내 프로필 화면에서 직접 변경\n' +
      '· 처리 정지·삭제: 앱 내 "회원 탈퇴" 기능을 통해 일괄 처리\n' +
      '· 동의 철회: 회원 탈퇴와 동일한 효과로 처리\n\n' +
      '권리 행사로 인해 다른 이용자의 정산 활동에 영향이 가는 경우(예: 공유 핀의 작성자 정보)에는 일부 정보가 익명화된 형태로 유지될 수 있습니다.',
  },
  {
    heading: '7. 개인정보의 안전성 확보 조치',
    body:
      '서비스는 개인정보 보호를 위해 다음과 같은 조치를 시행합니다.\n' +
      '· 통신 구간 암호화(HTTPS) 적용\n' +
      '· 인증 토큰(JWT) 기반의 접근 통제 및 자동 만료·재발급\n' +
      '· 이미지 등 비공개 자산은 짧은 만료 시간을 가진 presigned URL 로만 접근\n' +
      '· 최소 수집 원칙 — 서비스 제공에 필요한 항목만 수집\n' +
      '· 접근 권한 분리 및 정기 점검',
  },
  {
    heading: '8. 개인정보 보호책임자 및 문의',
    body:
      '서비스의 개인정보 처리 관련 문의·민원은 아래 연락처로 접수해 주시기 바랍니다.\n' +
      '· 이메일: wyzmqkr11@naver.com\n\n' +
      '운영자는 정보주체의 문의에 대해 지체 없이 답변 및 처리합니다.',
  },
  {
    heading: '9. 처리방침의 변경',
    body:
      '본 처리방침은 법령·정책 또는 보안기술의 변경에 따라 수정될 수 있습니다. 변경 시 적용일자 및 변경 사유를 본 화면을 통해 공지하며, 이용자에게 불리한 변경의 경우 적용일자 30일 전부터 안내합니다.',
  },
  {
    heading: '부칙',
    body: `본 처리방침은 ${EFFECTIVE_DATE}부터 시행합니다.`,
  },
];

const SECTIONS: Record<LegalType, LegalSection[]> = {
  terms: TERMS_SECTIONS,
  privacy: PRIVACY_SECTIONS,
};

export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { type } = route.params;
  const sections = SECTIONS[type];

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
        <Text style={styles.effective}>시행일: {EFFECTIVE_DATE}</Text>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
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
  effective: {
    fontSize: 12,
    color: colors.tertiary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.secondary,
  },
});
