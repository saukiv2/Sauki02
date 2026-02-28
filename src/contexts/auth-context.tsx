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
  const userCheckInitiatedRef = useRef(false);

  // On app cold start (page reload), verify user still has valid session
  useEffect(() => {
    // Only run once on provider mount
    if (userCheckInitiatedRef.current) return;
    userCheckInitiatedRef.current = true;

    const checkUserSession = async () => {
      console.log('[Auth] Cold start: checking if user has valid session cookie');
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Auth] ✓ Valid session found, user:', data.user?.id);
          setUser(data.user);
        } else {
          console.log('[Auth] ✗ No valid session (status:', response.status + ')');
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] Error checking session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (phone: string, password: string) => {
      console.log('[Auth] Login started with phone:', phone);
      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('[Auth] ✓ Login successful, user:', data.user?.id);
        
        // Set user immediately - this is the source of truth for this session
        setUser(data.user);
        console.log('[Auth] User state updated, redirecting now...');
        
        // Redirect immediately - the cookie is already set by the API
        router.push(data.user?.role === 'ADMIN' ? '/admin' : '/dashboard');
        setIsLoading(false);
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
    console.log('[Auth] Logout started');
    setIsLoading(true);
    setUser(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setIsLoading(false);
      router.push('/auth/login');
    }
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  console.log('[Auth] Current state: user=', user?.id || 'null', 'loading=', isLoading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
