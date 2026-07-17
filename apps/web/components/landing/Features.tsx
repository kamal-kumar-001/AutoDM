'use client';

import * as React from 'react';
import { FEATURES_CONTENT } from '@/lib/landing-data';

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 relative">
      {/* Background glow effects */}
      <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            {FEATURES_CONTENT.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything you need to <br />
            <span className="bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
              automate at scale
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {FEATURES_CONTENT.description}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_CONTENT.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card-interactive p-8 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Icon box with glowing indicator */}
                  <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,187,136,0.15)]">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
