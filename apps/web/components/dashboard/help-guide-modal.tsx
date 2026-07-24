'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Link, Layers, PlayCircle, HelpCircle } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuideModal({ isOpen, onClose }: HelpGuideModalProps) {
  const steps = [
    {
      title: '1. Link Instagram Account',
      description:
        'Navigate to Settings -> Account tab. Click "Connect Facebook" to authorize access. Select the Instagram Business Page you want to automate. Ensure the Instagram account is set to Business or Creator mode.',
      icon: Link,
    },
    {
      title: '2. Setup Sandbox Roles (If Testing)',
      description:
        'If your Meta App is in Development mode, you must invite test accounts. Go to Meta Developer Portal -> App Roles -> Roles. Add your target test Instagram accounts as Instagram Testers. Accept the invite under Instagram Settings -> Website Permissions -> Tester Invites.',
      icon: HelpCircle,
    },
    {
      title: '3. Create Your Automation Campaign',
      description:
        'Go to Automations and click "Create Campaign". Set up your triggers (keywords in DMs/comments, or specific media monitors), type out your custom message (use {username} or {name} for personalization!), and choose public comment reply options.',
      icon: Layers,
    },
    {
      title: '4. Test Your Triggers',
      description:
        'Use a separate Instagram account (registered as a tester) to comment the keyword on your selected post or send a DM. The queue worker processes the webhook and delivers the auto-reply in under 3 seconds!',
      icon: PlayCircle,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto max-w-2xl h-fit max-h-[85vh] overflow-y-auto glass-card border border-white/10 bg-[#0c0d14]/90 rounded-3xl p-6 md:p-8 z-50 shadow-2xl space-y-6 custom-scrollbar"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">How to Use AutoDM</h3>
                  <p className="text-xs text-gray-500">
                    Step-by-step instructions to get your automations running smoothly.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300 space-y-2.5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Video/visual helper text */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <p className="text-[10px] text-gray-400">
                💡 <strong>Important Note:</strong> Ensure that your Facebook page has full
                permissions connected inside the Meta Business Suite settings, and that the account
                is linked to your target Instagram account.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
