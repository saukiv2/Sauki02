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
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authCheckedRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckedRef.current) {
      console.log('[Auth] Auth already checked, skipping');
      return;
    }
    
    authCheckedRef.current = true;
    console.log('[Auth] Starting auth check');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

      console.log('[Auth] Token exists:', !!token, 'StoredUser exists:', !!storedUserStr);

      if (!token) {
        console.log('[Auth] No token found');
        setUser(null);
      } else if (storedUserStr) {
        try {
          const parsedUser = JSON.parse(storedUserStr);
          console.log('[Auth] User restored:', parsedUser.id);
          setUser(parsedUser);
        } catch (e) {
          console.error('[Auth] Failed to parse user:', e);
          setUser(null);
        }
      } else {
        console.log('[Auth] Token exists but no stored user');
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[Auth] Auth check complete');
    }
  }, []);

  // Only check auth once on app startup
  useEffect(() => {
    console.log('[Auth] AuthProvider mounted, checking auth');
    checkAuth();
  }, []); // Empty deps - only run once

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
      console.log('[Auth] Login successful, user:', data.user?.id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      setUser(data.user);
      setIsLoading(false);

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
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
      authCheckedRef.current = false;
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
