'use client';

import { useCallback, useState } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

interface ApiError {
  message: string;
  code?: string;
}

/**
 * Hook for making API calls with consistent error handling and auth
 */
export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const request = useCallback(
    async <T,>(
      method: 'get' | 'post' | 'put' | 'delete' | 'patch',
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Get auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        
        // Prepare headers with auth
        const headers: Record<string, string> = {
          ...config?.headers,
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios[method]<T>(url, data, {
          ...config,
          headers,
        });
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const errorData = axiosError.response?.data || {
          message: axiosError.message,
        };
        
        // Handle 401 - redirect to login
        if (axiosError.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        
        setError(errorData);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    async <T,>(url: string, config?: AxiosRequestConfig): Promise<T | null> => 
      request('get', url, undefined, config),
    [request]
  );

  const post = useCallback(
    async <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> =>
      request('post', url, data, config),
    [request]
  );

  const patch = useCallback(
    async <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> =>
      request('patch', url, data, config),
    [request]
  );

  const put = useCallback(
    async <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T | null> =>
      request('put', url, data, config),
    [request]
  );

  const del = useCallback(
    async <T,>(url: string, config?: AxiosRequestConfig): Promise<T | null> => 
      request('delete', url, undefined, config),
    [request]
  );

  return { request, get, post, patch, put, delete: del, isLoading, error };
}
