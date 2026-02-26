'use client';

import { ElectricityPaymentComponent } from '@/components/app/electricity-payment';

export default function ElectricityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pay Electricity Bill</h1>
        <p className="text-gray-600 mt-2">
          Pay your electricity bill safely and securely
        </p>
      </div>

      <ElectricityPaymentComponent />
    </div>
  );
}
