'use client';

import * as React from 'react';
import { Link2, Sparkles, Layers, Play, CheckCircle } from 'lucide-react';

export default function SetupGuide() {
  const steps = [
    {
      step: '01',
      title: 'Professional Account',
      desc: 'Switch your Instagram profile type to a Business or Creator account. Meta does not support automation for personal profiles.',
      icon: Sparkles,
    },
    {
      step: '02',
      title: 'Link Facebook Page',
      desc: 'Link your Instagram account directly to your Facebook Page in your Instagram Profile settings -> Page.',
      icon: Link2,
    },
    {
      step: '03',
      title: 'Authorize AutoDM',
      desc: 'Navigate to Settings -> Account in the AutoDM dashboard. Click "Connect Facebook" and authorize access to your Page and Instagram profile.',
      icon: CheckCircle,
    },
    {
      step: '04',
      title: 'Launch Campaign',
      desc: 'Click "Create Campaign" on the Automations tab, select your target post or keyword, compose your DMs, and activate your campaign!',
      icon: Layers,
    },
  ];

  return (
    <section id="guide" className="py-24 sm:py-32 relative border-t border-white/5 bg-[#030712]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest">
            Step-by-step Setup
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How to get started with <span className="text-primary">AutoDM</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Link your account, configure your automation campaigns, and start driving conversions
            instantly.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 border border-white/5 hover:border-primary/25 transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Icon & Number */}
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-black text-white/10 group-hover:text-primary/20 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Text content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
