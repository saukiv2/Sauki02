'use client';

import { AdminSidebar } from '@/components/admin/sidebar';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-auto">
        {/* Admin Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="h-16 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.firstName || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
