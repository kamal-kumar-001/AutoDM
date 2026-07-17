'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { AdminCreators } from '@/components/admin/admin-creators';
import { AdminCampaigns } from '@/components/admin/admin-campaigns';
import { AdminLogs } from '@/components/admin/admin-logs';
import { AdminQueue } from '@/components/admin/admin-queue';
import { AdminFeatureFlags } from '@/components/admin/admin-feature-flags';
import { AdminMonitoring } from '@/components/admin/admin-monitoring';
import { Shield, Users, Layers, FileText, Server, Flag, Activity } from 'lucide-react';
import { cn } from '@autodm/ui';

const TABS = [
  { id: 'creators', label: 'Creators', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Layers },
  { id: 'logs', label: 'Audit Logs', icon: FileText },
  { id: 'queue', label: 'Queue', icon: Server },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = React.useState<TabId>('creators');

  // Client-side role guard
  React.useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if ((session?.user as any)?.role !== 'ADMIN') return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <Shield className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-red-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Full system access — restricted to admins.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {tab === 'creators' && <AdminCreators />}
          {tab === 'campaigns' && <AdminCampaigns />}
          {tab === 'logs' && <AdminLogs />}
          {tab === 'queue' && <AdminQueue />}
          {tab === 'flags' && <AdminFeatureFlags />}
          {tab === 'monitoring' && <AdminMonitoring />}
        </div>
      </div>
    </DashboardLayout>
  );
}
