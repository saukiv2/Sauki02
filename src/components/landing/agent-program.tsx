'use client';

import {
  ArrowTrendingUpIcon,
  UsersIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AgentProgram() {
  const benefits = [
    {
      icon: ArrowTrendingUpIcon,
      title: 'Higher Profit Margins',
      description: 'Get special agent pricing on all services',
    },
    {
      icon: UsersIcon,
      title: 'Grow Your Network',
      description: 'Refer customers and earn commissions',
    },
    {
      icon: BoltIcon,
      title: 'Instant Payouts',
      description: 'Earn and withdraw your commissions instantly',
    },
  ];

  return (
    <section className="relative py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-inter text-4xl sm:text-5xl font-bold mb-4 text-black">
            Become a SaukiMart Agent
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale your business with our agent program. Earn commissions and
            grow your income.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold mb-2 text-black">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => (window.location.href = '#contact')}
            variant="primary"
            size="lg"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </section>
  );
}
