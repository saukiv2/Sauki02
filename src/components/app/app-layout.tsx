'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useAuthMethods } from '@/hooks/use-auth';
import { NotificationBell } from '@/components/app/notification-bell';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Buy Data', href: '/data', icon: '📱' },
  { label: 'Electricity', href: '/electricity', icon: '⚡' },
  { label: 'Store', href: '/store', icon: '🛍️' },
  { label: 'Wallet', href: '/wallet', icon: '💰' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const user = useUser();
  const { logout } = useAuthMethods();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            SaukiMart
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
