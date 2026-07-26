'use client';

import * as React from 'react';
import { apiRequest } from '@/lib/api-client';
import { toast } from '@autodm/ui';
import { Loader2, Mail, CheckCircle, ShieldAlert } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export function AdminSupport() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await apiRequest<Ticket[]>('/admin/support-tickets');
      setTickets(res || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await apiRequest(`/admin/support-tickets/${id}/resolve`, {
        method: 'PATCH',
      });
      toast.success('Ticket marked as resolved');
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'RESOLVED' as const } : t)),
      );
    } catch (err) {
      toast.error('Failed to resolve support ticket');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-gray-400">Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.length === 0 ? (
        <div className="glass-card border border-white/5 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-gray-500">
            No support tickets have been submitted by creators yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`glass-card border rounded-2xl p-5 md:p-6 transition-all duration-300 ${
                ticket.status === 'RESOLVED'
                  ? 'border-white/5 bg-white/[0.01] opacity-75'
                  : 'border-primary/25 bg-[#0a0f1e]/40 shadow-[0_0_15px_rgba(0,187,136,0.05)]'
              }`}
            >
              {/* Top Row: User Meta & Status */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {ticket.subject}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                        ticket.status === 'RESOLVED'
                          ? 'bg-white/10 text-gray-400'
                          : 'bg-primary/10 border border-primary/20 text-primary animate-pulse'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    From:{' '}
                    <strong className="text-white">
                      {ticket.user.name || 'Creator'} ({ticket.user.email})
                    </strong>{' '}
                    • {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>

                {ticket.status === 'OPEN' && (
                  <button
                    onClick={() => handleResolve(ticket.id)}
                    disabled={resolvingId === ticket.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-black text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {resolvingId === ticket.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Resolve
                  </button>
                )}
              </div>

              {/* Message Content */}
              <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/5">
                <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {ticket.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
