'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { useUser } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';

export default function ProfilePage() {
  const user = useUser();
  const { patch } = useApi();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await patch('/api/auth/profile', formData);
      if ((response as any)?.success) {
        setEditing(false);
        // Refresh user data
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user.fullName}
            </h1>
            <p className="text-indigo-100 mt-2">{user.email}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Account Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              disabled={!editing}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!editing}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!editing}
              className="w-full"
            />
          </div>

          {editing && (
            <div className="pt-4 flex gap-3">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => setEditing(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Account Status */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Account Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Verification</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {user.isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Account Type</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {user.role}
            </span>
          </div>
          {user.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Member Since</span>
              <span className="text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
