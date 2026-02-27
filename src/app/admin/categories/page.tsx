'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  displayOrder: number;
  _count?: { products: number };
}

const emptyForm = { name: '', icon: '', displayOrder: 0 };

export default function CategoriesPage() {
  const { get, post, patch, delete: del, isLoading, error } = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await get<{ success: boolean; data: Category[] }>('/api/categories');
    if (res?.success) setCategories(res.data);
  }

  function showFeedback(type: 'success' | 'error', msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  // ─── Create ───────────────────────────────────────────────────────────────
  function openCreate() {
    setCreateForm(emptyForm);
    setCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    const res = await post<{ success: boolean; data: Category }>('/api/categories', {
      name: createForm.name,
      icon: createForm.icon || null,
      displayOrder: Number(createForm.displayOrder),
    });
    if (res?.success) {
      showFeedback('success', `Category "${res.data.name}" created.`);
      setCreateOpen(false);
      fetchCategories();
    } else {
      showFeedback('error', error?.message || 'Failed to create category.');
    }
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────
  function openEdit(cat: Category) {
    setEditTarget(cat);
    setEditForm({ name: cat.name, icon: cat.icon ?? '', displayOrder: cat.displayOrder });
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    const res = await patch<{ success: boolean; data: Category }>(
      `/api/categories/${editTarget.id}`,
      {
        name: editForm.name,
        icon: editForm.icon || null,
        displayOrder: Number(editForm.displayOrder),
      }
    );
    if (res?.success) {
      showFeedback('success', `Category "${res.data.name}" updated.`);
      setEditOpen(false);
      fetchCategories();
    } else {
      showFeedback('error', error?.message || 'Failed to update category.');
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  function openDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await del<{ success: boolean; message: string }>(
      `/api/categories/${deleteTarget.id}`
    );
    if (res?.success) {
      showFeedback('success', 'Category deleted.');
      setDeleteOpen(false);
      fetchCategories();
    } else {
      showFeedback('error', error?.message || 'Failed to delete category.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <Button variant="primary" onClick={openCreate} className="flex items-center gap-2">
          <Plus size={16} />
          New Category
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading categories…</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No categories yet.{' '}
            <button className="text-blue-600 underline" onClick={openCreate}>
              Create one
            </button>
            .
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 p-3" />
                <th className="text-left p-3 font-semibold text-gray-700">Icon</th>
                <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                <th className="text-left p-3 font-semibold text-gray-700">Display Order</th>
                <th className="text-left p-3 font-semibold text-gray-700">Products</th>
                <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-400">
                    <GripVertical size={14} />
                  </td>
                  <td className="p-3 text-xl">{cat.icon ?? '—'}</td>
                  <td className="p-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="p-3 text-gray-600">{cat.displayOrder}</td>
                  <td className="p-3 text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {cat._count?.products ?? 0}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(cat)}
                      className="flex items-center gap-1"
                    >
                      <Pencil size={13} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDelete(cat)}
                      className="flex items-center gap-1"
                      disabled={(cat._count?.products ?? 0) > 0}
                      title={
                        (cat._count?.products ?? 0) > 0
                          ? 'Reassign or delete its products first'
                          : 'Delete category'
                      }
                    >
                      <Trash2 size={13} />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Category" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name *"
            placeholder="e.g. Electronics"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />
          <Input
            label="Icon (emoji)"
            placeholder="e.g. 📱"
            value={createForm.icon}
            onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })}
          />
          <Input
            label="Display Order"
            type="number"
            min={0}
            value={String(createForm.displayOrder)}
            onChange={(e) =>
              setCreateForm({ ...createForm, displayOrder: Number(e.target.value) })
            }
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create
            </Button>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Category" size="sm">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Name *"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Icon (emoji)"
            placeholder="e.g. 📱"
            value={editForm.icon}
            onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
          />
          <Input
            label="Display Order"
            type="number"
            min={0}
            value={String(editForm.displayOrder)}
            onChange={(e) =>
              setEditForm({ ...editForm, displayOrder: Number(e.target.value) })
            }
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Category" size="sm">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">"{deleteTarget?.name}"</span>? This action cannot be
            undone.
          </p>
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
