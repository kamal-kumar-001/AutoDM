'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus, Zap, Percent, Layers, Instagram } from 'lucide-react';
import { mockStats } from '@/lib/mock-data';

const getIcon = (title: string) => {
  switch (title) {
    case 'Total Automated Replies':
      return <Zap className="h-4 w-4 text-primary" />;
    case 'Response Conversion Rate':
      return <Percent className="h-4 w-4 text-accent-cyan" />;
    case 'Active Campaigns':
      return <Layers className="h-4 w-4 text-amber-400" />;
    default:
      return <Instagram className="h-4 w-4 text-pink-500" />;
  }
};

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockStats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="glass-card border-gradient p-5 rounded-xl flex flex-col justify-between shadow-glass relative group overflow-hidden"
        >
          {/* Accent glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
              {stat.title}
            </span>
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
              {getIcon(stat.title)}
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</span>
            <span
              className={`text-xs font-semibold flex items-center space-x-0.5 ${
                stat.trend === 'up'
                  ? 'text-primary'
                  : stat.trend === 'down'
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
              {stat.trend === 'neutral' && <Minus className="h-3 w-3" />}
              <span>{stat.change === '0' ? 'stable' : stat.change}</span>
            </span>
          </div>

          <p className="text-[10px] text-gray-500 mt-1">{stat.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
