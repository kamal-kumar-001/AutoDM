'use client';

import * as React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { FOOTER_CONTENT } from '@/lib/landing-data';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030712]/50 relative overflow-hidden py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Logo Brand Segment (Span 2 on desktop) */}
          <div className="col-span-2 space-y-4 pr-0 md:pr-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                {LANDING_NAV_logo()}
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              {FOOTER_CONTENT.tagline}
            </p>
            {/* Social media icons */}
            <div className="flex gap-2.5 pt-2">
              {FOOTER_CONTENT.socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all"
                    title={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_CONTENT.columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-xs font-bold text-white uppercase tracking-widest">
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lower copyright bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[11px] text-gray-500">{FOOTER_CONTENT.copyright}</p>
          <p className="text-[11px] text-gray-500">Engineered for Instagram creators worldwide.</p>
        </div>
      </div>
    </footer>
  );
}

// Inline fallback helper for logo name
function LANDING_NAV_logo() {
  return 'AutoDM';
}
