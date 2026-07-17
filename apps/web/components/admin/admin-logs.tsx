'use client';

import * as React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

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
  }, [load]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setActionFilter(actionInput);
    setPage(1);
  };
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 30);

  return (
    <div className="space-y-4">
      <form onSubmit={handleFilter} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            placeholder="Filter by action (e.g. ADMIN_SUSPEND)…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
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
