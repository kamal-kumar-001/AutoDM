'use client';

import * as React from 'react';
import { Link2, Sparkles, Layers, Play } from 'lucide-react';

export default function SetupGuide() {
  const steps = [
    {
      step: '01',
      title: 'Link Instagram',
      desc: 'Navigate to Settings inside the dashboard, click "Connect Facebook" to authorize access, and select your Instagram Business account.',
      icon: Link2,
    },
    {
      step: '02',
      title: 'Invite Testers',
      desc: 'If in Meta Development mode, add your test accounts under App Roles -> Instagram Testers on the Facebook Developer portal and accept the invite.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Create Campaign',
      desc: 'Click "Create Campaign" on the Automations tab, select your target post or keyword, compose your DMs or comment reply templates, and launch!',
      icon: Layers,
    },
    {
      step: '04',
      title: 'Comment & Trigger',
      desc: 'Comment your configured keyword on your post using any test account, and witness the auto-reply deliver in under 3 seconds.',
      icon: Play,
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
