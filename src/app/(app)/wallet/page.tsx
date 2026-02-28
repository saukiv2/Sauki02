'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface WalletData {
  balance: number;
  virtualAccountNumber?: string;
  bankName?: string;
}

export default function WalletPage() {
  const { get } = useApi();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch wallet balance
        const walletRes = await get('/api/wallet/balance');
        if ((walletRes as any)?.success) {
          setWallet((walletRes as any)?.data);
        }

        // Fetch transactions
        const transRes = await get('/api/wallet/transactions?limit=20');
        if ((transRes as any)?.success) {
          setTransactions((transRes as any)?.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [get]);

  const balance = wallet?.balance ?? 0;
  const formattedBalance = (balance / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
        <p className="text-indigo-100 font-medium">Total Balance</p>
        <h1 className="text-5xl font-bold mt-2">₦{formattedBalance}</h1>

        {wallet?.virtualAccountNumber && (
          <div className="mt-6 pt-6 border-t border-indigo-400">
            <p className="text-indigo-200 text-sm mb-2">Virtual Account</p>
            <p className="font-mono text-lg mb-3">{wallet.virtualAccountNumber}</p>
            {wallet.bankName && (
              <p className="text-indigo-200">{wallet.bankName}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/wallet/fund" className="flex-1 block text-center bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition">
            + Add Funds
          </Link>
          <Link href="/wallet/withdraw" className="flex-1 block text-center bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition">
            Withdraw
          </Link>
        </div>
      </Card>

      {/* Transactions Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
          <Card className="p-6 text-center text-gray-600">
            No transactions yet. Start using SaukiMart to see your transaction history here.
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{tx.reference}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(tx.createdAt), 'MMM d, yyyy • HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      tx.type === 'credit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₦
                    {(tx.amount / 100).toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-600 capitalize mt-1">
                    {tx.status}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
