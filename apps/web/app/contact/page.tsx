'use client';

import * as React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Mail, Globe, Github, Linkedin, MessageSquare, MapPin } from 'lucide-react';
import { ABOUT_CONTENT } from '@/lib/landing-data';

export default function ContactPage() {
  const dev = ABOUT_CONTENT.developer;

  return (
    <div className="bg-[#030712] min-h-screen text-white antialiased selection:bg-primary/30 selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-32 space-y-16 relative z-10">
        {/* Page Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-[0_0_15px_rgba(0,187,136,0.1)]">
            <MessageSquare className="h-4 w-4" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent leading-tight">
            We'd love to hear from you.
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Have questions about campaign integrations, custom plans, or API limits? Drop us a line
            and we'll get back to you shortly.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1: Email */}
          <a
            href={`mailto:${dev.email}`}
            className="glass-card-interactive p-6 rounded-2xl border border-white/5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Email Support</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Send us an email. We typically respond within 24 business hours.
              </p>
              <p className="text-xs font-bold text-primary pt-1 font-mono">{dev.email}</p>
            </div>
          </a>

          {/* Card 2: Developer Channels */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-bold text-white">Developer Networks</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect directly with the project creator across other channels.
              </p>
              <div className="flex gap-2.5 pt-1.5">
                {[
                  { icon: Github, href: dev.github, label: 'GitHub' },
                  { icon: Linkedin, href: dev.linkedin, label: 'LinkedIn' },
                  { icon: Globe, href: dev.portfolio, label: 'Portfolio' },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Support Meta Callout */}
        <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Self-Serve Solutions</h4>
            <p className="text-xs text-gray-400">
              Read our FAQs or verify developer documentation in the dashboard settings.
            </p>
          </div>
          <a
            href="/#faq"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all"
          >
            Read FAQs
          </a>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
