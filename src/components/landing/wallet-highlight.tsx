'use client';

import { Check } from 'lucide-react';

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
            <div className="w-full max-w-sm">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-brand-blue to-blue-700 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="mb-12">
                  <p className="text-blue-100 text-sm font-medium mb-2">Wallet Balance</p>
                  <p className="text-4xl font-bold font-mono">₦0.00</p>
                </div>

                <div className="mb-8 pb-8 border-b border-blue-400">
                  <p className="text-blue-100 text-xs font-medium mb-2">Virtual Account</p>
                  <p className="text-lg font-mono font-semibold">1234 567 890</p>
                  <p className="text-blue-100 text-xs mt-2">Zenith Bank</p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 font-semibold transition-colors text-sm">
                    + Add Funds
                  </button>
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 font-semibold transition-colors text-sm">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Benefits */}
          <div>
            <h2 className="font-playfair text-4xl font-bold text-black mb-6">
              Your Secure Wallet
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              One wallet for all your digital transactions. Instant funding, real-time balance updates, and complete control.
            </p>

            {/* Features list */}
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <p className="text-gray-700">{feature}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="mt-8 bg-brand-blue hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Open Your Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
