'use client';

import useSWR from 'swr';
import { useAuth } from '@/contexts/auth-context';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

/**
 * Hook to fetch and cache wallet balance
 */
export function useWalletBalance() {
  const { user } = useAuth();
  const { data, error, isLoading } = useSWR(
    user ? `/api/wallet/balance` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    balance: data?.balance ?? 0,
    isLoading,
    isError: !!error,
  };
}

/**
 * Hook to fetch wallet transactions
 */
export function useWalletTransactions() {
  const { user } = useAuth();
  const { data, error, isLoading } = useSWR(
    user ? `/api/wallet/transactions` : null,
    fetcher
  );

  return {
    transactions: data?.transactions ?? [],
    isLoading,
    isError: !!error,
  };
}
