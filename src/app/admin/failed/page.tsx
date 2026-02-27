'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface FailedOrder {
  id: string;
  amount: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export default function FailedPage() {
  const [failed, setFailed] = useState<FailedOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFailed();
  }, []);

  async function fetchFailed() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?status=FAILED');
      const data = await res.json();
      if (data.success) setFailed(data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Failed Transactions</h1>
        <p className="text-gray-600 mt-1">Monitor and retry failed orders</p>
      </div>

      <Card className="p-6">
        {loading && <p className="text-gray-600">Loading failed transactions...</p>}
        {!loading && failed.length === 0 && (
          <div className="text-center py-12">
            <p className="text-green-600 text-lg font-medium">✓ All transactions successful!</p>
            <p className="text-gray-600 text-sm mt-1">No failed orders to display.</p>
          </div>
        )}
        {failed.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Order ID</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Reason</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {failed.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{item.id.substring(0, 8)}</td>
                    <td className="p-3">₦{(item.amount / 100).toLocaleString()}</td>
                    <td className="p-3 text-red-600">{item.reason || 'Unknown'}</td>
                    <td className="p-3 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
