'use client';

import * as React from 'react';
import { Hash, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
interface TopKeyword {
  keyword: string;
  matchingRule: string;
  campaignName: string;
  triggerCount: number;
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
  return res.json();
}

const ruleColors: Record<string, string> = {
  EXACT: 'bg-primary/10 text-primary border-primary/20',
  CONTAINS: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
  STARTS_WITH: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
};

export function TopKeywordsCard() {
  const [keywords, setKeywords] = React.useState<TopKeyword[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAuth<TopKeyword[]>('/analytics/top-keywords')
      .then((r) => setKeywords(Array.isArray(r) ? r : []))
      .catch(() => setKeywords([]))
      .finally(() => setLoading(false));
  }, []);

  const maxTriggers = keywords.length ? Math.max(...keywords.map((k) => k.triggerCount), 1) : 1;

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-accent-cyan" />
        <h3 className="text-sm font-bold text-white">Top Keywords</h3>
        <span className="text-[10px] text-gray-500 ml-auto">by trigger count</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-9 rounded bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <div className="py-8 text-center">
          <Hash className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No keyword data yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keywords.map((kw, i) => {
            const barW = Math.round((kw.triggerCount / maxTriggers) * 100);
            const ruleClass =
              ruleColors[kw.matchingRule] ?? 'bg-white/10 text-gray-400 border-white/10';
            return (
              <div key={`${kw.keyword}-${i}`} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-gray-600 w-4">{i + 1}</span>
                    <span className="font-bold text-white text-xs">#{kw.keyword}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[8px] font-semibold ${ruleClass}`}
                    >
                      {kw.matchingRule}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-500 truncate max-w-[80px]">
                      {kw.campaignName}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-accent-cyan">
                      <Zap className="h-3 w-3" />
                      {kw.triggerCount}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-primary"
                    style={{ width: `${barW}%`, transition: 'width 0.8s ease' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
