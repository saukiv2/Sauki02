'use client';

import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { WalletHighlight } from '@/components/landing/wallet-highlight';
import { AgentProgram } from '@/components/landing/agent-program';
import { DownloadApp } from '@/components/landing/download-app';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <WalletHighlight />
      <AgentProgram />
      <DownloadApp />
      <CTASection />
      <Footer />
    </main>
  );
}
