'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { get, patch, delete: del, isLoading, error } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await get<{ success: boolean; data: User[] }>('/api/users');
    if (res?.success) setUsers(res.data);
  }

  function openEdit(user: User) {
    setSelectedUser(user);
    setEditForm(user);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setFeedback('');
    const res = await patch<{ success: boolean }>(
      `/api/users/${selectedUser.id}`,
      editForm
    );
    if (res?.success) {
      setFeedback('User updated.');
      setEditOpen(false);
      fetchUsers();
    } else {
      setFeedback(error?.message || 'Failed to update.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  function openDelete(userId: string) {
    setDeleteId(userId);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setFeedback('');
    const res = await del<{ success: boolean }>(`/api/users/${deleteId}`);
    if (res?.success) {
      setFeedback('User deleted.');
      setDeleteOpen(false);
      fetchUsers();
    } else {
      setFeedback(error?.message || 'Failed to delete.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">View and manage all users</p>
      </div>

      {feedback && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-800">{feedback}</p>
        </Card>
      )}

      <Card className="p-6">
        {isLoading && <p className="text-gray-600">Loading users...</p>}
        {!isLoading && users.length === 0 && <p className="text-gray-600">No users found.</p>}
        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Verified</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.fullName}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.isVerified ? '✓' : '✗'}</td>
                    <td className="p-3 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDelete(user.id)}>
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

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit User" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Name"
            value={editForm.fullName || ''}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
          />
          <Input
            label="Role"
            value={editForm.role || ''}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium">Suspend</label>
            <input
              type="checkbox"
              checked={editForm.isSuspended || false}
              onChange={(e) => setEditForm({ ...editForm, isSuspended: e.target.checked })}
            />
          </div>
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

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete User" size="sm">
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
