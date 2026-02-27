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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from cookies - simple and always works
  const restoreUser = useCallback(async () => {
    console.log('[Auth] Attempting to restore session from cookies...');
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include HTTP-only cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] ✓ Session restored for user:', data.user?.id);
        setUser(data.user);
        return true;
      } else {
        console.log('[Auth] ✗ No valid session (status:', response.status, ')');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('[Auth] ✗ Session restore error:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore on mount only - use empty dependencies
  useEffect(() => {
    console.log('[Auth] Provider mounted, attempting restore...');
    restoreUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // CRITICAL: Empty array means run ONLY on mount

  const login = useCallback(
    async (phone: string, password: string) => {
      console.log('[Auth] LOGIN: attempting login with', phone);
      setIsLoading(true);
      setUser(null); // Clear previous state

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // CRITICAL: Include cookies in request/response
          body: JSON.stringify({ phone, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[Auth] LOGIN ERROR:', error.message);
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('[Auth] LOGIN SUCCESS: user ', data.user?.id, ', cookies set by server');

        // Set user from response
        setUser(data.user);
        console.log('[Auth] User state updated in React:', data.user?.id);
        
        setIsLoading(false);
        console.log('[Auth] IsLoading set to false');

        // Wait a bit for state to sync
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('[Auth] Redirecting to', data.user?.role === 'ADMIN' ? 'admin' : 'dashboard');
        if (data.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[Auth] LOGIN FAILED:', error);
        setIsLoading(false);
        setUser(null);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    console.log('[Auth] LOGOUT: starting...');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('[Auth] LOGOUT: API call responded with', response.status);
    } catch (error) {
      console.error('[Auth] LOGOUT: API call failed:', error);
    } finally {
      // Clear state regardless of API success
      setUser(null);
      setIsLoading(false);
      console.log('[Auth] LOGOUT: redirecting to login');
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

  console.log('[Auth] Current state: user=', user?.id || 'null', 'isLoading=', isLoading, 'isAuthenticated=', !!user);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
