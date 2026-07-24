'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface HealthStatus {
  api: boolean;
  database: boolean;
  redis: boolean;
  status: 'healthy' | 'degraded' | 'down';
  checkedAt: string;
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
  const json = await res.json();
  return json && typeof json === 'object' && 'success' in json && 'data' in json
    ? (json.data as T)
    : (json as T);
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/5 border border-white/5">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-medium text-white">{label}</span>
      <span className={`ml-auto text-xs font-semibold ${ok ? 'text-primary' : 'text-red-400'}`}>
        {ok ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

export function HealthPanel() {
  const [health, setHealth] = React.useState<HealthStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    fetchAuth<HealthStatus>('/monitoring/health')
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  const statusColor =
    health?.status === 'healthy'
      ? 'text-primary'
      : health?.status === 'degraded'
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">System Health</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Refreshes every 15s</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          {health && (
            <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
              {health.status}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-10 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : !health ? (
        <div className="flex items-center gap-2 text-xs text-amber-400 p-3 rounded-lg bg-amber-400/5 border border-amber-400/10">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Health check unavailable — API may be unreachable</span>
        </div>
      ) : (
        <div className="space-y-2">
          <StatusDot ok={health.api} label="API Server" />
          <StatusDot ok={health.database} label="PostgreSQL Database" />
          <StatusDot ok={health.redis} label="Redis / BullMQ" />
          <p className="text-[9px] text-gray-600 pt-1">
            Checked at {new Date(health.checkedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
