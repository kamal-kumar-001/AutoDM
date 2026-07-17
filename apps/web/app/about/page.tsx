'use client';

import * as React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Compass, Users2, Code2, Clock, Mail, Globe, Github, Linkedin } from 'lucide-react';
import { ABOUT_CONTENT } from '@/lib/landing-data';

export default function AboutPage() {
  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-32 space-y-20 relative z-10">
        {/* Intro Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-[0_0_15px_rgba(0,187,136,0.1)]">
            <Compass className="h-4 w-4" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent leading-tight">
            Seamless Automation. <br />
            Meta-Compliant Delivery.
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            AutoDM was built to solve a critical creator challenge: instantly connecting with
            commenters on Instagram posts without risking account integrity or relying on unofficial
            scraping.
          </p>
        </div>

        {/* Philosophy grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Scale Engagement Effortlessly</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Creators spend hours answering comments with links. AutoDM automates this hand-off
                instantly. By delivering links directly to DMs, we boost CTR and drive conversion
                without adding work to your day.
              </p>
            </div>
            <div className="text-xs text-primary/80 font-mono">
              // Turn engagement into pipeline.
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Meta Compliant Core</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Unlike unofficial browser-extension scrapers, AutoDM communicates exclusively via
                Meta Graph APIs. We operate completely within Instagram's official messaging
                guidelines, ensuring account safety and compliance.
              </p>
            </div>
            <div className="text-xs text-accent-cyan/80 font-mono">
              // Official Facebook Developer Integrations.
            </div>
          </div>
        </div>

        {/* Project Creator Card */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              <Users2 className="h-3.5 w-3.5" />
              <span>Meet the Architect</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Project Creator</h2>
          </div>

          <div className="max-w-md mx-auto glass-card rounded-2xl p-8 border border-white/5 flex flex-col items-center text-center space-y-5 shadow-xl">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center text-2xl font-black text-white shadow-lg">
              {ABOUT_CONTENT.developer.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{ABOUT_CONTENT.developer.name}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                {ABOUT_CONTENT.developer.role}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs">
              {ABOUT_CONTENT.developer.bio}
            </p>

            <div className="flex items-center justify-center gap-3.5 pt-2">
              <a
                href={ABOUT_CONTENT.developer.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="h-4.5 w-4.5" />
              </a>
              <a
                href={ABOUT_CONTENT.developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a
                href={`mailto:${ABOUT_CONTENT.developer.email}`}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-colors"
                aria-label="Send Email"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
              <a
                href={ABOUT_CONTENT.developer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-colors"
                aria-label="Personal Portfolio"
              >
                <Globe className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
