'use client';

import {
  SignalIcon,
  BoltIcon,
  CubeTransparentIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function FeaturesSection() {
  const services = [
    {
      icon: SignalIcon,
      title: 'Mobile Data',
      description:
        'Get instant data for MTN, Glo, Airtel and more networks at the best rates.',
    },
    {
      icon: BoltIcon,
      title: 'Electricity Bills',
      description:
        'Pay your electricity bill safely and securely. No hassles, no waiting.',
    },
    {
      icon: CubeTransparentIcon,
      title: 'Gadgets Store',
      description:
        'Browse and shop the latest phones, laptops, and accessories with ease.',
    },
  ];

  return (
    <section id="services" className="relative py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="font-inter text-4xl sm:text-5xl font-bold text-black mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From mobile data to electricity bills to premium gadgets — all in
            one place.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title} className="cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-2xl font-bold text-black mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
