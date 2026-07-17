'use client';

import * as React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { FileText } from 'lucide-react';
import { TERMS_CONTENT } from '@/lib/landing-data';

export default function TermsPage() {
  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-32 space-y-12 relative z-10">
        {/* Page Title */}
        <div className="space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-[0_0_15px_rgba(0,187,136,0.1)]">
            <FileText className="h-4 w-4" />
            <span>User Agreement</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {TERMS_CONTENT.title}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
            {TERMS_CONTENT.lastUpdated}. Please read this agreement before using AutoDM.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-10 text-sm sm:text-base text-gray-300 leading-relaxed">
          {TERMS_CONTENT.sections.map((section) => (
            <section key={section.id} className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-primary">{section.id}.</span>
                <span>{section.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{section.desc}</p>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
