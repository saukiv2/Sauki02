'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-sm shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="SaukiMart"
              width={140}
              height={35}
              className="h-auto"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#services"
              className="text-gray-700 hover:text-black transition-colors font-medium"
            >
              Services
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 hover:text-black transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-black transition-colors font-medium"
            >
              Contact
            </Link>
            <Button
              onClick={() => (window.location.href = '/auth/login')}
              variant="primary"
              size="md"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 md:hidden">
          <div className="flex flex-col gap-6 px-6 py-8">
            <Link
              href="#services"
              className="text-lg font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link
              href="#how-it-works"
              className="text-lg font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/contact"
              className="text-lg font-medium text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Button
              onClick={() => {
                window.location.href = '/auth/login';
                setIsOpen(false);
              }}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
