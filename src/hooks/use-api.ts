'use client';

import { useCallback, useState } from 'react';
import axios, { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code?: string;
}

/**
 * Hook for making API calls with consistent error handling
 */
export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const request = useCallback(
    async <T,>(
      method: 'get' | 'post' | 'put' | 'delete' | 'patch',
      url: string,
      data?: unknown
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios[method]<T>(url, data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const errorData = axiosError.response?.data || {
          message: axiosError.message,
        };
        setError(errorData);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    async <T,>(url: string): Promise<T | null> => request('get', url),
    [request]
  );

  const post = useCallback(
    async <T,>(url: string, data?: unknown): Promise<T | null> =>
      request('post', url, data),
    [request]
  );

  const patch = useCallback(
    async <T,>(url: string, data?: unknown): Promise<T | null> =>
      request('patch', url, data),
    [request]
  );

  const put = useCallback(
    async <T,>(url: string, data?: unknown): Promise<T | null> =>
      request('put', url, data),
    [request]
  );

  const del = useCallback(
    async <T,>(url: string): Promise<T | null> => request('delete', url),
    [request]
  );

  return { request, get, post, patch, put, delete: del, isLoading, error };
}
