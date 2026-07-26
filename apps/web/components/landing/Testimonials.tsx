'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, MessageCircle, ArrowUpRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  handle: string;
  avatarGradient: string;
  followers: string;
  text: string;
  rating: number;
  highlightResult: string;
  growthMetric: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ishita Tech',
    handle: '@ishita.designs',
    avatarGradient: 'from-pink-500 to-purple-600',
    followers: '180K Followers',
    text: "AutoDM completely changed my launch workflow. I used to stay up manually DM'ing resource links to thousands of commenters. Now, the ebooks deliver in 400ms automatically. Outstanding!",
    rating: 5,
    highlightResult: 'Saved 12 hrs/week',
    growthMetric: '+4,200 leads',
  },
  {
    id: '2',
    name: 'Kabir Vlogs',
    handle: '@kabir_travels',
    avatarGradient: 'from-cyan-500 to-blue-600',
    followers: '320K Followers',
    text: 'Meta-compliance was my biggest worry with other DM tools. AutoDM runs entirely through the official Meta Graph API. My engagement is up 140% and my account is 100% safe.',
    rating: 5,
    highlightResult: '140% Engagement Boost',
    growthMetric: '2.5x DM CTR',
  },
  {
    id: '3',
    name: 'Aanya Sharma',
    handle: '@aanya_coaches',
    avatarGradient: 'from-amber-400 to-orange-600',
    followers: '95K Followers',
    text: 'The follow-check gate is pure gold. Non-followers get prompted to follow before they receive my templates. It helped me grow my follower base by 8,000 active fans in 3 weeks!',
    rating: 5,
    highlightResult: '+8k followers added',
    growthMetric: '92% conversion rate',
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-transparent">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary uppercase inline-block"
          >
            Social Proof
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            Loved by 2,000+ top-tier creators
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-400"
          >
            See how creators are scaling their lead generation, conversion, and community growth.
          </motion.p>
        </div>

        {/* Desktop Layout - 3 Grid Columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card border-gradient rounded-2xl p-6 shadow-glass relative group overflow-hidden flex flex-col justify-between min-h-[260px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {Array.from({ length: testimonial.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    {testimonial.highlightResult}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium italic">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 relative z-10">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${testimonial.avatarGradient} flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 text-xs uppercase`}
                  >
                    {testimonial.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {testimonial.name}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/10 flex-shrink-0" />
                    </div>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {testimonial.handle}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">
                    {testimonial.followers}
                  </span>
                  <span className="text-[9px] text-primary font-black flex items-center justify-end gap-0.5">
                    {testimonial.growthMetric} <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View - Auto-Looping Single-Slide Carousel */}
        <div className="md:hidden relative px-2 py-4 flex flex-col items-center">
          <div className="w-full overflow-hidden relative min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="glass-card border-gradient rounded-2xl p-6 shadow-glass relative overflow-hidden flex flex-col justify-between w-full min-h-[230px]"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {Array.from({ length: TESTIMONIALS[activeIndex].rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-black uppercase tracking-wider">
                      {TESTIMONIALS[activeIndex].highlightResult}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium italic">
                    "{TESTIMONIALS[activeIndex].text}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${TESTIMONIALS[activeIndex].avatarGradient} flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 text-xs uppercase`}
                    >
                      {TESTIMONIALS[activeIndex].name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {TESTIMONIALS[activeIndex].name}
                        </span>
                        <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/10 flex-shrink-0" />
                      </div>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {TESTIMONIALS[activeIndex].handle}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold block">
                      {TESTIMONIALS[activeIndex].followers}
                    </span>
                    <span className="text-[9px] text-primary font-black flex items-center justify-end gap-0.5">
                      {TESTIMONIALS[activeIndex].growthMetric}{' '}
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-2 mt-6">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'bg-primary w-4' : 'bg-white/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Global summary badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Join the elite circle of automated growth. Get started for free today.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
