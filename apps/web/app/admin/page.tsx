'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminStatsDashboard } from '@/components/admin/admin-stats-dashboard';
import { AdminCreators } from '@/components/admin/admin-creators';
import { AdminCampaigns } from '@/components/admin/admin-campaigns';
import { AdminDeleteRequests } from '@/components/admin/admin-delete-requests';
import { AdminPlans } from '@/components/admin/admin-plans';
import { AdminLogs } from '@/components/admin/admin-logs';
import { AdminQueue } from '@/components/admin/admin-queue';
import { AdminFeatureFlags } from '@/components/admin/admin-feature-flags';
import { AdminMonitoring } from '@/components/admin/admin-monitoring';
import { AdminPromotions } from '@/components/admin/admin-promotions';
import {
  Users,
  Layers,
  Trash2,
  CreditCard,
  FileText,
  Server,
  Flag,
  Activity,
  BarChart3,
  Megaphone,
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'creators', label: 'Creators', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Layers },
  { id: 'delete-requests', label: 'Delete Requests', icon: Trash2 },
  { id: 'plans', label: 'Billing Plans', icon: CreditCard },
  { id: 'logs', label: 'Audit Logs', icon: FileText },
  { id: 'queue', label: 'Queue', icon: Server },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'promotions', label: 'Promotions', icon: Megaphone },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = React.useState<TabId>('dashboard');

  // Client-side role guard
  React.useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if ((session?.user as any)?.role !== 'ADMIN') return null;

  return (
    <AdminLayout activeTab={tab} setActiveTab={setTab}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight capitalize">
              {tab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-gray-500">
              Manage system-wide {tab.replace('-', ' ')} and parameters.
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {tab === 'dashboard' && <AdminStatsDashboard />}
          {tab === 'creators' && <AdminCreators />}
          {tab === 'campaigns' && <AdminCampaigns />}
          {tab === 'delete-requests' && <AdminDeleteRequests />}
          {tab === 'plans' && <AdminPlans />}
          {tab === 'logs' && <AdminLogs />}
          {tab === 'queue' && <AdminQueue />}
          {tab === 'flags' && <AdminFeatureFlags />}
          {tab === 'monitoring' && <AdminMonitoring />}
          {tab === 'promotions' && <AdminPromotions />}
        </div>
      </div>
    </AdminLayout>
  );
}
