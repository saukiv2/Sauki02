'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import {
  Users,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  Tag,
  Package,
  Clock,
  UserPlus,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalRevenueKobo: number;
  revenueThisMonthKobo: number;
  revenueChangePercent: number | null;
  totalOrders: number;
  ordersThisMonth: number;
  failedTransactions: number;
  pendingOrders: number;
  totalCategories: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalKobo: number;
    createdAt: string;
    user: { firstName: string; lastName: string; phone: string };
  }>;
}

function formatNaira(kobo: number) {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(1)}K`;
  return `₦${naira.toLocaleString()}`;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function AdminDashboard() {
  const { get, isLoading } = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await get<{ success: boolean; data: Stats }>('/api/admin/stats');
      if (res?.success) {
        setStats(res.data);
      } else {
        setFetchError(true);
      }
    }
    load();
  }, []);

  const statCards = stats
    ? [
        {
          title: 'Total Users',
          value: stats.totalUsers.toLocaleString(),
          sub: `+${stats.newUsersThisMonth} this month`,
          icon: Users,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Revenue',
          value: formatNaira(stats.totalRevenueKobo),
          sub:
            stats.revenueChangePercent !== null
              ? `${stats.revenueChangePercent >= 0 ? '+' : ''}${stats.revenueChangePercent}% vs last month`
              : `${formatNaira(stats.revenueThisMonthKobo)} this month`,
          subColor:
            stats.revenueChangePercent !== null && stats.revenueChangePercent >= 0
              ? 'text-green-600'
              : 'text-red-500',
          icon: TrendingUp,
          color: 'bg-green-500',
        },
        {
          title: 'Orders This Month',
          value: stats.ordersThisMonth.toLocaleString(),
          sub: `${stats.totalOrders.toLocaleString()} total · ${stats.pendingOrders} pending`,
          icon: ShoppingBag,
          color: 'bg-purple-500',
        },
        {
          title: 'Failed Transactions',
          value: stats.failedTransactions.toLocaleString(),
          sub: 'All time',
          icon: AlertCircle,
          color: 'bg-red-500',
        },
        {
          title: 'Categories',
          value: stats.totalCategories.toLocaleString(),
          sub: 'Active product categories',
          icon: Tag,
          color: 'bg-orange-500',
        },
        {
          title: 'Active Products',
          value: stats.totalProducts.toLocaleString(),
          sub: 'Listed in store',
          icon: Package,
          color: 'bg-teal-500',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to SaukiMart Admin</p>
        </div>
        {isLoading && (
          <span className="text-sm text-gray-400 animate-pulse">Refreshing…</span>
        )}
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          Failed to load dashboard stats. Please refresh.
        </div>
      )}

      {/* Stats Grid */}
      {isLoading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                    <p className={`text-xs mt-1 ${card.subColor ?? 'text-gray-400'}`}>
                      {card.sub}
                    </p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg text-white flex-shrink-0`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Package size={20} className="text-purple-500 mb-2" />
            <p className="font-medium text-sm">Add Product</p>
          </Link>
          <Link
            href="/admin/categories"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Tag size={20} className="text-orange-500 mb-2" />
            <p className="font-medium text-sm">Manage Categories</p>
          </Link>
          <Link
            href="/admin/notifications"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <UserPlus size={20} className="text-blue-500 mb-2" />
            <p className="font-medium text-sm">Send Notification</p>
          </Link>
          <Link
            href="/admin/failed"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <AlertCircle size={20} className="text-red-500 mb-2" />
            <p className="font-medium text-sm">Failed Transactions</p>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {isLoading && !stats ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : stats?.recentOrders?.length ? (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left p-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                <th className="text-left p-3 font-semibold text-gray-600">
                  <Clock size={13} className="inline mr-1" />
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">
                    {order.user.firstName} {order.user.lastName}
                    <span className="block text-xs text-gray-400 font-normal">
                      {order.user.phone}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 font-semibold">
                    {formatNaira(order.totalKobo)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
