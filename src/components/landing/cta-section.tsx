'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-20 px-6 bg-gradient-to-r from-brand-blue to-blue-600 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="font-playfair text-4xl sm:text-5xl font-bold mb-6">
          Ready to Get Started?
        </h2>

        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
          Join thousands of Nigerians who trust SaukiMart for their digital transactions. 
          Create your account today and enjoy instant processing, secure payments, and 24/7 support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-brand-blue px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Create Account Now
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            I Already Have an Account
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-12 border-t border-blue-400 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔐</span>
            <span>BVN Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span>Instant Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </section>
  );
}
