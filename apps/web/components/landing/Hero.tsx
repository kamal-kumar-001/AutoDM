'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Sparkles } from 'lucide-react';
import { HERO_CONTENT } from '@/lib/landing-data';

export default function Hero() {
  const { data: session } = useSession();
  const bars = [45, 70, 55, 90, 65, 80, 95, 60, 75, 88, 50, 72, 85, 60];
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Premium Ambient Radial Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,187,136,0.15)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Floating Blobs */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[15%] left-[8%] w-[250px] h-[250px] rounded-full bg-primary/10 blur-[80px] pointer-events-none"
      />
      <motion.div
        animate={{
          y: [0, -35, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute bottom-[20%] right-[6%] w-[300px] h-[300px] rounded-full bg-accent-cyan/8 blur-[100px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Column - Main Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 shadow-[0_0_15px_rgba(0,187,136,0.15)]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">{HERO_CONTENT.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
            Turn Comments <br />
            Into Customers, <br />
            <span className="bg-gradient-to-r from-primary via-accent-cyan to-primary bg-clip-text text-transparent bg-[size:200%_auto] animate-gradient-shift">
              {HERO_CONTENT.titleGradient}
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg">
            {HERO_CONTENT.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={session ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white font-bold text-base shadow-[0_0_15px_rgba(0,187,136,0.15)] hover:shadow-[0_0_22px_rgba(0,187,136,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {session ? 'Go to Dashboard' : HERO_CONTENT.ctaPrimary}{' '}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-semibold text-base transition-colors hover:bg-white/10">
              <Play className="w-4 h-4 fill-current text-white" />
              <span>{HERO_CONTENT.ctaSecondary}</span>
            </button>
          </div>

          {/* Social Proof Marks */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {['#00BB88', '#06b6d4', '#10b981', '#14b8a6', '#0f766e'].map((color, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: color }}
                  className="w-8 h-8 rounded-full border-2 border-[#030712] flex items-center justify-center text-[10px] text-white font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Loved by 2,000+ creators and brands</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Premium Dashboard Mockup Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative"
        >
          {/* Backdrop Glow */}
          <div className="absolute inset-[-40px] bg-primary/10 blur-[60px] pointer-events-none rounded-full" />

          {/* Mockup Card Body */}
          <div className="glass-card rounded-2xl p-6 relative border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            {/* Header bar */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-400">AUTOMATION PREVIEW</span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_#00BB88]" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'DMs Sent', value: '2,451', color: 'text-primary' },
                { label: 'Deliver Rate', value: '99.4%', color: 'text-accent-cyan' },
                { label: 'Conversion', value: '38.2%', color: 'text-amber-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <p className={`text-lg font-black tracking-tight ${stat.color} mb-0.5`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini Chart Mockup */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">Weekly DM Volume</span>
                <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +24% increase
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-16 pt-2">
                {bars.map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/80 hover:to-accent-cyan transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Live DM Simulation Widget */}
            <div className="space-y-2.5 bg-white/[0.01] border border-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  LIVE SIMULATOR
                </span>
                <span className="flex items-center gap-1 text-[9px] text-primary font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> Live Syncing
                </span>
              </div>

              {/* Step 1: User Comments */}
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 border ${
                  activeStep === 0
                    ? 'bg-primary/5 border-primary/25 translate-x-1'
                    : 'bg-white/[0.02] border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center font-bold text-white text-[9px]">
                    IS
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-none">
                      @ishita.tech <span className="text-gray-500 font-normal">commented:</span>
                    </p>
                    <p className="text-[11px] text-gray-300 mt-1 font-semibold">
                      "Need the pricing ebook! 🔥"
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: AutoDM Processing */}
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 border ${
                  activeStep === 1
                    ? 'bg-accent-cyan/5 border-accent-cyan/25 translate-x-1'
                    : 'bg-white/[0.02] border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center font-bold text-accent-cyan text-[10px]">
                    ⚙️
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-none">AutoDM Engine</p>
                    <p className="text-[10px] text-accent-cyan mt-1 font-bold">
                      Matching keyword "ebook" & checking follow gate... MATCHED
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Meta DM Dispatched */}
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 border ${
                  activeStep === 2
                    ? 'bg-primary/5 border-primary/25 translate-x-1'
                    : 'bg-white/[0.02] border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-[10px]">
                    ✓
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-none">
                      Meta Messaging API
                    </p>
                    <p className="text-[10px] text-primary mt-1 font-bold">
                      Direct Message queued & sent in 280ms
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: DM Arrives on Phone */}
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 border ${
                  activeStep === 3
                    ? 'bg-amber-400/5 border-amber-400/25 translate-x-1'
                    : 'bg-white/[0.02] border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center text-white text-[10px]">
                    ✉
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white leading-none">
                      Inbox Delivery{' '}
                      <span className="text-[9px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-1 rounded ml-1 font-bold">
                        NEW
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1 truncate">
                      "Hey Ishita! Here is the link: <strong>autodm.com/ebook</strong>"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badge Widget */}
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-6 -right-6 glass-card rounded-2xl p-4 border border-primary/20 shadow-xl hidden sm:block"
          >
            <p className="text-xs font-extrabold text-primary flex items-center gap-2">
              ⚡ 340 DMs dispatched today
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
