'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      console.log('[Auth] Checking auth - token:', !!token, 'storedUser:', !!storedUserStr);

      if (!token) {
        setUser(null);
      } else if (storedUserStr) {
        try {
          const parsedUser = JSON.parse(storedUserStr);
          setUser(parsedUser);
          console.log('[Auth] User restored from localStorage:', parsedUser.id);
        } catch (e) {
          console.error('[Auth] Failed to parse stored user:', e);
          setUser(null);
        }
      } else {
        console.log('[Auth] No stored user, but token exists');
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
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
      console.log('[Auth] Login response - user:', data.user?.id);

      // Store token and user BEFORE setting state
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('[Auth] User stored in localStorage');
        }
      }

      // Set user data immediately
      setUser(data.user);
      setIsLoading(false);
      setHasCheckedAuth(true);

      // Small delay to ensure state is committed before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on role
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      setUser(null);
      setIsLoading(false);
      setHasCheckedAuth(false);
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
    isAuthenticated: !!user && hasCheckedAuth,
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
