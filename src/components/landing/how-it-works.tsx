'use client';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Create Account',
      description: 'Sign up with your email and phone number. Verify with your BVN for instant approval.',
    },
    {
      number: 2,
      title: 'Fund Your Wallet',
      description: 'Transfer funds from your bank to your virtual SaukiMart account. Instant credit.',
    },
    {
      number: 3,
      title: 'Start Using',
      description: 'Buy data, pay bills, or shop. Your transactions are instant and secure.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 text-center">
                {/* Number circle */}
                <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-4 w-8 h-0.5 bg-gradient-to-r from-brand-blue to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
