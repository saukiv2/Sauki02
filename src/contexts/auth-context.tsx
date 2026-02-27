'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRestoringRef = useRef(false); // Prevent duplicate restore calls

  // Restore user from cookies on mount (only once)
  const restoreUser = useCallback(async () => {
    // Prevent duplicate calls
    if (isRestoringRef.current) {
      console.log('[Auth] Restore already in progress');
      return;
    }

    isRestoringRef.current = true;
    console.log('[Auth] Starting session restore...');

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] Session restored for user:', data.user?.id);
        setUser(data.user);
      } else {
        console.log('[Auth] No valid session (status:', response.status, ')');
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Session restore failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore user on provider mount (only once)
  useEffect(() => {
    console.log('[Auth] Provider mounted');
    restoreUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount only

  const login = useCallback(
    async (phone: string, password: string) => {
      console.log('[Auth] Login attempt:', phone);
      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include/set cookies
          body: JSON.stringify({ phone, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('[Auth] Login successful, user:', data.user?.id);

        // Set user from response
        setUser(data.user);
        setIsLoading(false);

        // Wait for state to update, then redirect
        await new Promise(resolve => setTimeout(resolve, 150));

        if (data.user?.role === 'ADMIN') {
          console.log('[Auth] Redirecting to admin');
          router.push('/admin');
        } else {
          console.log('[Auth] Redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[Auth] Login error:', error);
        setIsLoading(false);
        setUser(null);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    console.log('[Auth] Logging out...');
    setIsLoading(true);

    try {
      // Call logout endpoint to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push('/auth/login');
    }
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
