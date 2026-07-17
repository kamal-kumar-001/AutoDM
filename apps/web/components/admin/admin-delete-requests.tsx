'use client';

import * as React from 'react';
import { apiRequest } from '@/lib/api-client';
import { toast, Button } from '@autodm/ui';
import { Loader2, Trash2, XCircle, AlertTriangle } from 'lucide-react';

interface DeleteRequest {
  id: string;
  reason: string;
  feedback: string | null;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
  };
}

export function AdminDeleteRequests() {
  const [data, setData] = React.useState<{ data: DeleteRequest[]; total: number } | null>(null);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [processing, setProcessing] = React.useState<string | null>(null); // 'approve' | 'reject' | null

  const load = React.useCallback(() => {
    setLoading(true);
    apiRequest<{ data: DeleteRequest[]; total: number }>(
      `/admin/delete-requests?page=${page}&limit=20`,
    )
      .then((r) => {
        setData(r);
        setSelectedIds([]);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && data) {
      setSelectedIds(data.data.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const confirm = window.confirm(
      `CRITICAL WARNING: Are you sure you want to approve deletion for ${selectedIds.length} user account(s)? This will permanently delete all campaigns, connected profiles, and data for these users. This action CANNOT be undone.`,
    );
    if (!confirm) return;

    setProcessing('approve');
    try {
      await apiRequest(`/admin/delete-requests/approve`, {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      toast.success(`Successfully deleted selected user accounts.`);
      load();
    } catch (e) {
      toast.error('Failed to approve delete requests.');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    const confirm = window.confirm(
      `Are you sure you want to reject deletion requests for ${selectedIds.length} users?`,
    );
    if (!confirm) return;

    setProcessing('reject');
    try {
      await apiRequest(`/admin/delete-requests/reject`, {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      toast.success('Successfully rejected selected delete requests.');
      load();
    } catch (e) {
      toast.error('Failed to reject delete requests.');
    } finally {
      setProcessing(null);
    }
  };

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Bulk operations bar */}
      <div className="glass-card border-gradient p-4 rounded-xl shadow-glass flex justify-between items-center">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>{selectedIds.length} selected request(s) for creator deletion.</span>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleBulkReject}
            disabled={selectedIds.length === 0 || !!processing}
            variant="secondary"
            size="sm"
            className="text-xs h-8 cursor-pointer disabled:opacity-30"
          >
            {processing === 'reject' ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <XCircle className="h-3 w-3 mr-1.5" />
            )}
            Reject
          </Button>

          <Button
            onClick={handleBulkApprove}
            disabled={selectedIds.length === 0 || !!processing}
            size="sm"
            className="text-xs h-8 bg-red-500 hover:bg-red-600 border-0 text-white cursor-pointer disabled:opacity-30"
          >
            {processing === 'approve' ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1.5" />
            )}
            Approve Deletion
          </Button>
        </div>
      </div>

      <div className="glass-card border-gradient rounded-xl shadow-glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <span className="text-xs text-gray-400">{total} pending requests</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 text-[10px] uppercase font-bold tracking-wider text-left">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      data !== null &&
                      data.data.length > 0 &&
                      selectedIds.length === data.data.length
                    }
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Creator / User</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Feedback Details</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {data === null || data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No pending deletion requests found.
                  </td>
                </tr>
              ) : (
                data.data.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {row.user?.name || 'No Name'}
                        </span>
                        <span className="text-[10px] text-gray-500">{row.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold">
                        {row.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate" title={row.feedback || ''}>
                      {row.feedback || <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(row.createdAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold uppercase">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.01]">
            <span className="text-[10px] text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-[10px] h-7 cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-[10px] h-7 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
