'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

export function CartDrawer() {
  const { itemCount } = useCart();

  return (
    <div className="relative">
      <button className="relative rounded-full p-2 hover:bg-gray-100">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
