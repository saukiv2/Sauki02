'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description:
        'Sign up with your email and phone number. Verify with your BVN for instant approval.',
    },
    {
      number: '02',
      title: 'Fund Your Wallet',
      description:
        'Transfer funds from your bank to your virtual SaukiMart account. Instant credit.',
    },
    {
      number: '03',
      title: 'Start Using',
      description:
        'Buy data, pay bills, or shop. Your transactions are instant and secure.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="font-inter text-4xl sm:text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-6">
                  <span className="text-5xl font-bold text-blue-600">
                    {step.number}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
