'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { CampaignsList } from '@/components/dashboard/campaigns-list';
import { ConnectedAccounts } from '@/components/dashboard/connected-accounts';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CampaignWizard } from '@/components/dashboard/campaign-wizard';
import { Button, toast } from '@autodm/ui';
import { UserPlus, FolderPlus, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

export default function DashboardPage() {
  const [accounts, setAccounts] = React.useState<unknown[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [editingCampaignId, setEditingCampaignId] = React.useState<string | null>(null);
  const [campaignsRefreshKey, setCampaignsRefreshKey] = React.useState(0);

  const fetchAccounts = async () => {
    try {
      const tokenRes = await fetch('/api/auth/session');
      const session = await tokenRes.json();
      const jwt = (session as { accessToken?: string })?.accessToken;

      const data = await apiRequest<unknown[]>('/instagram', {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      setAccounts(data || []);
    } catch (error) {
      console.error('Failed to check connected accounts status', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnectAccount = async () => {
    const toastId = toast.loading('Connecting Instagram...', {
      description: 'Requesting Meta authentication gateway...',
    });
    try {
      const tokenRes = await fetch('/api/auth/session');
      const session = await tokenRes.json();
      const jwt = (session as { accessToken?: string })?.accessToken;

      const data = await apiRequest<{ url: string }>('/instagram/connect', {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });

      if (data?.url) {
        toast.success('Redirecting to Meta...', { id: toastId });
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL returned');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to initiate connection';
      toast.error('Connection Failed', {
        id: toastId,
        description: errMsg,
      });
    }
  };

  const handleCreateCampaign = () => {
    if (accounts.length === 0) {
      toast.error('Connect your Instagram channel first before creating campaigns.');
      return;
    }
    setEditingCampaignId(null);
    setIsWizardOpen(true);
  };

  const handleEditCampaign = (id: string) => {
    setEditingCampaignId(id);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setEditingCampaignId(null);
  };

  const handleWizardSuccess = () => {
    fetchAccounts();
    setCampaignsRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Action Header bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-xs text-gray-500">
              Overview of your Meta message automation funnels
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleCreateCampaign}
              size="sm"
              className="text-xs font-bold gap-2 h-9 bg-gradient-to-r from-primary to-accent-cyan hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,187,136,0.3)] text-primary-foreground border-0 cursor-pointer"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Campaign</span>
            </Button>

            <Button
              onClick={handleConnectAccount}
              size="sm"
              variant="secondary"
              className="text-xs font-semibold gap-2 h-9 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Connect IG</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Viewport */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-gray-400">Loading your creator dashboard...</p>
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState onConnect={handleConnectAccount} onCreateCampaign={handleCreateCampaign} />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Row */}
            <StatsGrid />

            {/* Grid charts and lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Line Charts & Campaign list */}
              <div className="lg:col-span-2 space-y-6">
                <AnalyticsChart />
                <CampaignsList key={campaignsRefreshKey} onEditCampaign={handleEditCampaign} />
              </div>

              {/* Right Column: Channels & Activity feeds */}
              <div className="space-y-6 flex flex-col justify-between">
                <ConnectedAccounts />
                <RecentActivity />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Creation Wizard */}
      <CampaignWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onSuccess={handleWizardSuccess}
        editCampaignId={editingCampaignId}
      />
    </DashboardLayout>
  );
}
