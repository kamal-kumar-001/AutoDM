'use client';

import * as React from 'react';
import { Loader2, ChevronLeft, ChevronRight, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from '@autodm/ui';
import { API_BASE_URL, fetchWithAuth } from '@/lib/api-client';

interface WebhookLog {
  id: string;
  eventId: string | null;
  provider: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LogsResponse {
  logs: WebhookLog[];
  total: number;
  page: number;
  limit: number;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PROCESSED: 'bg-primary/10 text-primary border-primary/20',
    PENDING: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
    PAUSED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };
  const cls = map[status] ?? 'bg-white/10 text-gray-400 border-white/10';
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

export function WebhookLogs() {
  const [data, setData] = React.useState<LogsResponse | null>(null);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const load = React.useCallback((p: number) => {
    setLoading(true);
    fetchWithAuth<LogsResponse>(`/monitoring/webhook-logs?page=${p}&limit=15`)
      .then((res) => setData(res && Array.isArray(res.logs) ? res : null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const fetchStatus = () => {
    fetchWithAuth<{ paused: boolean }>('/monitoring/webhook-status')
      .then((res) => setIsPaused(res?.paused || false))
      .catch((e) => console.error(e));
  };

  React.useEffect(() => {
    load(page);
    fetchStatus();
  }, [page, load]);

  const togglePause = async () => {
    setActionLoading(true);
    const toastId = toast.loading(`${isPaused ? 'Resuming' : 'Pausing'} webhooks...`);
    try {
      const res = await fetchWithAuth<{ paused: boolean }>('/monitoring/webhook-status', {
        method: 'POST',
        body: JSON.stringify({ paused: !isPaused }),
      });
      setIsPaused(res.paused);
      toast.success(`Webhooks ${res.paused ? 'paused' : 'resumed'} successfully`, { id: toastId });
      load(page);
    } catch (e) {
      toast.error('Failed to change webhook status', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const purgeLogs = async () => {
    if (!confirm('Are you sure you want to purge all webhook event logs? This cannot be undone.'))
      return;
    setActionLoading(true);
    const toastId = toast.loading('Purging webhook logs...');
    try {
      await fetchWithAuth('/monitoring/webhook-logs', { method: 'DELETE' });
      toast.success('Webhook logs purged successfully', { id: toastId });
      setPage(1);
      load(1);
    } catch (e) {
      toast.error('Failed to purge webhook logs', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white">Webhook Logs</h3>
            {isPaused && (
              <span className="text-[9px] bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse">
                PAUSED
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {data ? `${data.total} total events` : ''}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}

          <button
            onClick={togglePause}
            disabled={actionLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border ${
              isPaused
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {isPaused ? 'Resume webhooks' : 'Pause webhooks'}
          </button>

          <button
            onClick={purgeLogs}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Purge Logs
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-white/5">
              <th className="text-left pb-2 font-semibold pr-4">Event ID</th>
              <th className="text-left pb-2 font-semibold pr-4">Provider</th>
              <th className="text-left pb-2 font-semibold pr-4">Status</th>
              <th className="text-left pb-2 font-semibold pr-4">Error</th>
              <th className="text-left pb-2 font-semibold">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && !data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5].map((c) => (
                    <td key={c} className="py-2.5 pr-4">
                      <div
                        className="h-3 rounded bg-white/5 animate-pulse"
                        style={{ width: `${60 + c * 10}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : !data || data.logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No webhook events yet.
                </td>
              </tr>
            ) : (
              data.logs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                  <td
                    className="py-2.5 pr-4 font-mono text-gray-400 truncate max-w-[140px]"
                    title={log.eventId ?? log.id}
                  >
                    {log.eventId ?? log.id.slice(0, 12) + '…'}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-300 capitalize">{log.provider}</td>
                  <td className="py-2.5 pr-4">{statusBadge(log.status)}</td>
                  <td
                    className="py-2.5 pr-4 text-red-400 truncate max-w-[160px]"
                    title={log.errorMessage ?? ''}
                  >
                    {log.errorMessage ?? <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-2.5 text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-md bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
          </button>
          <span className="text-[10px] text-gray-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}
