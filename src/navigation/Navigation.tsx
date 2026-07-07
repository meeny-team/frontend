/**
 * Meeny - Main Navigation
 *
 * 딥링크 지원 URL:
 *   - meeny://invite/{code}                       — 커스텀 스킴 (fallback)
 *   - https://meeny.store/invite/{code}           — Universal / App Links
 *   - https://www.meeny.store/invite/{code}       — Universal / App Links (www)
 *
 * 네이티브 등록:
 *   - iOS  Info.plist CFBundleURLTypes ('meeny') + MeenyApp.entitlements (applinks)
 *   - Android AndroidManifest.xml intent-filter (scheme=meeny + https autoVerify)
 *   - 서버쪽 파일: /.well-known/apple-app-site-association + /.well-known/assetlinks.json
 *     (docs/deeplinks.md 참고)
 */

import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { useAuth } from '../auth/Auth';
import UnauthorizedStack from './UnauthorizedStack';
import AuthorizedStack, { AuthorizedStackParamList } from './AuthorizedStack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../design';

const linking: LinkingOptions<AuthorizedStackParamList> = {
  prefixes: [
    'meeny://',
    'https://meeny.store',
    'https://www.meeny.store',
  ],
  config: {
    screens: {
      Home: {
        // meeny://invite/CODE 또는 https://meeny.store/invite/CODE → Home { inviteCode: "CODE" }
        path: 'invite/:inviteCode',
        parse: { inviteCode: (v: string) => v.toUpperCase() },
      },
    },
  },
};

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    // linking 은 인증된 스택에서만 의미가 있음 — Unauthorized 일 땐 OS 가 앱을 켜고
    // 사용자가 로그인하면 그 뒤로 Home navigate 가 되도록 OS Linking.getInitialURL 처리 필요.
    // 일단 인증 완료 후 진입 케이스만 처리한다.
    <NavigationContainer linking={isAuthenticated ? linking : undefined}>
      {isAuthenticated ? <AuthorizedStack /> : <UnauthorizedStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
