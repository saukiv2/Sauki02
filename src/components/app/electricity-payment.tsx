'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useApi } from '@/hooks/use-api';

interface DiscoOption {
  code: string;
  name: string;
}

interface CustomerData {
  customerName: string;
  outstandingBalance: string;
  minimumAmount: string;
}

export const ElectricityPaymentComponent = () => {
  const [discos, setDiscos] = useState<DiscoOption[]>([]);
  const [selectedDisco, setSelectedDisco] = useState<string>('');
  const [meterNo, setMeterNo] = useState('');
  const [amount, setAmount] = useState('');
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [token, setToken] = useState('');
  const { get, post } = useApi();

  useEffect(() => {
    const fetchDiscos = async () => {
      try {
        const response = await get('/api/electricity/discos');
        if ((response as any)?.success) {
          setDiscos((response as any)?.data || []);
          if ((response as any)?.data?.length > 0) {
            setSelectedDisco((response as any)?.data[0]?.code);
          }
        }
      } catch (error) {
        console.error('Failed to fetch DiscoS:', error);
      }
    };

    fetchDiscos();
  }, [get]);

  const handleValidate = async () => {
    if (!selectedDisco || !meterNo) return;

    setLoading(true);
    try {
      const response = await post('/api/electricity/validate', {
        disco: selectedDisco,
        meterNo,
      });

      if ((response as any)?.success) {
        setCustomerData((response as any)?.data);
        setAmount((response as any)?.data?.minimumAmount || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedDisco || !meterNo || !amount) return;

    setLoading(true);
    try {
      const response = await post('/api/electricity/pay', {
        disco: selectedDisco,
        meterNo,
        amountNaira: parseFloat(amount),
        customerCode: customerData?.outstandingBalance,
      });

      if ((response as any)?.success) {
        setToken((response as any)?.token || '');
        setShowConfirm(false);
        // Show success message
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Pay Electricity Bill</h2>

        <div className="space-y-4">
          {/* Select DisCo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Company
            </label>
            <select
              value={selectedDisco}
              onChange={(e) => setSelectedDisco(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {discos.map((disco) => (
                <option key={disco.code} value={disco.code}>
                  {disco.name}
                </option>
              ))}
            </select>
          </div>

          {/* Meter Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meter Number
            </label>
            <input
              type="text"
              value={meterNo}
              onChange={(e) => setMeterNo(e.target.value)}
              placeholder="Enter meter number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Validate Button */}
          <Button
            onClick={handleValidate}
            disabled={!selectedDisco || !meterNo || loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Validating...' : 'Validate Meter'}
          </Button>
        </div>
      </Card>

      {/* Customer Details */}
      {customerData && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="font-bold text-lg mb-4">{customerData.customerName}</h3>

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Balance:</span>
              <span className="font-semibold">₦{customerData.outstandingBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum Amount:</span>
              <span className="font-semibold">₦{customerData.minimumAmount}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Pay (₦)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={customerData.minimumAmount}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Pay Button */}
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={loading || !amount}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Pay ₦{amount}
          </Button>
        </Card>
      )}

      {/* Success Token Modal */}
      <Modal isOpen={!!token} onClose={() => setToken('')} title="Payment Successful">
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold">Payment successful!</p>
          {token && (
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Your Meter Token:</p>
              <p className="font-mono font-bold text-lg break-all">{token}</p>
            </div>
          )}
          <Button
            onClick={() => setToken('')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Done
          </Button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Payment"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-700">
              Pay <span className="font-bold">₦{amount}</span> to{' '}
              <span className="font-bold">{selectedDisco}</span> for meter{' '}
              <span className="font-bold">{meterNo}</span>?
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Confirm Pay'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
