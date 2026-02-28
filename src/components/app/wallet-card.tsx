'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Spinner } from '@/components/ui/spinner';

interface WalletData {
  balance: number;
  flwAccountNumber?: string;
  flwBankName?: string;
}

export function WalletCard() {
  const { get, error: apiError } = useApi();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        console.log('[WalletCard] Fetching wallet balance');
        const response = await get('/api/wallet/balance');
        if ((response as any)?.success) {
          console.log('[WalletCard] ✓ Wallet loaded');
          setWallet((response as any)?.data);
        } else if ((response as any)?.data) {
          // Some endpoints return data directly, not wrapped in success
          setWallet((response as any)?.data);
        }
      } catch (err) {
        console.error('[WalletCard] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [get]);

  if (loading) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 p-6 text-white flex items-center justify-center min-h-[160px]">
        <Spinner />
      </div>
    );
  }

  // Handle errors gracefully - show placeholder instead of crashing
  if (apiError) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 p-6 text-white">
        <p className="text-sm font-medium opacity-90">Wallet Balance</p>
        <p className="mt-2 text-4xl font-bold font-playfair">₦0.00</p>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">
            Add Funds
          </button>
          <button className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">
            Withdraw
          </button>
        </div>
        <p className="text-xs opacity-60 mt-3">(Retrying...)</p>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const formattedBalance = (balance / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 p-6 text-white">
      <p className="text-sm font-medium opacity-90">Wallet Balance</p>
      <p className="mt-2 text-4xl font-bold font-playfair">₦{formattedBalance}</p>
      
      {wallet?.flwAccountNumber && (
        <div className="mt-5 p-4 bg-white/10 rounded-lg border border-white/20">
          <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Transfer to fund wallet</p>
          <p className="text-lg font-mono font-bold mt-2">{wallet.flwAccountNumber}</p>
          <p className="text-sm opacity-80 mt-1">{wallet.flwBankName || 'WEMA BANK'}</p>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors">
          Add Funds
        </button>
        <button className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors">
          Withdraw
        </button>
      </div>
    </div>
  );
}
