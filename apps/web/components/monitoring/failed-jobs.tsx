'use client';

import * as React from 'react';
import { Loader2, RotateCcw, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@autodm/ui';
import { fetchWithAuth } from '@/lib/api-client';

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

export function FailedJobs() {
  const [jobs, setJobs] = React.useState<FailedJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [retrying, setRetrying] = React.useState<string | null>(null);
  const [deleteTimeframe, setDeleteTimeframe] = React.useState<string>('all');
  const [actionLoading, setActionLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetchWithAuth<FailedJob[]>('/monitoring/failed-jobs')
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
      await fetchWithAuth('/monitoring/failed-jobs/' + encodedQueue + '/' + job.id + '/retry', {
        method: 'POST',
      });
      toast.success('Job re-queued', {
        description: 'Job ' + job.id.slice(0, 8) + '… added back to ' + job.queue,
      });
      setTimeout(load, 800);
    } catch {
      toast.error('Retry failed', { description: 'Could not re-queue job.' });
    } finally {
      setRetrying(null);
    }
  };

  const purgeFailedJobs = async () => {
    const confirmText =
      deleteTimeframe === 'all'
        ? 'Are you sure you want to delete ALL failed jobs?'
        : 'Delete failed jobs older than ' + deleteTimeframe + '?';

    if (!confirm(confirmText)) return;

    setActionLoading(true);
    const toastId = toast.loading('Deleting failed jobs...');
    try {
      const res = await fetchWithAuth<{ count: number }>(
        '/monitoring/failed-jobs?olderThan=' + deleteTimeframe,
        { method: 'DELETE' },
      );
      toast.success('Deleted ' + res.count + ' failed jobs (' + deleteTimeframe + ')', {
        id: toastId,
      });
      load();
    } catch {
      toast.error('Failed to delete failed jobs', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-bold text-white">Failed Jobs Queue</h3>
          {jobs.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
              {jobs.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}

          {/* Refresh Button */}
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Refresh Failed Jobs List"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Timeframe Delete Selector */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1 space-x-1">
            <select
              value={deleteTimeframe}
              onChange={(e) => setDeleteTimeframe(e.target.value)}
              className="bg-transparent text-xs text-gray-300 font-semibold px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Failed
              </option>
              <option value="24h" className="bg-slate-900 text-white">
                Older than 24h
              </option>
              <option value="7d" className="bg-slate-900 text-white">
                Older than 7d
              </option>
              <option value="30d" className="bg-slate-900 text-white">
                Older than 30d
              </option>
            </select>
            <button
              onClick={purgeFailedJobs}
              disabled={actionLoading || jobs.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {loading && jobs.length === 0 ? (
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
          <p className="text-xs text-gray-400 font-medium">No failed jobs in queue</p>
          <p className="text-[10px] text-gray-600">All background workers are executing cleanly.</p>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-50 transition-all flex-shrink-0 cursor-pointer"
                >
                  {retrying === job.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  Retry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
