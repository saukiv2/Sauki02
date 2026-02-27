'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Disco {
  code: string;
  name: string;
  billerId: number;
}

export default function ElectricityPage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDiscos();
  }, []);

  async function fetchDiscos() {
    setLoading(true);
    try {
      const res = await fetch('/api/electricity/discos');
      const data = await res.json();
      if (data.success) setDiscos(data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Electricity Configuration</h1>
        <p className="text-gray-600 mt-1">View available distribution companies</p>
      </div>

      <Card className="p-6">
        {loading && <p className="text-gray-600">Loading discos...</p>}
        {!loading && discos.length === 0 && <p className="text-gray-600">No discos available.</p>}
        {discos.length > 0 && (
          <div className="space-y-3">
            {discos.map((disco) => (
              <div key={disco.code} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{disco.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Code: {disco.code} | Biller ID: {disco.billerId}</p>
                  </div>
                  <Button variant="outline" size="sm">View Transactions</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
