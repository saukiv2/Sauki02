'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

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
            <Link href="#services" className="text-gray-700 hover:text-black transition-colors font-medium">Services</Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-black transition-colors font-medium">How It Works</Link>
            <Link href="/contact" className="text-gray-700 hover:text-black transition-colors font-medium">Contact</Link>
            <Link href="/privacy" className="text-gray-700 hover:text-black transition-colors font-medium">Privacy</Link>
            <Link href="/terms" className="text-gray-700 hover:text-black transition-colors font-medium">Terms</Link>
            <Link href="/auth/login" className="bg-brand-blue text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium">Sign In</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 md:hidden">
          <div className="flex flex-col gap-6 px-6 py-8">
            <Link href="#services" className="text-lg font-medium text-gray-700" onClick={() => setIsOpen(false)}>Services</Link>
            <Link href="#how-it-works" className="text-lg font-medium text-gray-700" onClick={() => setIsOpen(false)}>How It Works</Link>
            <Link href="/contact" className="text-lg font-medium text-gray-700" onClick={() => setIsOpen(false)}>Contact</Link>
            <Link href="/privacy" className="text-lg font-medium text-gray-700" onClick={() => setIsOpen(false)}>Privacy</Link>
            <Link href="/terms" className="text-lg font-medium text-gray-700" onClick={() => setIsOpen(false)}>Terms</Link>
            <Link href="/auth/login" className="bg-brand-blue text-white px-6 py-3 rounded-full text-center font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>
          </div>
        </div>
      )}
    </>
  );
}
