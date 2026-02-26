'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Spinner } from '@/components/ui/spinner';

interface WalletData {
  balance: number;
  virtualAccountNumber?: string;
  bankName?: string;
}

export function WalletCard() {
  const { get } = useApi();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const response = await get('/api/wallet/balance');
        if ((response as any)?.success) {
          setWallet((response as any)?.data);
        }
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

  const balance = wallet?.balance ?? 0;
  const formattedBalance = (balance / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 p-6 text-white">
      <p className="text-sm font-medium opacity-90">Wallet Balance</p>
      <p className="mt-2 text-4xl font-bold font-playfair">₦{formattedBalance}</p>
      
      {wallet?.virtualAccountNumber && (
        <div className="mt-4 text-sm">
          <p className="opacity-75">Virtual Account</p>
          <p className="font-mono mt-1">{wallet.virtualAccountNumber}</p>
          {wallet.bankName && <p className="text-xs opacity-75 mt-1">{wallet.bankName}</p>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">
          Add Funds
        </button>
        <button className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">
          Withdraw
        </button>
      </div>
    </div>
  );
}
