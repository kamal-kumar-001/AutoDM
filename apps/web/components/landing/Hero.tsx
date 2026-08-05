'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Star, Sparkles } from 'lucide-react';
import { HERO_CONTENT } from '@/lib/landing-data';

export default function Hero() {
  const { data: session } = useSession();
  const bars = [45, 70, 55, 90, 65, 80, 95, 60, 75, 88, 50, 72, 85, 60];
  const [activeStep, setActiveStep] = React.useState(0);
  const heroRef = React.useRef<HTMLDivElement>(null);

  // 3D Scroll Perspective Transformation
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const mockupRotateX = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const mockupScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
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
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white font-bold text-base shadow-[0_0_20px_rgba(0,187,136,0.25)] hover:shadow-[0_0_30px_rgba(0,187,136,0.4)] transition-all hover:scale-[1.02] active:scale-[0.99]"
            >
              {session ? 'Go to Dashboard' : HERO_CONTENT.ctaPrimary}{' '}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 text-white font-semibold text-base transition-all hover:bg-white/10 cursor-pointer shadow-sm hover:shadow-md"
            >
              <Play className="w-4 h-4 fill-current text-primary" />
              <span>How It Works</span>
            </a>
          </div>

          {/* Social Proof Marks */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {['#EC4899', '#8B5CF6', '#3B82F6', '#10B981'].map((color, i) => (
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

        {/* Right Column - 3D Scroll Tilted Dashboard Mockup Card */}
        <motion.div
          style={{
            rotateX: mockupRotateX,
            scale: mockupScale,
            opacity: mockupOpacity,
            perspective: 1000,
          }}
          initial={{ opacity: 0, y: 30, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
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
                      &quot;Need the pricing ebook! 🔥&quot;
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
                      Matching keyword &quot;ebook&quot; & checking follow gate... MATCHED
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
                    ? 'bg-emerald-500/10 border-emerald-500/25 translate-x-1'
                    : 'bg-white/[0.02] border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black text-[9px]">
                    📩
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white leading-none">
                      Commenter DM Delivered
                    </p>
                    <p className="text-[10px] text-emerald-300 mt-1 font-bold">
                      &quot;Hey @ishita.tech! Here is your requested e-book download link → autodm.org/ebook&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Audio Spectrum Bar */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {bars.map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [
                        `${Math.max(15, height * 0.4)}%`,
                        `${height}%`,
                        `${Math.max(15, height * 0.4)}%`,
                      ],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.08,
                    }}
                    className="w-1 bg-gradient-to-t from-primary to-accent-cyan rounded-full h-8"
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-gray-500">Auto-Surge Protected</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
