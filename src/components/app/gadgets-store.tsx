'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: string;
  stock: number;
  inStock: boolean;
}

export const GadgetsStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { get } = useApi();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await get(`/api/products?page=${page}&limit=12`);
        if ((response as any)?.success) {
          setProducts((response as any)?.data || []);
          setTotalPages((response as any)?.pagination?.pages || 1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, get]);

  if (loading && products.length === 0) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
              <img
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{product.description}</p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold text-indigo-600">₦{product.price}</span>
                <span className="text-xs text-gray-500">{product.stock} in stock</span>
              </div>

              <Button
                disabled={!product.inStock}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  page === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
