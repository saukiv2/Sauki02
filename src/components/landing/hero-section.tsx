'use client';

import Link from 'next/link';
import { ArrowRightIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h1 className="font-inter text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
          Nigeria's Smart Financial Platform
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Buy data, pay electricity bills, and shop for gadgets — all powered
          by one secure wallet.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => (window.location.href = '/auth/register')}
            variant="primary"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => (window.location.href = '#how-it-works')}
            variant="outline"
            size="lg"
          >
            See How It Works
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-gray-200 flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
            <span>Secure & Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
            <span>Instant Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
