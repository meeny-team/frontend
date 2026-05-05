/**
 * Meeny - Auth Context
 *
 * 현재 단계:
 *  - Google 로그인은 백엔드와 실제 연결됨 (POST /api/auth/social).
 *  - 카카오/애플은 미구현 → loginAsGuest 로 임시 진입.
 *  - 토큰은 메모리에만 보관. 영속화/refresh 흐름은 후속 작업.
 *  - 로그인 성공 후 사용자 정보는 일단 CURRENT_USER mock 으로 채움
 *    (백엔드 /api/me 가 생기면 교체).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { CURRENT_USER, User } from '../api';
import { socialLogin, logout as apiLogout, AuthApiError, TokenResponse } from '../api/auth';

interface AuthContextType {
  user: User | null;
  tokens: TokenResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 영속 저장소(AsyncStorage 등) 도입 전이라 시작 시 항상 로그아웃 상태.
    setIsLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();

      // SDK 16+ 는 { type, data } 형태 — 사용자가 취소하면 type !== 'success'
      const idToken =
        // @ts-expect-error 16.x 와 그 미만 버전 모두 지원하기 위해 두 형태 모두 허용
        result?.data?.idToken ?? result?.idToken;
      if (!idToken) {
        throw new Error('Google ID token 을 받지 못했습니다.');
      }

      const issued = await socialLogin('GOOGLE', idToken);
      setTokens(issued);
      setUser(CURRENT_USER);
    } catch (err) {
      // 사용자 취소는 조용히 무시
      if (
        (err as { code?: string })?.code === statusCodes.SIGN_IN_CANCELLED ||
        (err as { code?: string })?.code === statusCodes.IN_PROGRESS
      ) {
        return;
      }
      if (err instanceof AuthApiError) {
        // 백엔드가 거절한 경우 — 토큰 형식/만료/audience 검증 실패 등
        console.warn('[auth] backend rejected:', err.code, err.message);
      } else {
        console.warn('[auth] google sign-in failed:', err);
      }
      throw err;
    }
  };

  const loginAsGuest = () => {
    // 카카오/애플 미구현 + "둘러보기" 모두 일단 mock 사용자로 들어가게 함.
    setUser(CURRENT_USER);
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await apiLogout(tokens.refreshToken);
      }
    } catch (err) {
      // 로그아웃 호출 실패는 무시 — 어쨌든 로컬 상태는 비운다.
      console.warn('[auth] logout call failed:', err);
    }
    try {
      await GoogleSignin.signOut();
    } catch {
      // Google 세션이 없을 수도 있음
    }
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
