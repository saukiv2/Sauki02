'use client';

import { BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Total Revenue',
    value: '₦2.5M',
    change: '+8%',
    icon: TrendingUp,
    color: 'bg-green-500',
  },
  {
    title: 'Orders This Month',
    value: '456',
    change: '+5%',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  {
    title: 'Failed Transactions',
    value: '12',
    change: '-2%',
    icon: AlertCircle,
    color: 'bg-red-500',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to SaukiMart Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">
            Add New Product
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">
            Send Notification
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">
            View Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Activity Item {i}</p>
              <p className="text-sm text-gray-500 mt-1">Details about this activity...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
