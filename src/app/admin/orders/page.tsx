'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Order {
  id: string;
  amount: number;
  status: string;
  userId: string;
  createdAt: string;
  user?: { fullName: string; email: string };
}

export default function OrdersPage() {
  const { get, patch, delete: del, isLoading, error } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const res = await get<{ success: boolean; data: Order[] }>('/api/orders');
    if (res?.success) setOrders(res.data);
  }

  function openEdit(order: Order) {
    setSelectedOrder(order);
    setEditForm(order);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;
    setFeedback('');
    const res = await patch<{ success: boolean }>(
      `/api/orders/${selectedOrder.id}`,
      editForm
    );
    if (res?.success) {
      setFeedback('Order updated.');
      setEditOpen(false);
      fetchOrders();
    } else {
      setFeedback(error?.message || 'Failed to update.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  function openDelete(orderId: string) {
    setDeleteId(orderId);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setFeedback('');
    const res = await del<{ success: boolean }>(`/api/orders/${deleteId}`);
    if (res?.success) {
      setFeedback('Order deleted.');
      setDeleteOpen(false);
      fetchOrders();
    } else {
      setFeedback(error?.message || 'Failed to delete.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
        <p className="text-gray-600 mt-1">View and manage all customer orders</p>
      </div>

      {feedback && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-800">{feedback}</p>
        </Card>
      )}

      <Card className="p-6">
        {isLoading && <p className="text-gray-600">Loading orders...</p>}
        {!isLoading && orders.length === 0 && <p className="text-gray-600">No orders found.</p>}
        {orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Order ID</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{order.id.substring(0, 8)}</td>
                    <td className="p-3">{order.user?.fullName || 'N/A'}</td>
                    <td className="p-3">₦{(order.amount / 100).toLocaleString()}</td>
                    <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{order.status}</span></td>
                    <td className="p-3 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(order)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDelete(order.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Order" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Status"
            value={editForm.status || ''}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Order" size="sm">
        <div className="space-y-4">
          <p>Are you sure? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
