'use client';

import { GadgetsStore } from '@/components/app/gadgets-store';

export default function StorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gadgets Store</h1>
        <p className="text-gray-600 mt-2">
          Browse and shop the latest gadgets and devices
        </p>
      </div>

      <GadgetsStore />
    </div>
  );
}
