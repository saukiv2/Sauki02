'use client';

import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function WalletHighlight() {
  const features = [
    'Virtual bank account for instant deposits',
    'Transfer from any Nigerian bank',
    'Zero deposit fees',
    'Real-time wallet updates',
    'Transaction history & statements',
    'Secure & encrypted',
  ];

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Wallet Card Mockup */}
          <div className="flex justify-center md:justify-start">
            <Card className="w-full max-w-sm p-8">
              <div className="mb-12">
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Wallet Balance
                </p>
                <p className="text-4xl font-bold font-mono text-black">
                  ₦0.00
                </p>
              </div>

              <div className="mb-8 pb-8 border-b border-gray-100">
                <p className="text-gray-500 text-xs font-medium mb-2">
                  Virtual Account
                </p>
                <p className="text-lg font-mono font-semibold text-black">
                  1234 567 890
                </p>
                <p className="text-gray-500 text-xs mt-2">Zenith Bank</p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="md" className="flex-1">
                  + Add Funds
                </Button>
                <Button variant="secondary" size="md" className="flex-1">
                  Withdraw
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: Benefits */}
          <div>
            <h2 className="font-inter text-4xl font-bold text-black mb-6">
              Your Secure Wallet
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              One wallet for all your digital transactions. Instant funding,
              real-time balance updates, and complete control.
            </p>

            {/* Features list */}
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckBadgeIcon className="h-6 w-6 text-blue-600 mt-1" />
                  <p className="text-gray-700">{feature}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={() => (window.location.href = '/auth/register')}
              variant="primary"
              size="lg"
              className="mt-8"
            >
              Open Your Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
