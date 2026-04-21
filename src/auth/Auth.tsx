/**
 * Meeny - Auth Context (Mocked)
 * 소셜 로그인은 디자인만 - 버튼 클릭시 바로 로그인 처리
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENT_USER, User } from '../api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    const checkAuth = async () => {
      // For now, user is not logged in initially
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = () => {
    // Mock login - immediately set user
    setUser(CURRENT_USER);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
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
