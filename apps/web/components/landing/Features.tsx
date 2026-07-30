'use client';

import * as React from 'react';
import { INNOVATIONS_CONTENT, PWA_MOBILE_CONTENT, PERSONAS_CONTENT } from '@/lib/landing-data';
import {
  CheckCircle2,
  ShieldCheck,
  Flame,
  BellRing,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

export default function Features() {
  return (
    <div className="space-y-24 py-16 sm:py-24 relative">
      {/* Background ambient glows */}
      <div className="absolute top-[15%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[65%] right-[-10%] w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. SIX INNOVATIONS SECTION */}
      <section id="innovations" className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            {INNOVATIONS_CONTENT.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Six Innovations No Other <br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent-cyan bg-clip-text text-transparent">
              DM Tool Built for India
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {INNOVATIONS_CONTENT.description}
          </p>
        </div>

        {/* 6 Innovations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INNOVATIONS_CONTENT.items.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="glass-card-interactive p-7 rounded-2xl border-gradient flex flex-col justify-between relative overflow-hidden group space-y-6"
              >
                {/* Number Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,187,136,0.15)]">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-3xl font-black text-white/20 group-hover:text-primary/40 transition-colors font-mono">
                    {item.number}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-primary tracking-wide">{item.subtitle}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>

                {/* Customized Demo Snippet per Innovation */}
                <div className="pt-2 border-t border-white/5">
                  {item.number === '01' && item.example && (
                    <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        <span>Filtered Spam Noise</span>
                        <span className="text-emerald-400 font-black">
                          ★ Reply Desk High-Intent
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono opacity-50">
                        {item.example.noise.map((n, i) => (
                          <span
                            key={i}
                            className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400 line-through"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-start gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item.example.real}</span>
                      </div>
                    </div>
                  )}

                  {item.number === '02' && item.languages && (
                    <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2 text-[11px]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        Native Regional Languages & Hinglish
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.languages.map((lang, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.number === '03' && item.variantDemo && (
                    <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1.5 text-[10px] font-mono">
                      <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block">
                        Auto Rotated Every 50 Sends
                      </span>
                      {item.variantDemo.map((v, i) => (
                        <div
                          key={i}
                          className="truncate text-gray-300 bg-white/5 p-1 rounded border border-white/5"
                        >
                          <span className="text-primary font-bold mr-1">V{i + 1}:</span> {v}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.number === '04' && item.badgeText && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 font-semibold flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
                      <span>{item.badgeText}</span>
                    </div>
                  )}

                  {item.number === '05' && item.alertDemo && (
                    <div className="bg-primary/10 border border-primary/25 rounded-xl p-2.5 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                      <span>{item.alertDemo}</span>
                    </div>
                  )}

                  {item.number === '06' && item.voiceDemo && (
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span>🎙️ {item.voiceDemo}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. PWA MOBILE MANAGEMENT SECTION */}
      <section id="mobile" className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="glass-card border-gradient rounded-3xl p-8 sm:p-12 shadow-glass overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs font-black text-accent-cyan uppercase tracking-widest inline-block">
                {PWA_MOBILE_CONTENT.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {PWA_MOBILE_CONTENT.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {PWA_MOBILE_CONTENT.description}
              </p>

              <div className="space-y-4 pt-2">
                {PWA_MOBILE_CONTENT.features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start space-x-3.5 bg-white/5 p-4 rounded-xl border border-white/5"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile PWA Mock Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs bg-slate-900 border-4 border-slate-800 rounded-[40px] p-4 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
                    <span>⚡ Push Alert</span>
                    <span>Just Now</span>
                  </div>
                  <p className="text-xs text-white font-bold">Reel Spike Detected!</p>
                  <p className="text-[10px] text-gray-300">
                    2,400 DMs sent in the last 60 mins. Queue auto-paced safely.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">
                    Reply Desk High-Intent
                  </span>
                  <div className="text-[11px] text-white font-medium">
                    "Does this work for a 5k follower fashion account?"
                  </div>
                  <button className="w-full py-1.5 rounded-lg bg-primary text-black font-extrabold text-[10px] uppercase tracking-wider">
                    Reply via WhatsApp / PWA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUILT FOR EVERYONE (PERSONAS) SECTION */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest inline-block">
            {PERSONAS_CONTENT.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {PERSONAS_CONTENT.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERSONAS_CONTENT.items.map((pers, idx) => {
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border-gradient flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white inline-block">
                    {pers.tag}
                  </span>
                  <p className="text-xs text-gray-400 leading-relaxed">{pers.desc}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-primary">{pers.stat}</span>
                  <span className="text-gray-500 font-mono text-[10px]">{pers.creatorHandle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
