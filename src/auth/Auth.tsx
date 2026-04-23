import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import { User } from '../api';
import { socialLogin } from '../api/auth';
import { getToken, clearTokens, apiRequest } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithKakao: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await getToken();
      if (token) {
        const me = await apiRequest<User>('/api/users/me');
        setUser(me);
      }
    } catch {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithKakao() {
    try {
      const { accessToken } = await kakaoLogin();
      await socialLogin({ provider: 'KAKAO', token: accessToken });
      const me = await apiRequest<User>('/api/users/me');
      setUser(me);
    } catch (e) {
      const msg = String(e);
      if (msg.includes('cancelled') || msg.includes('cancel')) return;
      console.error('[loginWithKakao] error:', e);
      Alert.alert('로그인 실패', msg);
    }
  }

  async function logout() {
    try {
      await kakaoLogout();
    } catch {}
    await clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginWithKakao,
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
