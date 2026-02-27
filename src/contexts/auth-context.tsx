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
  
  // Cache user to survive provider re-renders
  const userCacheRef = React.useRef<User | null>(null);
  const hasCheckedRef = React.useRef(false);
  // Lock prevents restore overwriting a successful login
  const isSessionLockedRef = React.useRef(false);

  const restoreUser = useCallback(async () => {
    // If session is locked (user just logged in), don't interfere
    if (isSessionLockedRef.current) {
      console.log('[Auth] Session locked - user just logged in, skipping restore');
      setIsLoading(false);
      return;
    }

    // If we already have user cached, restore immediately without API call
    if (userCacheRef.current) {
      console.log('[Auth] ✓ Using cached user:', userCacheRef.current.id);
      setUser(userCacheRef.current);
      setIsLoading(false);
      return true;
    }

    console.log('[Auth] Attempting to restore session from API...');
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] ✓ Session restored from API for user:', data.user?.id);
        setUser(data.user);
        userCacheRef.current = data.user;
        return true;
      } else {
        console.log('[Auth] ✗ No valid session from API (status:', response.status, ')');
        setUser(null);
        userCacheRef.current = null;
        return false;
      }
    } catch (error) {
      console.error('[Auth] ✗ Session restore error:', error);
      setUser(null);
      userCacheRef.current = null;
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth only once on app startup
  useEffect(() => {
    if (hasCheckedRef.current) {
      console.log('[Auth] Already checked, skipping restore');
      return;
    }
    hasCheckedRef.current = true;
    console.log('[Auth] App starting up, checking auth session...');
    restoreUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (phone: string, password: string) => {
      console.log('[Auth] LOGIN: attempting with', phone);
      setIsLoading(true);
      setUser(null);
      userCacheRef.current = null;
      isSessionLockedRef.current = false; // Unlock for fresh login

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[Auth] LOGIN ERROR:', error.message);
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('[Auth] LOGIN SUCCESS: user', data.user?.id);

        // Lock the session to prevent restore from interfering
        isSessionLockedRef.current = true;
        console.log('[Auth] Session locked to protect login state');

        // Set user in BOTH state and cache
        setUser(data.user);
        userCacheRef.current = data.user;
        setIsLoading(false);
        console.log('[Auth] User cached, state set, waiting for sync...');

        // Wait for React state to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Unlock session after state is stable
        isSessionLockedRef.current = false;
        console.log('[Auth] Session unlocked, redirecting to dashboard...');
        if (data.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[Auth] LOGIN FAILED:', error);
        setIsLoading(false);
        setUser(null);
        userCacheRef.current = null;
        isSessionLockedRef.current = false;
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    console.log('[Auth] LOGOUT: starting...');
    setIsLoading(true);
    
    // Clear everything immediately
    setUser(null);
    userCacheRef.current = null;
    hasCheckedRef.current = false;
    isSessionLockedRef.current = false;

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('[Auth] LOGOUT: API responded with', response.status);
    } catch (error) {
      console.error('[Auth] LOGOUT: API error:', error);
    } finally {
      setIsLoading(false);
      console.log('[Auth] LOGOUT: complete, redirecting to login');
      router.push('/auth/login');
    }
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      userCacheRef.current = updated; // Keep cache in sync
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
