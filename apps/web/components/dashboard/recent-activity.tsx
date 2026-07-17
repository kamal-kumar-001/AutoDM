'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MessageCircle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useRecentActivity } from '@/lib/use-analytics';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function RecentActivity() {
  const { data: rawActivities, loading } = useRecentActivity();

  // Defensive: always guarantee an array even if the hook returns something unexpected
  const activities = Array.isArray(rawActivities) ? rawActivities : [];

  return (
    <div className="glass-card border-gradient p-5 rounded-xl shadow-glass flex flex-col space-y-4 flex-grow h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Live Activity</h3>
        </div>
        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
      </div>

      {/* Activity Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px] max-h-[480px] custom-scrollbar">
        {loading ? (
          // Skeleton rows
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="h-6 w-6 rounded-lg bg-white/10 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 bg-white/10 rounded" />
                <div className="h-2 w-1/3 bg-white/5 rounded" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <MessageSquare className="h-8 w-8 text-gray-600" />
            <p className="text-xs text-gray-500">No automation activity yet.</p>
            <p className="text-[10px] text-gray-600">
              Activity appears here once comments or DMs are processed.
            </p>
          </div>
        ) : (
          activities.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-start space-x-3 text-xs"
            >
              {/* Timeline icon */}
              <div className="relative flex items-center justify-center h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 mt-0.5">
                {event.type === 'comment' ? (
                  <MessageCircle className="h-3 w-3 text-primary" />
                ) : (
                  <MessageSquare className="h-3 w-3 text-accent-cyan" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-gray-300 leading-normal truncate">
                    <strong className="text-white">{event.label}</strong>
                  </p>
                  {event.success ? (
                    <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                  )}
                </div>
                {event.detail && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">"{event.detail}"</p>
                )}
                <span className="text-[9px] text-gray-600 block mt-0.5">{timeAgo(event.ts)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
