'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS_CONTENT } from '@/lib/landing-data';

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 relative">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently asked <span className="text-primary">questions</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Everything you need to know about AutoDM triggers and Meta compliance.
          </p>
        </div>

        {/* Accordions with AnimatePresence */}
        <div className="space-y-4 max-w-3xl mx-auto mb-16">
          {FAQS_CONTENT.items.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                onClick={() => toggle(idx)}
                className={`glass-card rounded-2xl cursor-pointer overflow-hidden border transition-all duration-300 ${
                  isOpen
                    ? 'border-primary/40 bg-gradient-to-r from-primary/10 via-[#0a0f1e]/60 to-transparent shadow-[0_0_20px_rgba(0,187,136,0.15)]'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-center p-5 sm:p-6 gap-4 select-none">
                  <span className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown
                      className={`w-5 h-5 ${isOpen ? 'text-primary' : 'text-gray-500'}`}
                    />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-white/5">
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-3 font-medium">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic support CTA with subtle gradient button */}
        <div className="text-center space-y-4">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Still have questions or need custom limits?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
