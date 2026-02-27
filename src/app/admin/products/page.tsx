'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  customerPriceKobo: number;
  agentPriceKobo: number;
  stockQty: number;
  isActive: boolean;
  category?: { name: string };
}

export default function ProductsPage() {
  const { get, patch, delete: del, isLoading, error } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await get<{ success: boolean; data: Product[] }>('/api/products?limit=100');
    if (res?.success) setProducts(res.data);
  }

  function openEdit(product: Product) {
    setSelectedProduct(product);
    setEditForm(product);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    setFeedback('');
    const res = await patch<{ success: boolean }>(
      `/api/products/${selectedProduct.id}`,
      editForm
    );
    if (res?.success) {
      setFeedback('Product updated.');
      setEditOpen(false);
      fetchProducts();
    } else {
      setFeedback(error?.message || 'Failed to update.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  function openDelete(productId: string) {
    setDeleteId(productId);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setFeedback('');
    const res = await del<{ success: boolean }>(`/api/products/${deleteId}`);
    if (res?.success) {
      setFeedback('Product deleted.');
      setDeleteOpen(false);
      fetchProducts();
    } else {
      setFeedback(error?.message || 'Failed to delete.');
    }
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products & Categories</h1>
          <p className="text-gray-600 mt-1">Manage products and categories</p>
        </div>
        <Button variant="primary" onClick={() => setEditOpen(true)}>+ Upload Product</Button>
      </div>

      {feedback && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-800">{feedback}</p>
        </Card>
      )}

      <Card className="p-6">
        {isLoading && <p className="text-gray-600">Loading products...</p>}
        {!isLoading && products.length === 0 && <p className="text-gray-600">No products found.</p>}
        {products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Active</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.category?.name || 'N/A'}</td>
                    <td className="p-3">₦{(product.customerPriceKobo / 100).toLocaleString()}</td>
                    <td className="p-3">{product.stockQty}</td>
                    <td className="p-3">{product.isActive ? '✓' : '✗'}</td>
                    <td className="p-3 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDelete(product.id)}>
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

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Product" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Customer Price (₦)"
            type="number"
            value={(editForm.customerPriceKobo ? editForm.customerPriceKobo / 100 : '').toString()}
            onChange={(e) => setEditForm({ ...editForm, customerPriceKobo: Number(e.target.value) * 100 })}
          />
          <Input
            label="Agent Price (₦)"
            type="number"
            value={(editForm.agentPriceKobo ? editForm.agentPriceKobo / 100 : '').toString()}
            onChange={(e) => setEditForm({ ...editForm, agentPriceKobo: Number(e.target.value) * 100 })}
          />
          <Input
            label="Stock"
            type="number"
            value={editForm.stockQty?.toString() || ''}
            onChange={(e) => setEditForm({ ...editForm, stockQty: Number(e.target.value) })}
          />
          <div>
            <label className="text-sm font-medium">Active</label>
            <input
              type="checkbox"
              checked={editForm.isActive || true}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
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

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Product" size="sm">
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
