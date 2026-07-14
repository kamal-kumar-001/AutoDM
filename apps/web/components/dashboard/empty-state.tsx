'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Instagram, Layers } from 'lucide-react';
import { Button } from '@autodm/ui';

interface EmptyStateProps {
  onConnect: () => void;
  onCreateCampaign: () => void;
}

export function EmptyState({ onConnect, onCreateCampaign }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 glass-card border-gradient rounded-xl shadow-glass relative overflow-hidden text-center space-y-6 max-w-2xl mx-auto my-6">
      {/* Background glow overlays */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-glow-gradient pointer-events-none opacity-20 blur-xl" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-mesh-gradient pointer-events-none opacity-20 blur-xl" />

      {/* Dynamic Graphic Header */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-full border border-dashed border-primary/30 flex items-center justify-center opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,187,136,0.3)]">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-extrabold text-white tracking-tight">
          Supercharge your Instagram DMs
        </h2>
        <p className="text-xs text-gray-400 leading-normal">
          Welcome to AutoDM! Connect your Meta channel first, then construct your first
          Comment-to-DM or Keyword-to-DM trigger automation flow.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs sm:max-w-none justify-center">
        <Button onClick={onConnect} className="text-xs font-bold gap-2">
          <Instagram className="h-4 w-4" />
          <span>Connect Instagram</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
        <Button onClick={onCreateCampaign} variant="secondary" className="text-xs font-bold gap-2">
          <Layers className="h-4 w-4" />
          <span>Create Campaign</span>
        </Button>
      </div>
    </div>
  );
}
