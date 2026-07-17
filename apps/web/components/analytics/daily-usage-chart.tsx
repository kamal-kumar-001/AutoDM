'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
interface DailyUsage {
  date: string;
  comments: number;
  dmsSent: number;
  failedDms: number;
}

async function fetchAuth<T>(path: string): Promise<T> {
  const s = await fetch('/api/auth/session');
  const session = await s.json();
  const jwt = (session as any)?.accessToken as string | undefined;
  const res = await fetch(`${API_URL}${path}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export function DailyUsageChart() {
  const [data, setData] = React.useState<DailyUsage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAuth<DailyUsage[]>('/analytics/daily-usage?days=30')
      .then((r) => setData(Array.isArray(r) ? r : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const maxVal = data.length ? Math.max(...data.map((d) => Math.max(d.comments, d.dmsSent)), 1) : 1;

  // Show only every 5th label to avoid crowding
  const labelStep = Math.ceil(data.length / 7);

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-white">30-Day Daily Usage</h3>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
            Comments
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2 w-2 rounded-full bg-accent-cyan inline-block" />
            DMs Sent
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
            Failed
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-40 rounded-lg bg-white/5 animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-gray-500">
          No usage data yet.
        </div>
      ) : (
        <div className="relative h-40">
          <div className="flex items-end gap-0.5 h-full w-full">
            {data.map((d, i) => (
              <div key={d.date} className="flex-1 flex items-end gap-px h-full group relative">
                {/* Comment bar */}
                <motion.div
                  className="flex-1 bg-primary/60 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.comments / maxVal) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.01 }}
                />
                {/* DMs bar */}
                <motion.div
                  className="flex-1 bg-accent-cyan/60 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.dmsSent / maxVal) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.01 + 0.05 }}
                />
                {/* Failed bar */}
                {d.failedDms > 0 && (
                  <motion.div
                    className="flex-1 bg-red-400/60 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.failedDms / maxVal) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.01 + 0.1 }}
                  />
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 bg-black/80 border border-white/10 rounded-lg p-2 text-[9px] text-white whitespace-nowrap space-y-0.5 backdrop-blur-sm">
                  <p className="font-bold text-gray-300">{d.date}</p>
                  <p className="text-primary">Comments: {d.comments}</p>
                  <p className="text-accent-cyan">DMs: {d.dmsSent}</p>
                  {d.failedDms > 0 && <p className="text-red-400">Failed: {d.failedDms}</p>}
                </div>
                {/* X-axis label */}
                {i % labelStep === 0 && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-gray-600">
                    {d.date.slice(5)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
        </div>
      )}
    </div>
  );
}
