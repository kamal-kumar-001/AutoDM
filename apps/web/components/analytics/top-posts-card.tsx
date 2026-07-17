'use client';

import * as React from 'react';
import { FileImage, MessageCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
interface TopPost {
  mediaId: string;
  totalComments: number;
  repliedComments: number;
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

export function TopPostsCard() {
  const [posts, setPosts] = React.useState<TopPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAuth<TopPost[]>('/analytics/top-posts')
      .then((r) => setPosts(Array.isArray(r) ? r : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const maxComments = posts.length ? Math.max(...posts.map((p) => p.totalComments), 1) : 1;

  return (
    <div className="glass-card border-gradient rounded-xl p-5 shadow-glass space-y-4">
      <div className="flex items-center gap-2">
        <FileImage className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-white">Top Posts</h3>
        <span className="text-[10px] text-gray-500 ml-auto">by comment volume</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-8 rounded bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-center">
          <MessageCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No post data yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => {
            const pct = Math.round((post.repliedComments / Math.max(post.totalComments, 1)) * 100);
            const barW = Math.round((post.totalComments / maxComments) * 100);
            return (
              <div key={post.mediaId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-gray-600 w-4">{i + 1}</span>
                    <span className="text-gray-300 font-mono truncate max-w-[140px]">
                      {post.mediaId.slice(0, 16)}…
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-gray-400">{post.totalComments} comments</span>
                    <span className="text-primary font-bold">{pct}% replied</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan"
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
