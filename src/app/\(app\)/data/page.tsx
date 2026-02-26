'use client';

import { DataVendingComponent } from '@/components/app/data-vending';

export default function DataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buy Mobile Data</h1>
        <p className="text-gray-600 mt-2">
          Select your network and data plan to buy instantly
        </p>
      </div>

      <DataVendingComponent />
    </div>
  );
}
