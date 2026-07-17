'use client';

import * as React from 'react';
import { Search, Loader2, Download, Trash2, Play, Pause } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { toast } from '@autodm/ui';

interface AuditLog {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { email: string; name: string | null } | null;
}

export function AdminLogs() {
  const [data, setData] = React.useState<{ data: AuditLog[]; total: number } | null>(null);
  const [page, setPage] = React.useState(1);
  const [actionFilter, setActionFilter] = React.useState('');
  const [actionInput, setActionInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Advanced Operations State
  const [loggingEnabled, setLoggingEnabled] = React.useState(true);
  const [togglingLog, setTogglingLog] = React.useState(false);
  const [purgeTimeframe, setPurgeTimeframe] = React.useState('30');
  const [purging, setPurging] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const fetchFlag = React.useCallback(async () => {
    try {
      const flags = await apiRequest<any[]>('/admin/flags');
      const logFlag = flags.find((f) => f.key === 'audit_logging');
      if (logFlag) {
        setLoggingEnabled(logFlag.isEnabled);
      }
    } catch (e) {
      // Default to true if not seeded yet
    }
  }, []);

  const load = React.useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page),
      limit: '30',
      ...(actionFilter ? { action: actionFilter } : {}),
    });
    apiRequest<{ data: AuditLog[]; total: number }>(`/admin/logs?${q}`)
      .then((r) => setData(r && Array.isArray(r.data) ? r : null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, actionFilter]);

  React.useEffect(() => {
    load();
    fetchFlag();
  }, [load, fetchFlag]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setActionFilter(actionInput);
    setPage(1);
  };

  const handleToggleLogging = async () => {
    setTogglingLog(true);
    try {
      await apiRequest(`/admin/flags/audit_logging/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: !loggingEnabled }),
      });
      setLoggingEnabled(!loggingEnabled);
      toast.success(`Audit logging ${!loggingEnabled ? 'resumed' : 'paused'} successfully.`);
    } catch (e) {
      toast.error('Failed to toggle logging status');
    } finally {
      setTogglingLog(false);
    }
  };

  const handlePurge = async () => {
    let cutoff: Date;
    let label = '';
    if (purgeTimeframe === '30') {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      label = 'older than 30 days';
    } else if (purgeTimeframe === '90') {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      label = 'older than 90 days';
    } else if (purgeTimeframe === 'all') {
      cutoff = new Date();
      label = 'all time (entire history)';
    } else {
      toast.error('Invalid timeframe selection');
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to permanently delete ${label} audit logs?`,
    );
    if (!confirm) return;

    setPurging(true);
    try {
      const formattedDate = cutoff.toISOString();
      const result = await apiRequest<{ count: number }>(`/admin/logs?olderThan=${formattedDate}`, {
        method: 'DELETE',
      });
      toast.success(`Successfully deleted ${result.count} audit log entries.`);
      setPage(1);
      load();
    } catch (e) {
      toast.error('Failed to purge audit logs');
    } finally {
      setPurging(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const tokenRes = await fetch('/api/auth/session');
      const session = await tokenRes.json();
      const jwt = (session as { accessToken?: string })?.accessToken;

      const q = new URLSearchParams({
        ...(actionFilter ? { action: actionFilter } : {}),
      });

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE_URL}/admin/logs/download?${q}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });

      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Downloaded audit logs CSV');
    } catch (e) {
      toast.error('Failed to export audit logs');
    } finally {
      setDownloading(false);
    }
  };

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 30);

  return (
    <div className="space-y-6">
      {/* Operations Panel */}
      <div className="glass-card border-gradient p-4 rounded-xl shadow-glass flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Toggle logging */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleLogging}
            disabled={togglingLog}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              loggingEnabled
                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
            }`}
          >
            {togglingLog ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : loggingEnabled ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span>{loggingEnabled ? 'Pause Logging' : 'Resume Logging'}</span>
          </button>
          <span className="text-[10px] text-gray-500">
            {loggingEnabled ? 'Currently recording all actions.' : 'Logging is temporarily paused.'}
          </span>
        </div>

        {/* Purge & Download */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Purge timeframe select */}
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg p-1.5">
            <span className="text-[10px] text-gray-400 pl-1">Purge:</span>
            <select
              value={purgeTimeframe}
              onChange={(e) => setPurgeTimeframe(e.target.value)}
              className="custom-select !h-8 !py-0 !pl-2 pr-8"
            >
              <option value="30" className="bg-zinc-900 text-white">
                Older than 30 days
              </option>
              <option value="90" className="bg-zinc-900 text-white">
                Older than 90 days
              </option>
              <option value="all" className="bg-zinc-900 text-white">
                All time
              </option>
            </select>
            <button
              onClick={handlePurge}
              disabled={purging}
              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50"
              title="Purge logs matching timeframe"
            >
              {purging ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Download CSV */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleFilter} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            placeholder="Filter by action (e.g. CAMPAIGN_CREATE)…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
        >
          Filter
        </button>
      </form>

      <div className="glass-card border-gradient rounded-xl shadow-glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <span className="text-xs text-gray-400">{total} log entries</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                {['User', 'Action', 'Details', 'IP', 'Time'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-3 rounded bg-white/5 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                data.data.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-gray-300">
                      {log.user?.email ?? <span className="text-gray-600">system</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 font-mono text-[9px] text-gray-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 truncate max-w-[200px]">
                      {log.details ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-mono">{log.ipAddress ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3 border-t border-white/5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Prev
            </button>
            <span className="text-xs text-gray-500">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
