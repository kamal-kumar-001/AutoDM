'use client';

import * as React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustedBy from '@/components/landing/TrustedBy';
import Features from '@/components/landing/Features';
import DashboardMockup from '@/components/landing/DashboardMockup';
import Pricing from '@/components/landing/Pricing';
import SetupGuide from '@/components/landing/SetupGuide';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import { Megaphone } from 'lucide-react';

interface PromoSettings {
  enabled: boolean;
  text: string;
  discountPercent: number;
}

export default function LandingPage() {
  const [promo, setPromo] = React.useState<PromoSettings>({
    enabled: false,
    text: '',
    discountPercent: 0,
  });

  React.useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/pricing-promo`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson && resJson.success && resJson.data && resJson.data.promo) {
          setPromo(resJson.data.promo);
        }
      })
      .catch((err) => console.error('Failed to load promotions config on landing page', err));
  }, []);

  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Global Promotion Banner */}
      {false && promo.enabled && promo.text && (
        <div className="bg-gradient-to-r from-primary/25 via-primary/35 to-accent-cyan/20 border-b border-primary/20 text-center py-2.5 px-4 text-xs font-black text-white flex items-center justify-center space-x-2 relative z-50 animate-pulse">
          <Megaphone className="w-3.5 h-3.5 text-primary flex-shrink-0 animate-bounce" />
          <span>{promo.text}</span>
        </div>
      )}

      {/* Dynamic Global Background Gradient Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan/5 blur-[120px]" />
      </div>

      {/* Render Subcomponents */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <TrustedBy />
        <Features />
        <DashboardMockup />
        <Pricing promo={promo} />
        <SetupGuide />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}
