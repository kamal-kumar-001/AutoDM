'use client';

import * as React from 'react';
import { Loader2, Pause, Play } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
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

function QueueCard({ q }: { q: QueueStats }) {
  const friendlyName = q.name.replace(/_queue$/, '').replace(/_/g, ' ');
  return (
    <div className="glass-card border-gradient rounded-xl p-4 shadow-glass space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{friendlyName}</h4>
          <span
            className={`text-[9px] font-semibold ${q.paused ? 'text-amber-400' : 'text-primary'}`}
          >
            {q.paused ? '⏸ Paused' : '▶ Running'}
          </span>
        </div>
        {q.failed > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
            {q.failed} failed
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Waiting', val: q.waiting, color: 'text-amber-400' },
          { label: 'Active', val: q.active, color: 'text-primary' },
          { label: 'Done', val: q.completed, color: 'text-gray-400' },
          { label: 'Delayed', val: q.delayed, color: 'text-blue-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="p-2 rounded-lg bg-white/5 space-y-1">
            <span className={`text-lg font-extrabold ${color}`}>{val}</span>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueueHealth() {
  const [queues, setQueues] = React.useState<QueueStats[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    fetchAuth<QueueStats[]>('/monitoring/queues')
      .then((res) => setQueues(Array.isArray(res) ? res : []))
      .catch(() => setQueues([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Queue Health</h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : queues.length === 0 ? (
        <p className="text-xs text-gray-500 p-4 glass-card rounded-xl">No queues available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queues.map((q) => (
            <QueueCard key={q.name} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}
