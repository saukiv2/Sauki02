'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/contexts/toast-context';
import { useUser } from '@/hooks/use-auth';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface BankAccount {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export default function WithdrawPage() {
  const user = useUser();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'bank' | 'pin'>('amount');
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const popularBanks = [
    { code: '044', name: 'Access Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '058', name: 'GTBank' },
    { code: '011', name: 'First Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '040', name: 'Zenith Bank' },
    { code: '033', name: 'United Bank' },
  ];

  const validateAmount = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setErrorMsg('Please enter a valid amount');
      return false;
    }
    if (amt > 100000) {
      setErrorMsg('Maximum withdrawal is ₦100,000');
      return false;
    }
    return true;
  };

  const validateBank = () => {
    if (!bankCode || !accountNumber || !accountName) {
      setErrorMsg('Please fill all bank details');
      return false;
    }
    if (accountNumber.length < 10) {
      setErrorMsg('Invalid account number');
      return false;
    }
    return true;
  };

  const validatePin = () => {
    if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
      setErrorMsg('PIN must be 6 digits');
      return false;
    }
    return true;
  };

  const handleAmountSubmit = () => {
    if (validateAmount()) {
      setErrorMsg(null);
      setStep('bank');
    }
  };

  const handleBankSubmit = () => {
    if (validateBank()) {
      setErrorMsg(null);
      setShowPinModal(true);
    }
  };

  const handleWithdraw = async () => {
    if (!validatePin()) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          pin,
          bankCode,
          accountNumber,
          accountName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Withdrawal of ₦${amount} initiated! Check your bank account in 1-5 minutes.`);
        success(`Withdrawal of ₦${amount} initiated!`);
        setShowPinModal(false);
        setAmount('');
        setPin('');
        setBankCode('');
        setAccountNumber('');
        setAccountName('');
        setStep('amount');
      } else {
        setErrorMsg(data.message || 'Failed to process withdrawal');
        error(data.message || 'Failed to process withdrawal');
      }
    } catch (err: any) {
      setErrorMsg('Error processing withdrawal');
      error('Error processing withdrawal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Withdraw Funds</h1>
          <p className="text-slate-600">Transfer money to your bank account</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <Card className="mb-6 p-4 bg-green-50 border-2 border-green-200">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">{successMsg}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <Card className="mb-6 p-4 bg-red-50 border-2 border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">{errorMsg}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Steps Indicator */}
        <Card className="mb-6 p-6">
          <div className="flex justify-between mb-8">
            {(['amount', 'bank', 'pin'] as const).map((s, i) => (
              <div key={s} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                    step === s
                      ? 'bg-blue-600 text-white'
                      : ['amount', 'bank'].includes(step) && ['amount', 'bank'].includes(s)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-xs font-medium text-slate-600 capitalize">{s}</p>
              </div>
            ))}
          </div>

          {/* Amount Step */}
          {step === 'amount' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Withdrawal Amount (₦)
                </label>
                <Input
                  type="number"
                  step="1000"
                  min="1000"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">Min: ₦1,000 | Max: ₦100,000</p>
              </div>
              <Button onClick={handleAmountSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
                Continue
              </Button>
            </div>
          )}

          {/* Bank Details Step */}
          {(step === 'bank' || step === 'pin') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select or Enter Bank
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Bank --</option>
                  {popularBanks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Number
                </label>
                <Input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit account number"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Name
                </label>
                <Input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="As shown in bank"
                />
              </div>

              {step === 'bank' && (
                <Button onClick={handleBankSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
                  Continue to Payment
                </Button>
              )}

              {step === 'pin' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Ready to withdraw <strong>₦{parseFloat(amount).toLocaleString()}</strong> to{' '}
                    <strong>{accountName}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Info Box */}
        <Card className="p-6 border-2 border-amber-100 bg-amber-50">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Note</h3>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• A ₦50 processing fee will be deducted</li>
            <li>• Transfers arrive in 1-5 minutes</li>
            <li>• You need a valid PIN to withdraw</li>
            <li>• Maximum daily withdrawal: ₦500,000</li>
          </ul>
        </Card>
      </div>

      {/* PIN Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)}>
        <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Confirm Withdrawal</h2>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Amount</p>
            <p className="text-2xl font-bold text-slate-900">₦{parseFloat(amount).toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-2">To: {accountName}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Enter PIN</label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
              placeholder="000000"
              autoFocus
            />
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Enter your 6-digit PIN to confirm this withdrawal
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowPinModal(false)}
              disabled={loading}
              className="flex-1 bg-slate-200 text-slate-900 hover:bg-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={loading || pin.length !== 6}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
              Withdraw
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}