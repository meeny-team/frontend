/**
 * Meeny - Main App Entry Point
 * Z세대 소비 공유 앱
 */

import React from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthProvider } from './src/auth/Auth';
import Navigation from './src/navigation/Navigation';
import { colors } from './src/design';
import { GOOGLE_WEB_CLIENT_ID } from './src/config';

// Google 로그인은 Android 전용. iOS 에서 configure 호출 시 GoogleService-Info.plist
// 또는 iosClientId 가 없으면 네이티브가 즉시 throw 하므로 platform 분기 필수.
if (Platform.OS === 'android') {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });
}

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
