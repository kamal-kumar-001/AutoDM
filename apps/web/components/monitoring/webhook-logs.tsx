'use client';

import * as React from 'react';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PROCESSED: 'bg-primary/10 text-primary border-primary/20',
    PENDING: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
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

  const load = React.useCallback((p: number) => {
    setLoading(true);
    fetchAuth<LogsResponse>(`/monitoring/webhook-logs?page=${p}&limit=15`)
      .then((res) => setData(res && Array.isArray(res.logs) ? res : null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load(page);
  }, [page, load]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Webhook Logs</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {data ? `${data.total} total events` : ''}
          </p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
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
            {loading ? (
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
                  <td className="py-2.5 pr-4 font-mono text-gray-400 truncate max-w-[140px]">
                    {log.eventId ?? log.id.slice(0, 12) + '…'}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-300 capitalize">{log.provider}</td>
                  <td className="py-2.5 pr-4">{statusBadge(log.status)}</td>
                  <td className="py-2.5 pr-4 text-red-400 truncate max-w-[160px]">
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
            className="p-1.5 rounded-md bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
          </button>
          <span className="text-[10px] text-gray-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}
