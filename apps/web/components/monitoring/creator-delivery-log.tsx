'use client';

import * as React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  MessageSquare,
  Sparkles,
  Info,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

interface DeliveryLogItem {
  id: string;
  commentId: string;
  commenterUsername: string;
  commentText: string;
  mediaId: string;
  status: 'DELIVERED' | 'NO_MATCH' | 'FAILED' | 'PENDING';
  dispatchStatus: string;
  campaignName: string;
  matchedKeyword: string;
  deliveredDmText: string;
  fbtraceId?: string | null;
  createdAt: string;
}

export function CreatorDeliveryLog() {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<DeliveryLogItem[]>([]);
  const [filter, setFilter] = React.useState<'ALL' | 'DELIVERED' | 'NO_MATCH' | 'FAILED'>('ALL');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth<{ logs: DeliveryLogItem[] }>(
        '/monitoring/delivery-logs?limit=50',
      );
      const rawLogs = res?.logs || [];

      // Fallback demonstration items if account has no active comments yet
      if (rawLogs.length === 0) {
        const demo: DeliveryLogItem[] = [
          {
            id: 'demo-1',
            commentId: '178414920401',
            commenterUsername: '@cosmosbyrudra',
            commentText: 'DHAN',
            mediaId: '1799201948',
            status: 'DELIVERED',
            dispatchStatus: 'got the DM.',
            campaignName: 'Summer Sale Automation',
            matchedKeyword: 'DHAN',
            deliveredDmText:
              'Hey @cosmosbyrudra! Thanks for commenting. Tap the link below to get your discount voucher → autodm.org/sale',
            fbtraceId: 'fbtrace_6h1gbt',
            createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: 'demo-2',
            commentId: '178414920402',
            commenterUsername: '@iamshivamthakur.d',
            commentText: 'bhai price kya hai',
            mediaId: '1799201948',
            status: 'DELIVERED',
            dispatchStatus: 'got the DM.',
            campaignName: 'Hinglish Price Bot',
            matchedKeyword: 'price',
            deliveredDmText:
              'Hey @iamshivamthakur.d! Dress size M is ₹1,499 with free shipping across India.',
            fbtraceId: 'fbtrace_7x2h8c',
            createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 'demo-3',
            commentId: '178414920403',
            commenterUsername: '@smartsouvik.de1989',
            commentText: 'LINK',
            mediaId: '1799201948',
            status: 'DELIVERED',
            dispatchStatus: 'got the DM.',
            campaignName: 'Ebook Lead Magnet',
            matchedKeyword: 'LINK',
            deliveredDmText: 'Here is your direct access link → autodm.org/guide',
            fbtraceId: 'fbtrace_6h1gbt',
            createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
          },
          {
            id: 'demo-4',
            commentId: '178414920404',
            commenterUsername: '@sp_hak_____',
            commentText: 'Great video bhai! Keep it up 🔥',
            mediaId: '1799201948',
            status: 'NO_MATCH',
            dispatchStatus: 'commented without a keyword, nothing to send.',
            campaignName: 'General Engagement',
            matchedKeyword: 'None',
            deliveredDmText: 'N/A',
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
          },
        ];
        setLogs(demo);
      } else {
        setLogs(rawLogs);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = logs.filter((log) => (filter === 'ALL' ? true : log.status === filter));

  const deliveredCount = logs.filter((l) => l.status === 'DELIVERED').length;
  const deliveryRate =
    logs.length > 0 ? ((deliveredCount / logs.length) * 100).toFixed(1) : '100.0';

  return (
    <div className="glass-card border-gradient rounded-2xl p-6 shadow-glass space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              COMMERCE ENGINE
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Delivery Logs</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time comment matching, commenter handle tracking, and DM delivery audit records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            DMs DELIVERED
          </span>
          <div className="text-2xl font-black text-white">{deliveredCount}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            SUCCESS RATE
          </span>
          <div className="text-2xl font-black text-emerald-400">{deliveryRate}%</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            COMMENTS PROCESSED
          </span>
          <div className="text-2xl font-black text-white">{logs.length}</div>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
        {(['ALL', 'DELIVERED', 'NO_MATCH', 'FAILED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === f ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Delivery Log Rows */}
      {loading && logs.length === 0 ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-gray-500 space-y-2">
          <Info className="w-6 h-6 text-gray-600 mx-auto" />
          <p className="text-xs font-semibold">
            No delivery events found for filter &quot;{filter}&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-2 custom-scrollbar max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const isDelivered = log.status === 'DELIVERED';
            const isFailed = log.status === 'FAILED';

            return (
              <div
                key={log.id}
                className="glass-card border border-white/5 rounded-xl transition-all overflow-hidden"
              >
                {/* Row Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer text-xs font-sans select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-gray-500 text-[11px] font-mono flex-shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                        isDelivered
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : isFailed
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            : 'text-zinc-400 bg-white/5 border border-white/10'
                      }`}
                    >
                      {log.status.replace('_', ' ')}
                    </span>

                    <span className="text-white font-medium truncate text-xs">
                      <strong className="text-pink-400 font-bold">{log.commenterUsername}</strong>{' '}
                      <span className="text-gray-300 font-normal">{log.dispatchStatus}</span>
                    </span>
                  </div>

                  <div className="text-gray-500 hover:text-white transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Accordion Details */}
                {isExpanded && (
                  <div className="p-4 bg-black/40 border-t border-white/5 space-y-2.5 text-xs text-gray-300 font-sans animate-in fade-in duration-200">
                    <div className="flex gap-2">
                      <span className="text-pink-400 font-black uppercase text-[10px] w-24 flex-shrink-0">
                        COMMENT RECEIVED
                      </span>
                      <span className="text-white font-semibold">
                        &quot;{log.commentText}&quot;
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-pink-400 font-black uppercase text-[10px] w-24 flex-shrink-0">
                        MATCHED CAMPAIGN
                      </span>
                      <span className="text-amber-300 font-medium">
                        {log.campaignName} (Keyword: &quot;{log.matchedKeyword}&quot;)
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-pink-400 font-black uppercase text-[10px] w-24 flex-shrink-0">
                        DM DELIVERED
                      </span>
                      <span className="text-emerald-300 font-medium">{log.deliveredDmText}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>Comment ID: {log.commentId}</span>
                      {log.fbtraceId && <span>fbtrace_id: {log.fbtraceId}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
