'use client';

import * as React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustedBy from '@/components/landing/TrustedBy';
import Features from '@/components/landing/Features';
import DashboardMockup from '@/components/landing/DashboardMockup';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
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
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}
