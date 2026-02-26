'use client';

import Link from 'next/link';
import { Signal, Zap, Package } from 'lucide-react';

export function FeaturesSection() {
  const services = [
    {
      icon: Signal,
      title: 'Mobile Data',
      description: 'Get instant data for MTN, Glo, Airtel and more networks at the best rates.',
      cta: 'Learn more',
    },
    {
      icon: Zap,
      title: 'Electricity Bills',
      description: 'Pay your electricity bill safely and securely. No hassles, no waiting.',
      cta: 'Learn more',
    },
    {
      icon: Package,
      title: 'Gadgets Store',
      description: 'Browse and shop the latest phones, laptops, and accessories with ease.',
      cta: 'Learn more',
    },
  ];

  return (
    <section id="services" className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-black mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From mobile data to electricity bills to premium gadgets — all in one place.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-brand-blue hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <Icon size={24} className="text-brand-blue group-hover:text-white" />
                </div>

                <h3 className="text-2xl font-bold text-black mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                <Link
                  href="#"
                  className="inline-flex items-center text-brand-blue hover:text-blue-700 font-semibold group/link"
                >
                  {service.cta}
                  <span className="ml-2 transition-transform group-hover/link:translate-x-1">→</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
