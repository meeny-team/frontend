/**
 * Meeny - Auth Context
 *
 *  - 부팅: session 에서 토큰 복원 → fetchMe 로 사용자 정보 채움. 만료/무효 토큰이면
 *    request() 가 자동 refresh 를 시도하고, 그것마저 실패하면 onSessionExpired 가
 *    호출되어 user state 가 비워짐.
 *  - 로그인 성공: session 에 토큰 저장 → fetchMe 로 사용자 정보 채움
 *  - 로그아웃: 백엔드에 refresh 토큰 무효화 호출 + 카카오/구글 세션 종료 + session clear
 *
 * 토큰 자체는 session 모듈이 single source of truth. 이 컴포넌트는 user/loading 만 보유.
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
  MemberProfile,
  TokenResponse,
} from '../api/auth';
import {
  loadFromStorage,
  saveTokens,
  clearSession,
  getRefreshToken,
  setOnSessionExpired,
} from './session';

interface AuthContextType {
  user: MemberProfile | User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithKakao: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  // 프로필 수정 후 백엔드에서 받은 최신 프로필을 그대로 반영. 게스트(토큰 없음)는 호출 의미가 없어 사용처에서 분기.
  applyUser: (next: MemberProfile | User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MemberProfile | User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 시작 시 한 번: 저장된 토큰 복원 + 자동 로그인 + 세션 만료 알림 콜백 등록
  useEffect(() => {
    setOnSessionExpired(() => setUser(null));

    (async () => {
      const stored = await loadFromStorage();
      if (stored) {
        try {
          const me = await fetchMe();
          setUser(me);
        } catch {
          // 토큰이 만료되었고 자동 refresh 까지 실패한 경우. session 은 이미 비워져 있음.
        }
      }
      setIsLoading(false);
    })();

    return () => setOnSessionExpired(null);
  }, []);

  // 로그인 직후 공통 후처리: 토큰 영속화 → 사용자 프로필 호출
  // (saveTokens 가 먼저여야 fetchMe 가 자동으로 새 토큰을 첨부할 수 있다)
  const completeLogin = async (issued: TokenResponse) => {
    await saveTokens(issued);
    const me = await fetchMe();
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
        return;
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
      const issued = await socialLogin('KAKAO', kakao.accessToken);
      await completeLogin(issued);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? '';
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
    // 애플 미구현 + "둘러보기": 백엔드 호출 없이 mock 사용자로 진입
    setUser(CURRENT_USER);
  };

  const logout = async () => {
    const rt = getRefreshToken();
    try {
      if (rt) await apiLogout(rt);
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
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithKakao,
        loginAsGuest,
        logout,
        applyUser: setUser,
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
