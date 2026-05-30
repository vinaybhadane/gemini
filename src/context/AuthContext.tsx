'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserId } from '@/types/message';

interface AuthContextValue {
  currentUser: UserId | null;
  login: (password: string) => boolean;
  logout: () => void;
}

const PASSWORD_MAP: Record<string, UserId> = {
  '060905': 'user1',
  '913051': 'user2',
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Session lives ONLY in React state — clears on refresh/close automatically
  const [currentUser, setCurrentUser] = useState<UserId | null>(null);

  const login = useCallback((password: string): boolean => {
    const userId = PASSWORD_MAP[password];
    if (userId) {
      setCurrentUser(userId);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
