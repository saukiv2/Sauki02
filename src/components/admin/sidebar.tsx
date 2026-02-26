'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const adminMenuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Data Plans', href: '/admin/data-plans', icon: '📱' },
  { name: 'Custom APIs', href: '/admin/custom-apis', icon: '⚙️' },
  { name: 'Electricity Config', href: '/admin/electricity', icon: '⚡' },
  { name: 'Products', href: '/admin/products', icon: '🛍️' },
  { name: 'Orders', href: '/admin/orders', icon: '📦' },
  { name: 'Notifications', href: '/admin/notifications', icon: '🔔' },
  { name: 'Failed Transactions', href: '/admin/failed', icon: '❌' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-gray-900 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <Image
            src="/logo_white.svg"
            alt="SaukiMart Admin"
            width={130}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <p className="text-xs text-gray-400 mt-2">Admin Panel</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {adminMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
