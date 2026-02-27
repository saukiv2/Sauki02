'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface DataPlan {
  id: string;
  name: string;
  network: string;
  price: number;
  validity: string;
}

export default function DataPlansPage() {
  const { get, post, patch, delete: del, isLoading, error } = useApi();
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DataPlan>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    const res = await get<{ success: boolean; data: DataPlan[] }>('/api/data-plans');
    if (res?.success) setPlans(res.data);
  }

  function openCreate() {
    setEditForm({});
    setCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback('');
    const res = await post<{ success: boolean }>('/api/data-plans', editForm);
    if (res?.success) {
      setFeedback('Plan created.');
      setCreateOpen(false);
      fetchPlans();
    } else {
      setFeedback(error?.message || 'Failed to create.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  function openEdit(plan: DataPlan) {
    setSelectedPlan(plan);
    setEditForm(plan);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setFeedback('');
    const res = await patch<{ success: boolean }>(
      `/api/data-plans/${selectedPlan.id}`,
      editForm
    );
    if (res?.success) {
      setFeedback('Plan updated.');
      setEditOpen(false);
      fetchPlans();
    } else {
      setFeedback(error?.message || 'Failed to update.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  function openDelete(planId: string) {
    setDeleteId(planId);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setFeedback('');
    const res = await del<{ success: boolean }>(`/api/data-plans/${deleteId}`);
    if (res?.success) {
      setFeedback('Plan deleted.');
      setDeleteOpen(false);
      fetchPlans();
    } else {
      setFeedback(error?.message || 'Failed to delete.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Plans</h1>
          <p className="text-gray-600 mt-1">Manage all data plans</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ New Plan</Button>
      </div>

      {feedback && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-800">{feedback}</p>
        </Card>
      )}

      <Card className="p-6">
        {isLoading && <p className="text-gray-600">Loading plans...</p>}
        {!isLoading && plans.length === 0 && <p className="text-gray-600">No plans found.</p>}
        {plans.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Network</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Validity</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{plan.name}</td>
                    <td className="p-3">{plan.network}</td>
                    <td className="p-3">₦{plan.price.toLocaleString()}</td>
                    <td className="p-3">{plan.validity}</td>
                    <td className="p-3 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDelete(plan.id)}>
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

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Data Plan" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., 1GB/Day"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Network"
            placeholder="e.g., MTN"
            value={editForm.network || ''}
            onChange={(e) => setEditForm({ ...editForm, network: e.target.value })}
            required
          />
          <Input
            label="Price (₦)"
            type="number"
            value={editForm.price?.toString() || ''}
            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
            required
          />
          <Input
            label="Validity"
            placeholder="e.g., 30 Days"
            value={editForm.validity || ''}
            onChange={(e) => setEditForm({ ...editForm, validity: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create
            </Button>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Data Plan" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Network"
            value={editForm.network || ''}
            onChange={(e) => setEditForm({ ...editForm, network: e.target.value })}
          />
          <Input
            label="Price (₦)"
            type="number"
            value={editForm.price?.toString() || ''}
            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
          />
          <Input
            label="Validity"
            value={editForm.validity || ''}
            onChange={(e) => setEditForm({ ...editForm, validity: e.target.value })}
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

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Data Plan" size="sm">
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
