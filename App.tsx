/**
 * Meeny - Main App Entry Point
 * Z세대 소비 공유 앱
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthProvider } from './src/auth/Auth';
import Navigation from './src/navigation/Navigation';
import { colors } from './src/design';
import { GOOGLE_WEB_CLIENT_ID } from './src/config';

// Google 로그인은 webClientId 가 있어야 ID token 의 audience 가 백엔드와 일치한다.
// 모듈 로드 시 한 번만 설정.
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
