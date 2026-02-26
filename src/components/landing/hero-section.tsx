'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background gradient blob */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10">
        <div
          className="absolute top-20 right-1/4 w-96 h-96 bg-brand-blue rounded-full blur-3xl opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(0,102,255,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
          Nigeria's Smart Financial Platform
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Buy data, pay electricity bills, and shop for gadgets — all powered by one secure wallet.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/register"
            className="bg-brand-blue hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            href="#how-it-works"
            className="border-2 border-gray-800 text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-full font-semibold transition-colors duration-300 flex items-center gap-2"
          >
            See How It Works
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-gray-200 flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Secure & Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Instant Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
