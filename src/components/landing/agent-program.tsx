'use client';

import { TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export function AgentProgram() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Higher Profit Margins',
      description: 'Get special agent pricing on all services',
    },
    {
      icon: Users,
      title: 'Grow Your Network',
      description: 'Refer customers and earn commissions',
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Earn and withdraw your commissions instantly',
    },
  ];

  return (
    <section className="relative py-20 px-6 bg-brand-blue text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold mb-4">
            Become a SaukiMart Agent
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Scale your business with our agent program. Earn commissions and grow your income.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-blue-100">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 bg-white text-brand-blue hover:bg-blue-50 px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Apply Now
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
