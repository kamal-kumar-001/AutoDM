'use client';

import * as React from 'react';
import { Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}
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

export function AdminQueue() {
  const [queues, setQueues] = React.useState<QueueStats[]>([]);
  const [jobs, setJobs] = React.useState<FailedJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [retrying, setRetrying] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      apiRequest<QueueStats[]>('/admin/queues')
        .then((r) => setQueues(Array.isArray(r) ? r : []))
        .catch(() => setQueues([])),
      apiRequest<FailedJob[]>('/admin/failed-jobs')
        .then((r) => setJobs(Array.isArray(r) ? r : []))
        .catch(() => setJobs([])),
    ]).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const retry = async (job: FailedJob) => {
    setRetrying(job.id);
    try {
      await apiRequest(`/admin/failed-jobs/${encodeURIComponent(job.queue)}/${job.id}/retry`, {
        method: 'POST',
      });
      toast.success('Job re-queued');
      setTimeout(load, 800);
    } catch {
      toast.error('Retry failed');
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue stats */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Queue Status</h3>
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queues.map((q) => (
              <div
                key={q.name}
                className="glass-card border-gradient rounded-xl p-4 shadow-glass space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {q.name.replace(/_queue$/, '').replace(/_/g, ' ')}
                  </h4>
                  <span
                    className={`text-[9px] font-semibold ${q.paused ? 'text-amber-400' : 'text-primary'}`}
                  >
                    {q.paused ? '⏸ Paused' : '▶ Running'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ['Waiting', q.waiting, 'text-amber-400'],
                    ['Active', q.active, 'text-primary'],
                    ['Done', q.completed, 'text-gray-400'],
                    ['Failed', q.failed, 'text-red-400'],
                  ].map(([l, v, c]) => (
                    <div key={String(l)} className="p-2 rounded-lg bg-white/5 space-y-1">
                      <p className={`text-lg font-extrabold ${c}`}>{v}</p>
                      <p className="text-[9px] text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failed jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Failed Jobs</h3>
            {jobs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                {jobs.length}
              </span>
            )}
          </div>
          <button
            onClick={load}
            className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-14 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card border-gradient rounded-xl p-8 text-center text-xs text-gray-500">
            No failed jobs — all workers healthy ✓
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="glass-card border-gradient rounded-xl p-3 border-red-500/10 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white">{job.name}</span>
                      <span className="text-[9px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {job.queue}
                      </span>
                      <span className="text-[9px] text-amber-400">{job.attemptsMade} attempts</span>
                    </div>
                    <p className="text-[10px] text-red-300 mt-0.5 truncate">{job.failedReason}</p>
                  </div>
                  <button
                    onClick={() => retry(job)}
                    disabled={retrying === job.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-50 transition-all flex-shrink-0"
                  >
                    {retrying === job.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}{' '}
                    Retry
                  </button>
                </div>

                {/* Collapsible job details payload */}
                <details className="group mt-2 border-t border-white/5 pt-1.5">
                  <summary className="text-[9px] text-gray-500 cursor-pointer hover:text-gray-300 transition-colors select-none">
                    View payload details
                  </summary>
                  <pre className="mt-1.5 text-[9px] text-gray-500 bg-black/40 border border-white/5 rounded-lg p-2.5 overflow-x-auto max-h-40 font-mono">
                    {JSON.stringify(job.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
