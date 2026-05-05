/**
 * Meeny - Auth Context
 *
 * 흐름:
 *  - 부팅 시 AsyncStorage 의 토큰을 복원하고 GET /api/users/me 로 사용자 정보를 채움
 *    (만료/무효 토큰이면 저장소를 비우고 로그아웃 상태로 시작)
 *  - 로그인 성공: 토큰을 메모리 + AsyncStorage 에 저장, fetchMe 로 user 채움
 *  - 로그아웃: 백엔드 호출 + 카카오/구글 세션 종료 + AsyncStorage 초기화
 *
 * 카카오/애플:
 *  - 카카오: native SDK 로 access token 획득 → 백엔드에 그대로 전달
 *  - 애플: iOS 빌드 시점에 추가 (지금은 loginAsGuest 로 임시 진입)
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import { CURRENT_USER, User } from '../api';
import {
  socialLogin,
  fetchMe,
  logout as apiLogout,
  AuthApiError,
  TokenResponse,
  MemberProfile,
} from '../api/auth';
import { saveTokens, loadTokens, clearTokens } from './tokenStorage';

interface AuthContextType {
  user: MemberProfile | User | null;
  tokens: TokenResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithKakao: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MemberProfile | User | null>(null);
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 토큰으로 자동 복원
  useEffect(() => {
    (async () => {
      const stored = await loadTokens();
      if (stored) {
        try {
          const me = await fetchMe(stored.accessToken);
          setTokens(stored);
          setUser(me);
        } catch {
          // 만료/무효 토큰 → 깨끗하게 비우고 로그아웃 상태로 시작
          await clearTokens();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  // 백엔드에서 새 토큰을 받은 직후의 공통 후처리:
  // 토큰 영속화 + 사용자 프로필 호출까지 묶어 한 호출자에서 다 처리한다.
  const completeLogin = async (issued: TokenResponse) => {
    const me = await fetchMe(issued.accessToken);
    await saveTokens(issued);
    setTokens(issued);
    setUser(me);
  };

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      const idToken =
        // @ts-expect-error 16.x({type,data}) 와 그 미만 버전 모두 지원하기 위해 두 형태 허용
        result?.data?.idToken ?? result?.idToken;
      if (!idToken) {
        throw new Error('Google ID token 을 받지 못했습니다.');
      }
      const issued = await socialLogin('GOOGLE', idToken);
      await completeLogin(issued);
    } catch (err) {
      if (
        (err as { code?: string })?.code === statusCodes.SIGN_IN_CANCELLED ||
        (err as { code?: string })?.code === statusCodes.IN_PROGRESS
      ) {
        return; // 사용자 취소는 조용히 무시
      }
      if (err instanceof AuthApiError) {
        console.warn('[auth] backend rejected:', err.code, err.message);
      } else {
        console.warn('[auth] google sign-in failed:', err);
      }
      throw err;
    }
  };

  const loginWithKakao = async () => {
    try {
      const kakao = await kakaoLogin();
      // 백엔드는 kakao access token 으로 카카오 API(/v2/user/me) 를 직접 호출해 사용자 정보를 가져온다.
      const issued = await socialLogin('KAKAO', kakao.accessToken);
      await completeLogin(issued);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? '';
      // 카카오 SDK 가 사용자 취소 시 던지는 에러는 메시지로만 식별 가능 (전용 코드 없음)
      if (msg.includes('user cancelled') || msg.includes('canceled')) {
        return;
      }
      if (err instanceof AuthApiError) {
        console.warn('[auth] backend rejected:', err.code, err.message);
      } else {
        console.warn('[auth] kakao sign-in failed:', err);
      }
      throw err;
    }
  };

  const loginAsGuest = () => {
    // 애플 미구현 + "둘러보기" 임시 진입용. 실제 백엔드 호출 없이 mock 사용자로 진입.
    setUser(CURRENT_USER);
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await apiLogout(tokens.refreshToken);
      }
    } catch (err) {
      console.warn('[auth] logout call failed:', err);
    }
    try {
      await GoogleSignin.signOut();
    } catch {
      /* 세션이 없을 수도 있음 */
    }
    try {
      await kakaoLogout();
    } catch {
      /* 세션이 없을 수도 있음 */
    }
    await clearTokens();
    setUser(null);
    setTokens(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithKakao,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
