'use client';

import * as React from 'react';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Trash2,
  ShieldAlert,
  Copy,
  ExternalLink,
  Info,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@autodm/ui';
import { fetchWithAuth } from '@/lib/api-client';

export interface WebhookLog {
  id: string;
  eventId: string | null;
  provider: string;
  commentId: string | null;
  username: string | null;
  senderId: string | null;
  status: string;
  errorMessage: string | null;
  fbtraceId: string | null;
  payload: any;
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
    <span
      className={
        'px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ' + cls
      }
    >
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
  const [deleteTimeframe, setDeleteTimeframe] = React.useState<string>('all');
  const [selectedLog, setSelectedLog] = React.useState<WebhookLog | null>(null);

  const load = React.useCallback((p: number) => {
    setLoading(true);
    fetchWithAuth<LogsResponse>('/monitoring/webhook-logs?page=' + p + '&limit=15')
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
    const toastId = toast.loading((isPaused ? 'Resuming' : 'Pausing') + ' webhooks...');
    try {
      const res = await fetchWithAuth<{ paused: boolean }>('/monitoring/webhook-status', {
        method: 'POST',
        body: JSON.stringify({ paused: !isPaused }),
      });
      setIsPaused(res.paused);
      toast.success('Webhooks ' + (res.paused ? 'paused' : 'resumed') + ' successfully', {
        id: toastId,
      });
      load(page);
    } catch (e) {
      toast.error('Failed to change webhook status', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const purgeLogs = async () => {
    const confirmText =
      deleteTimeframe === 'all'
        ? 'Are you sure you want to delete ALL webhook logs?'
        : 'Delete webhook logs older than ' + deleteTimeframe + '?';

    if (!confirm(confirmText)) return;

    setActionLoading(true);
    const toastId = toast.loading('Deleting webhook logs...');
    try {
      const res = await fetchWithAuth<{ count: number }>(
        '/monitoring/webhook-logs?olderThan=' + deleteTimeframe,
        { method: 'DELETE' },
      );
      toast.success('Deleted ' + res.count + ' webhook logs (' + deleteTimeframe + ')', {
        id: toastId,
      });
      setPage(1);
      load(1);
    } catch (e) {
      toast.error('Failed to delete webhook logs', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(label + ' copied to clipboard!');
  };

  return (
    <div className="glass-card border-gradient rounded-2xl p-6 shadow-glass space-y-5">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="text-base font-extrabold text-white">Webhook Audit & Failure Logs</h3>
            {isPaused && (
              <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse">
                PAUSED
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Live execution status, Meta error codes, and fbtrace_id correlation table.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Webhook Logs Button */}
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Refresh Webhook Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={togglePause}
            disabled={actionLoading}
            className={
              isPaused
                ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                : 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-gray-400" />
            )}
            {isPaused ? 'Resume Webhooks' : 'Pause Webhooks'}
          </button>

          {/* Timeframe Purge Selector */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 space-x-1">
            <select
              value={deleteTimeframe}
              onChange={(e) => setDeleteTimeframe(e.target.value)}
              className="bg-transparent text-xs text-gray-300 font-semibold px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Logs
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
              onClick={purgeLogs}
              disabled={actionLoading}
              title="Delete selected logs"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* 2. Webhook Log Table */}
      <div className="overflow-x-auto scrollbar-none rounded-xl border border-white/5">
        <table className="w-full text-xs border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-white/[0.02] text-gray-400 border-b border-white/5 text-[10px] font-black uppercase tracking-wider">
              <th className="text-left py-3 px-4">Time</th>
              <th className="text-left py-3 px-4">Comment ID</th>
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Send Status</th>
              <th className="text-left py-3 px-4">Error Diagnostic</th>
              <th className="text-left py-3 px-4">fbtrace_id</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {loading && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <td key={c} className="py-3 px-4">
                      <div className="h-3.5 rounded bg-white/5 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !data || data.logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 space-y-2">
                  <Info className="w-6 h-6 text-gray-600 mx-auto" />
                  <p className="text-xs font-semibold">No webhook events recorded yet.</p>
                </td>
              </tr>
            ) : (
              data.logs.map((log) => {
                const isDevModeError =
                  log.errorMessage?.includes('Meta Dev Mode Restriction') ||
                  log.errorMessage?.includes('(#200)');

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Time */}
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                      <span className="block text-[9px] text-gray-600">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Comment ID */}
                    <td className="py-3 px-4 font-mono text-gray-300 text-[11px] whitespace-nowrap">
                      {log.commentId ? (
                        <span className="text-primary font-semibold">{log.commentId}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* User */}
                    <td className="py-3 px-4 font-semibold text-gray-200 whitespace-nowrap">
                      {log.username ? (
                        <span className="text-white font-bold">@{log.username}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Send Status */}
                    <td className="py-3 px-4 whitespace-nowrap">{statusBadge(log.status)}</td>

                    {/* Error */}
                    <td className="py-3 px-4 max-w-[260px]">
                      {log.errorMessage ? (
                        <div className="space-y-0.5">
                          <p
                            className={
                              isDevModeError
                                ? 'text-[11px] font-medium truncate text-amber-300 font-semibold'
                                : 'text-[11px] font-medium truncate text-red-400'
                            }
                          >
                            {log.errorMessage}
                          </p>
                          {isDevModeError && (
                            <span className="text-[9px] text-amber-400/80 block font-bold uppercase tracking-wider">
                              💡 Fix: Add user to Meta Developer App Roles
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-400/80 font-mono text-[11px]">
                          ✓ Delivered
                        </span>
                      )}
                    </td>

                    {/* fbtrace_id */}
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                      {log.fbtraceId ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded font-mono text-[10px]">
                            {log.fbtraceId}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(log.fbtraceId!, 'fbtrace_id');
                            }}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-1 text-xs text-gray-300 font-semibold"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-gray-400 font-mono">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({data?.total} events)
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-1 text-xs text-gray-300 font-semibold"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4. Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-extrabold text-white">Webhook Audit Inspector</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-sans font-bold">
                  Comment ID
                </span>
                <span className="text-primary font-bold">{selectedLog.commentId || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-sans font-bold">
                  User
                </span>
                <span className="text-white font-bold">@{selectedLog.username || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-sans font-bold">
                  Send Status
                </span>
                <div className="mt-1">{statusBadge(selectedLog.status)}</div>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-sans font-bold">
                  fbtrace_id
                </span>
                <span className="text-cyan-300 font-bold">{selectedLog.fbtraceId || '—'}</span>
              </div>
            </div>

            {/* Diagnostic Box */}
            {selectedLog.errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400 block">
                  Error Trace Diagnostic
                </span>
                <p className="text-xs text-red-200 leading-relaxed font-mono">
                  {selectedLog.errorMessage}
                </p>
                {selectedLog.errorMessage.includes('(#230)') && (
                  <div className="pt-2 border-t border-red-500/20 text-[11px] text-amber-300 leading-relaxed font-sans">
                    <strong>Why Meta Error (#230) Happens:</strong> Meta returned a permission error
                    because your connected Access Token lacks <code>pages_messaging</code> or{' '}
                    <code>instagram_manage_messages</code> permission scope. Re-connect your
                    Instagram Account in Settings and ensure all Page permission checkboxes are
                    selected during Meta OAuth login.
                  </div>
                )}
                {selectedLog.errorMessage.includes('(#200)') && (
                  <div className="pt-2 border-t border-red-500/20 text-[11px] text-amber-300 leading-relaxed font-sans">
                    <strong>Why Meta Error (#200) Happens:</strong> Your Meta App is in{' '}
                    <strong>Development Mode</strong>. Meta Graph API blocks outgoing DMs to users
                    who are not registered as Developers, Admins, or Testers in your Meta App
                    Dashboard under <em>App Roles</em>.
                  </div>
                )}
              </div>
            )}

            {/* Raw Payload JSON */}
            {selectedLog.payload && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Raw Webhook Payload
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(selectedLog.payload, null, 2), 'Raw payload')
                    }
                    className="text-[10px] text-primary flex items-center gap-1 font-mono hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Copy JSON
                  </button>
                </div>
                <pre className="bg-black/60 border border-white/10 rounded-xl p-3.5 text-[11px] text-cyan-300/90 font-mono overflow-x-auto max-h-48 scrollbar-thin">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
