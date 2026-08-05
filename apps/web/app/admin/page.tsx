'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api-client';
import { toast } from '@autodm/ui';
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
import { AdminSupport } from '@/components/admin/admin-support';
import { WebhookLogs } from '@/components/monitoring/webhook-logs';
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
  LifeBuoy,
  Radio,
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'creators', label: 'Creators', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Layers },
  { id: 'webhooks', label: 'Webhooks Audit', icon: Radio },
  { id: 'delete-requests', label: 'Delete Requests', icon: Trash2 },
  { id: 'plans', label: 'Billing Plans', icon: CreditCard },
  { id: 'logs', label: 'Audit Logs', icon: FileText },
  { id: 'queue', label: 'Queue', icon: Server },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'promotions', label: 'Promotions', icon: Megaphone },
  { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = React.useState<TabId>('dashboard');

  // Client-side role guard
  React.useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
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

  if (session?.user?.role !== 'ADMIN') return null;

  return (
    <AdminLayout activeTab={tab} setActiveTab={setTab}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight capitalize">
              {tab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-gray-500">
              Manage system-wide {tab.replace('-', ' ')} and parameters.
            </p>
          </div>

          {/* 1-Click App Review Mode Trigger */}
          <button
            onClick={async () => {
              try {
                await apiRequest('/admin/enable-app-review-mode', { method: 'POST' });
                toast.success('App Review Mode Active: All plans set to unlimited quotas & all feature flags enabled!');
                setTimeout(() => window.location.reload(), 1500);
              } catch (e) {
                toast.error('Failed to enable App Review Mode');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-accent-cyan text-white text-xs font-black shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer border-0"
            title="Sets all plan quotas to unlimited and enables all feature flags across all plans for Meta App Review"
          >
            <span>🚀 Enable App Review Mode (Unlock All Plans & Flags)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {tab === 'dashboard' && <AdminStatsDashboard />}
          {tab === 'creators' && <AdminCreators />}
          {tab === 'campaigns' && <AdminCampaigns />}
          {tab === 'webhooks' && <WebhookLogs />}
          {tab === 'delete-requests' && <AdminDeleteRequests />}
          {tab === 'plans' && <AdminPlans />}
          {tab === 'logs' && <AdminLogs />}
          {tab === 'queue' && <AdminQueue />}
          {tab === 'flags' && <AdminFeatureFlags />}
          {tab === 'monitoring' && <AdminMonitoring />}
          {tab === 'promotions' && <AdminPromotions />}
          {tab === 'support' && <AdminSupport />}
        </div>
      </div>
    </AdminLayout>
  );
}
