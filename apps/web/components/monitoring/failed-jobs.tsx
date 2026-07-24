'use client';

import * as React from 'react';
import { Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from '@autodm/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FailedJob {
  id: string;
  queue: string;
  name: string;
  data: unknown;
  failedReason: string;
  attemptsMade: number;
  timestamp: number;
  finishedOn?: number;
}

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const s = await fetch('/api/auth/session');
  const session = await s.json();
  const jwt = (session as any)?.accessToken as string | undefined;
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(opts?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  return json && typeof json === 'object' && 'success' in json && 'data' in json
    ? (json.data as T)
    : (json as T);
}

export function FailedJobs() {
  const [jobs, setJobs] = React.useState<FailedJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [retrying, setRetrying] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetchAuth<FailedJob[]>('/monitoring/failed-jobs')
      .then((res) => setJobs(Array.isArray(res) ? res : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleRetry = async (job: FailedJob) => {
    setRetrying(job.id);
    try {
      const encodedQueue = encodeURIComponent(job.queue);
      await fetchAuth(`/monitoring/failed-jobs/${encodedQueue}/${job.id}/retry`, {
        method: 'POST',
      });
      toast.success(`Job re-queued`, {
        description: `Job ${job.id.slice(0, 8)}… added back to ${job.queue}`,
      });
      setTimeout(load, 800);
    } catch {
      toast.error('Retry failed', { description: 'Could not re-queue job.' });
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-bold text-white">Failed Jobs</h3>
          {jobs.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
              {jobs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          <button
            onClick={load}
            className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-lg">✓</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">No failed jobs</p>
          <p className="text-[10px] text-gray-600">All workers are running cleanly.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">{job.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                      {job.queue.replace(/_queue$/, '')}
                    </span>
                    <span className="text-[9px] text-amber-400">
                      {job.attemptsMade} attempt{job.attemptsMade !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-red-300 mt-1 truncate">{job.failedReason}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">
                    {job.finishedOn
                      ? new Date(job.finishedOn).toLocaleString()
                      : new Date(job.timestamp).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleRetry(job)}
                  disabled={retrying === job.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-50 transition-all flex-shrink-0"
                >
                  {retrying === job.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  Retry
                </button>
              </div>

              {/* Job payload preview */}
              <details className="group">
                <summary className="text-[9px] text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">
                  View payload
                </summary>
                <pre className="mt-1.5 text-[9px] text-gray-500 bg-black/40 rounded p-2 overflow-x-auto max-h-24">
                  {JSON.stringify(job.data, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
