'use client';

import {
  ArrowRightIcon,
  CheckBadgeIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-inter text-4xl sm:text-5xl font-bold mb-6 text-black">
          Ready to Get Started?
        </h2>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Join thousands of Nigerians who trust SaukiMart for their digital
          transactions. Create your account today and enjoy instant
          processing, secure payments, and 24/7 support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => (window.location.href = '/auth/register')}
            variant="primary"
            size="lg"
          >
            Create Account Now
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => (window.location.href = '/auth/login')}
            variant="outline"
            size="lg"
          >
            I Already Have an Account
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-12 border-t border-gray-200 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
            <span>BVN Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-blue-600" />
            <span>Instant Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
            <span>Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </section>
  );
}
