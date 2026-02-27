'use client';

import { useAuth } from '@/contexts/auth-context';

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get current user
 */
export function useUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook for auth methods
 */
export function useAuthMethods() {
  const { login, logout, checkAuth, refreshToken } = useAuth();
  return { login, logout, checkAuth, refreshToken };
}
