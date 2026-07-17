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
          {FAQS_CONTENT.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => toggle(idx)}
                className={`glass-card rounded-2xl cursor-pointer overflow-hidden border transition-all duration-300 ${
                  isOpen
                    ? 'border-primary/30 bg-[#0a0f1e]/40'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center p-5 sm:p-6 gap-4 select-none">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary' : 'rotate-0'
                    }`}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-white/[0.02]">
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
