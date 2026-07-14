'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { mockActivities } from '@/lib/mock-data';

const getIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return <MessageCircle className="h-3 w-3 text-primary" />;
    case 'message':
      return <MessageSquare className="h-3 w-3 text-accent-cyan" />;
    default:
      return <Shield className="h-3 w-3 text-gray-400" />;
  }
};

export function RecentActivity() {
  return (
    <div className="glass-card border-gradient p-5 rounded-xl shadow-glass flex flex-col space-y-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Live Activity</h3>
        </div>
        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
      </div>

      {/* Activity Timeline */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[350px] custom-scrollbar">
        {mockActivities.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-start space-x-3 text-xs"
          >
            {/* Timeline icon dot */}
            <div className="relative flex items-center justify-center h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 mt-0.5">
              {getIcon(event.type)}
            </div>

            {/* Event message text */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 leading-normal">
                <strong className="text-white">@{event.username}</strong>{' '}
                <span className="text-gray-400">{event.action}</span>{' '}
                <span className="text-primary truncate font-medium hover:underline cursor-pointer block sm:inline">
                  "{event.target}"
                </span>
              </p>
              <span className="text-[9px] text-gray-500 block mt-0.5">{event.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
