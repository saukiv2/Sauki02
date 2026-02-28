'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/contexts/toast-context';
import { Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface FundRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  metadata: any;
  createdAt: string;
  description: string;
}

export default function WalletFundPage() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [copied, setCopied] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    fetchWalletDetails();
    fetchFundRequests();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const res = await fetch('/api/wallet/balance');
      const data = await res.json();
      if (data.success) {
        setAccountNumber(data.accountNumber || '');
        setBankName(data.bankName || 'Flutterwave');
      }
    } catch (error) {
      console.error('Failed to fetch wallet details:', error);
    }
  };

  const fetchFundRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet/fund');
      const data = await res.json();
      if (data.success) {
        setFundRequests(data.fundRequests || []);
      }
    } catch (error) {
      console.error('Failed to fetch fund requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitFundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      error('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          transactionRef: `FND-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Fund request submitted! Admin will review shortly.');
        setAmount('');
        fetchFundRequests();
      } else {
        error(data.message || 'Failed to submit fund request');
      }
    } catch (err) {
      error('Error submitting fund request');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Fund Wallet</h1>
          <p className="text-slate-600">Add funds to your SaukiMart wallet</p>
        </div>

        {/* Account Details Card */}
        <Card className="mb-6 p-6 border-2 border-blue-100 bg-blue-50">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Transfer Instructions</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              1. Copy the account details below
            </p>
            <p className="text-sm text-slate-600">
              2. Transfer any amount from your personal or business account
            </p>
            <p className="text-sm text-slate-600">
              3. Submit a fund request below to confirm
            </p>
            <p className="text-sm text-slate-600">
              4. Your wallet will be credited within 1-5 minutes
            </p>
          </div>
        </Card>

        {/* Account Info Card */}
        <Card className="mb-6 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Receive Account</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Account Number</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-100 px-3 py-2 rounded font-mono text-sm">
                  {accountNumber || '1234567890'}
                </code>
                <button
                  onClick={handleCopyAccount}
                  className="p-2 hover:bg-slate-100 rounded transition"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Bank Name</p>
              <p className="text-base font-semibold">{bankName || 'Loading...'}</p>
            </div>
            <div className="pt-2 border-t text-xs text-slate-500">
              <p>These are your permanent Flutterwave transfer details. Use them to fund your wallet anytime.</p>
            </div>
          </div>
        </Card>

        {/* Fund Request Form */}
        <Card className="mb-6 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirm Fund Request</h3>
          <form onSubmit={handleSubmitFundRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (₦)
              </label>
              <Input
                type="number"
                step="100"
                min="100"
                max="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={submitting}
              />
              <p className="text-xs text-slate-500 mt-1">Min: ₦100 | Max: ₦500,000</p>
            </div>
            <Button
              type="submit"
              disabled={submitting || !amount}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Fund Request'
              )}
            </Button>
          </form>
        </Card>

        {/* Fund Requests History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Requests</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : fundRequests.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No fund requests yet</p>
          ) : (
            <div className="space-y-3">
              {fundRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {req.status === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                    {req.status === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {req.status === 'FAILED' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    <div>
                      <p className="text-sm font-medium">
                        ₦{(req.amount / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      req.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}