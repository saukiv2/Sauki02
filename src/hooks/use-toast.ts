'use client';

/**
 * Hook for showing toast notifications
 * Wrapper around the toast context - use this or import useToast directly from context
 */
export { useToast } from '@/contexts/toast-context';

  const info = useCallback((message: string) => {
    return showToast({ type: 'info', message });
  }, [showToast]);

  const warning = useCallback((message: string) => {
    return showToast({ type: 'warning', message });
  }, [showToast]);

  return { showToast, success, error, info, warning };
}
