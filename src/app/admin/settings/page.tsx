'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'SaukiMart',
    maintenanceMode: false,
    defaultDataPlan: 'Standard',
    maxOrderValue: 1000000,
    supportEmail: 'support@saukimart.com',
    liveChat: true,
  });
  const [feedback, setFeedback] = useState('');

  function handleChange(key: string, value: any) {
    setSettings({ ...settings, [key]: value });
  }

  function handleSave() {
    setFeedback('Settings will be saved to backend.');
    // In production, call API to save
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform behavior</p>
      </div>

      {feedback && (
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-800">{feedback}</p>
        </Card>
      )}

      <Card className="p-6 space-y-6 max-w-2xl">
        <div>
          <Input
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => handleChange('siteName', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Maintenance Mode</label>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">When enabled, only admins can access the platform.</p>
        </div>

        <div>
          <Input
            label="Max Order Value (₦)"
            type="number"
            value={settings.maxOrderValue}
            onChange={(e) => handleChange('maxOrderValue', Number(e.target.value))}
          />
        </div>

        <div>
          <Input
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Live Chat Enabled</label>
          <input
            type="checkbox"
            checked={settings.liveChat}
            onChange={(e) => handleChange('liveChat', e.target.checked)}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
          <Button variant="outline" onClick={() => setFeedback('')}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
