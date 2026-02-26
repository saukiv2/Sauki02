'use client';

import { WalletCard } from '@/components/app/wallet-card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to SaukiMart</h1>
        <p className="text-indigo-100">
          Buy mobile data, pay electricity bills, and shop for gadgets — all from one secure wallet.
        </p>
      </div>

      {/* Wallet Card */}
      <WalletCard />

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: '📱',
            label: 'Buy Data',
            description: 'Get mobile data for your phone',
            href: '/data',
          },
          {
            icon: '⚡',
            label: 'Pay Bills',
            description: 'Pay your electricity bills',
            href: '/electricity',
          },
          {
            icon: '🛍️',
            label: 'Browse Store',
            description: 'Shop for gadgets and devices',
            href: '/store',
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-lg mb-1">{item.label}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </a>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent transactions yet. Start by buying data or paying a bill!</p>
      </div>
    </div>
  );
}
