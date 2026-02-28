'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useApi } from '@/hooks/use-api';

interface Plan {
  id: string;
  name: string;
  network: string;
  size: string;
  validity: string;
  price: string;
  priceNaira: string;
}

interface PurchaseModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PurchaseModal = ({ plan, isOpen, onClose, onSuccess }: PurchaseModalProps) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { post } = useApi();

  const handlePurchase = async () => {
    if (!phone || !plan || pin.length !== 6) return;

    setLoading(true);
    try {
      const response = await post('/api/data/purchase', {
        planId: plan.id,
        phoneNumber: phone,
        pin,
      });

      if ((response as any)?.success) {
        onSuccess();
        onClose();
        setPhone('');
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Data">
      <div className="space-y-4">
        {plan && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <p className="text-gray-600">{plan.size} • {plan.validity}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">₦{plan.priceNaira}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09012345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6‑Digit PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(v);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={!phone || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Processing...' : `Buy for ₦${plan.priceNaira}`}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export const DataVendingComponent = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('MTN');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { get } = useApi();
  

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await get(`/api/data/plans?network=${selectedNetwork}`);
        if ((response as any)?.success) {
          setPlans((response as any)?.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [selectedNetwork, get]);

  const networks = ['MTN', 'GLO', 'AIRTEL'];

  return (
    <div className="space-y-6">
      {/* Network Tabs */}
      <div className="flex gap-2">
        {networks.map((network) => (
          <button
            key={network}
            onClick={() => setSelectedNetwork(network)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedNetwork === network
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {network}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.network}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {plan.validity}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-indigo-600">₦{plan.priceNaira}</p>
                  <p className="text-sm text-gray-500">{plan.size}</p>
                </div>

                <Button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowModal(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Buy Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PurchaseModal
        plan={selectedPlan}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPlan(null);
        }}
        onSuccess={() => {
          // Refresh plans or show success message
        }}
      />
    </div>
  );
};
