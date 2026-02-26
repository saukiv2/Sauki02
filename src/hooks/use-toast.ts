'use client';

import { useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * Hook for showing toast notifications
 * TODO: Connect to a toast context when implemented
 */
export function useToast() {
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log('Toast:', { id, ...toast });
    return id;
  }, []);

  const success = useCallback((message: string) => {
    return showToast({ type: 'success', message });
  }, [showToast]);

  const error = useCallback((message: string) => {
    return showToast({ type: 'error', message });
  }, [showToast]);

  const info = useCallback((message: string) => {
    return showToast({ type: 'info', message });
  }, [showToast]);

  const warning = useCallback((message: string) => {
    return showToast({ type: 'warning', message });
  }, [showToast]);

  return { showToast, success, error, info, warning };
}
