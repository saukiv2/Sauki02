'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    console.log('[Auth] checkAuth called');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

      console.log('[Auth] Token:', !!token, 'User:', !!storedUserStr);

      if (!token || !storedUserStr) {
        console.log('[Auth] Clearing user');
        setUser(null);
      } else {
        try {
          const parsedUser = JSON.parse(storedUserStr);
          console.log('[Auth] Setting user:', parsedUser.id);
          setUser(parsedUser);
        } catch (e) {
          console.error('[Auth] Parse error:', e);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('[Auth] Error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    console.log('[Auth] Provider mounted');
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('[Auth] Login response, user:', data.user?.id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('[Auth] Stored in localStorage');
        }
      }

      setUser(data.user);
      setIsLoading(false);

      // Wait a tick then redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    console.log('[Auth] Logging out');
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      setUser(null);
      setIsLoading(false);
      router.push('/auth/login');
    }
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev: User | null) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    checkAuth,
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
