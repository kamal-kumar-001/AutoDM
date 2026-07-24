'use client';

import * as React from 'react';
import { Search, Loader2, UserX, UserCheck, Crown } from 'lucide-react';
import { toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';
import { CustomSelect } from '../ui/custom-select';

interface Creator {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
  subscription: { plan: string; status: string } | null;
  _count: { campaigns: number; instagramAccounts: number };
}

const PLAN_COLORS: Record<string, string> = {
  FREE: 'text-gray-400 bg-white/5 border-white/10',
  PRO: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
  ENTERPRISE: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

export function AdminCreators() {
  const [data, setData] = React.useState<{ data: Creator[]; total: number } | null>(null);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState<string | null>(null);
  const [editingCreator, setEditingCreator] = React.useState<Creator | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');

  const load = React.useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(search ? { search } : {}),
    });
    apiRequest<{ data: Creator[]; total: number }>(`/admin/creators?${q}`)
      .then((r) => setData(r && Array.isArray(r.data) ? r : null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const suspend = async (id: string) => {
    setActing(id);
    try {
      await apiRequest(`/admin/creators/${id}/suspend`, { method: 'POST' });
      toast.success('User suspended');
      load();
    } catch {
      toast.error('Failed to suspend user');
    } finally {
      setActing(null);
    }
  };

  const unsuspend = async (id: string) => {
    setActing(id);
    try {
      await apiRequest(`/admin/creators/${id}/unsuspend`, { method: 'POST' });
      toast.success('User unsuspended');
      load();
    } catch {
      toast.error('Failed to unsuspend user');
    } finally {
      setActing(null);
    }
  };

  const handleStartEditPlan = (creator: Creator) => {
    setEditingCreator(creator);
    setSelectedPlan((creator.subscription?.plan as any) || 'FREE');
  };

  const savePlanOverride = async () => {
    if (!editingCreator) return;
    setActing(editingCreator.id);

    const toastId = toast.loading(
      `Overriding subscription for @${editingCreator.name || 'creator'}...`,
    );
    try {
      await apiRequest(`/admin/creators/${editingCreator.id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan: selectedPlan }),
      });
      toast.success('Subscription plan modified successfully', { id: toastId });
      setEditingCreator(null);
      load();
    } catch (err) {
      toast.error('Failed to override subscription plan', { id: toastId });
    } finally {
      setActing(null);
    }
  };

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="glass-card border-gradient rounded-xl shadow-glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <span className="text-xs text-gray-400">{total} creators</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                {['User', 'Plan', 'Campaigns', 'Accounts', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-3 rounded bg-white/5 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                    No creators found.
                  </td>
                </tr>
              ) : (
                data.data.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-white font-medium">{u.name ?? '—'}</p>
                        <p className="text-gray-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${PLAN_COLORS[u.subscription?.plan ?? 'FREE']}`}
                      >
                        {u.subscription?.plan ?? 'FREE'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{u._count.campaigns}</td>
                    <td className="px-5 py-3 text-gray-400">{u._count.instagramAccounts}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => suspend(u.id)}
                          disabled={acting === u.id}
                          title="Suspend"
                          className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                        >
                          {acting === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={() => unsuspend(u.id)}
                          disabled={acting === u.id}
                          title="Unsuspend"
                          className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                        >
                          <UserCheck className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleStartEditPlan(u)}
                          disabled={acting === u.id}
                          title="Override Plan"
                          className="p-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                        >
                          <Crown className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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
      {/* Plan Override Modal */}
      {editingCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingCreator(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />
          <div className="w-full max-w-sm glass-card border-gradient p-5 rounded-xl shadow-glass z-10 space-y-4 font-sans">
            <h3 className="text-sm font-extrabold text-white">
              Override Subscription: @{editingCreator.name || editingCreator.email.split('@')[0]}
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Select Billing Plan
              </label>
              <CustomSelect
                value={selectedPlan}
                onChange={(val) => setSelectedPlan(val as 'FREE' | 'PRO' | 'ENTERPRISE')}
                options={[
                  { value: 'FREE', label: 'FREE (1 Campaign, 100 DMs)' },
                  { value: 'PRO', label: 'PRO (10 Campaigns, 5k DMs)' },
                  { value: 'ENTERPRISE', label: 'ENTERPRISE (Unlimited)' },
                ]}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
              <button
                onClick={() => setEditingCreator(null)}
                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={savePlanOverride}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
