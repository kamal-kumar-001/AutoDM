'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INNOVATIONS_CONTENT, PWA_MOBILE_CONTENT, PERSONAS_CONTENT } from '@/lib/landing-data';
import { Sparkles, MessageCircle, Flame, BellRing, Check } from 'lucide-react';

export default function Features() {
  const [activeTab, setActiveTab] = React.useState(0);
  const activeItem = INNOVATIONS_CONTENT.items[activeTab];

  return (
    <div className="space-y-24 py-16 sm:py-24 relative">
      {/* 1. SIX INNOVATIONS INTERACTIVE SHOWCASE */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            {INNOVATIONS_CONTENT.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Six Innovations Built for <br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent-cyan bg-clip-text text-transparent">
              Hinglish Social Commerce
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {INNOVATIONS_CONTENT.description}
          </p>
        </div>

        {/* Slideable & Scrollable Tab Selector Bar (Zero Clipping on Mobile, Tablet & Desktop) */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-6 sm:px-10 max-w-full">
            {INNOVATIONS_CONTENT.items.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 min-w-max ${
                    idx === 0 ? 'ml-2 sm:ml-0' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-primary via-emerald-400 to-accent-cyan text-white shadow-[0_0_25px_rgba(0,187,136,0.35)] scale-[1.03] ring-1 ring-white/20'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Crisp Permanent Feature Highlight Card (Smooth Viewport Entrance, Silky 3D Hover Tilt) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ rotateX: -3, rotateY: 3, scale: 1.008 }}
          className="max-w-5xl mx-auto glass-card border-gradient rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl transition-shadow hover:shadow-[0_0_50px_rgba(0,187,136,0.2)] [perspective:1000px] [transform-style:preserve-3d]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 10, rotateX: 3 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -10, rotateX: -3 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Specs & Copy */}
              <div className="lg:col-span-6 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary uppercase">
                    Feature {activeItem.number} / 06
                  </span>
                  <span className="text-xs font-bold text-gray-400">{activeItem.subtitle}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  {activeItem.title}
                </h3>

                <p className="text-sm text-gray-300 leading-relaxed">{activeItem.desc}</p>

                <ul className="space-y-2 pt-2 text-xs text-gray-300 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Instant real-time execution with Meta Graph API v20.0</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Zero manual setup required • Auto-configured in 60 seconds</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Visual Preview Graphic (Crisp Solid Glass, No Backdrop Blur Text Distortion) */}
              <div className="lg:col-span-6 bg-gradient-to-b from-[#111827]/90 to-[#0b101d]/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl">
                {activeItem.number === '01' && activeItem.example && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        Filtered Comment Noise
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ★ Reply Desk Active
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 font-mono text-[10px] opacity-40">
                      {activeItem.example.noise.map((n, i) => (
                        <span
                          key={i}
                          className="bg-white/10 px-2 py-0.5 rounded line-through text-gray-300"
                        >
                          {n}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium flex items-start gap-2.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs">{activeItem.example.real}</span>
                    </div>
                  </div>
                )}

                {activeItem.number === '02' && activeItem.languages && (
                  <div className="space-y-3 text-xs">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-white/10 pb-2">
                      Native Language & Hinglish Parsing
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeItem.languages.map((lang, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] text-gray-300">
                      Comment: &quot;bhai price kitna hai Bangalore shipping ke saath?&quot; →
                      Matched Trigger &quot;price&quot;
                    </div>
                  </div>
                )}

                {activeItem.number === '03' && activeItem.variantDemo && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-white/10 pb-2">
                      Anti-Spam Dynamic Copy Rotation
                    </span>
                    {activeItem.variantDemo.map((v, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-mono text-[11px]"
                      >
                        Variant {i + 1}: &quot;{v}&quot;
                      </div>
                    ))}
                  </div>
                )}

                {activeItem.number === '04' && activeItem.badgeText && (
                  <div className="space-y-3 text-xs text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                      <Flame className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-amber-300 text-xs">{activeItem.badgeText}</p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Redis BullMQ Queue pacing at 40 DMs/min during viral spikes.
                    </p>
                  </div>
                )}

                {activeItem.number === '05' && activeItem.alertDemo && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <BellRing className="w-4 h-4 animate-bounce" />
                      <span>Mobile PWA Push Alert</span>
                    </div>
                    <p className="text-white font-mono text-[11px]">{activeItem.alertDemo}</p>
                  </div>
                )}

                {activeItem.number === '06' && activeItem.voiceDemo && (
                  <div className="space-y-3 text-xs">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block border-b border-white/10 pb-2">
                      Speech-to-Automation Funnel Builder
                    </span>
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono text-[11px]">
                      {activeItem.voiceDemo}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 2. PWA MOBILE SECTION */}
      <section id="mobile" className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="glass-card border-gradient rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase inline-block">
                {PWA_MOBILE_CONTENT.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {PWA_MOBILE_CONTENT.title}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {PWA_MOBILE_CONTENT.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {PWA_MOBILE_CONTENT.features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile PWA Device Preview (Premium Glass Frame, No Harsh Black Box) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-[420px] rounded-[36px] border-2 border-primary/30 bg-gradient-to-b from-[#0e1726] via-[#090d16] to-[#04070d] shadow-[0_0_50px_rgba(0,187,136,0.2)] p-4 flex flex-col justify-between overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="w-24 h-4 bg-white/10 rounded-full mx-auto mb-4" />
                <div className="space-y-3 flex-1">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-white font-bold flex items-center justify-between shadow-sm">
                    <span>AutoDM Mobile PWA</span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono space-y-1">
                    <p className="text-emerald-400 font-bold">⚡ 2,500 DMs enqueued</p>
                    <p>Viral Spike Paced Safely</p>
                  </div>
                </div>
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. PERSONAS SECTION */}
      <section className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase inline-block">
            {PERSONAS_CONTENT.badge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tailored Operating Modes for Every Growth Model
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERSONAS_CONTENT.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl border-gradient flex flex-col justify-between space-y-4 hover:translate-y-[-6px] transition-all hover:shadow-[0_10px_30px_rgba(0,187,136,0.15)]"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-black text-primary block">{item.tag}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-300">
                  <span>{item.creatorHandle}</span>
                  <span className="text-emerald-400 font-bold">{item.stat}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
