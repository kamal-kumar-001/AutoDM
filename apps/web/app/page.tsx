'use client';

import * as React from 'react';
import { DashboardLayout } from '../components/dashboard/layout';
import { StatsGrid } from '../components/dashboard/stats-grid';
import { AnalyticsChart } from '../components/dashboard/analytics-chart';
import { CampaignsList } from '../components/dashboard/campaigns-list';
import { ConnectedAccounts } from '../components/dashboard/connected-accounts';
import { RecentActivity } from '../components/dashboard/recent-activity';
import { EmptyState } from '../components/dashboard/empty-state';
import { NotificationCenter } from '../components/dashboard/notification-center';
import { Button, toast } from '@autodm/ui';
import { Bell, UserPlus, FolderPlus, Eye, EyeOff } from 'lucide-react';

export default function DashboardPage() {
  const [isEmpty, setIsEmpty] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const handleConnectAccount = () => {
    toast.success('Connecting Instagram...', {
      description: 'Redirecting to Meta authentication gateway.',
    });
  };

  const handleCreateCampaign = () => {
    toast.success('Opening creator wizard...', {
      description: 'Setup comment filters and automated direct replies.',
    });
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
            {/* Demo Toggle showing empty states */}
            <button
              onClick={() => setIsEmpty(!isEmpty)}
              className="p-2 rounded-lg border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-semibold"
              title={isEmpty ? 'Show Live Analytics Preview' : 'Show Empty State Preview'}
            >
              {isEmpty ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{isEmpty ? 'View Live' : 'View Empty'}</span>
            </button>

            {/* Notification bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-lg border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-all relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </button>

            <Button
              onClick={handleConnectAccount}
              size="sm"
              className="text-xs font-semibold gap-2 h-9"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Connect IG</span>
            </Button>

            <Button
              onClick={handleCreateCampaign}
              size="sm"
              variant="secondary"
              className="text-xs font-semibold gap-2 h-9"
            >
              <FolderPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Campaign</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Viewport */}
        {isEmpty ? (
          <EmptyState onConnect={handleConnectAccount} onCreateCampaign={handleCreateCampaign} />
        ) : (
          <div className="space-y-6">
            {/* Stats Row */}
            <StatsGrid />

            {/* Grid charts and lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Line Charts & Campaign list */}
              <div className="lg:col-span-2 space-y-6">
                <AnalyticsChart />
                <CampaignsList />
              </div>

              {/* Right Column: Channels & Activity feeds */}
              <div className="space-y-6">
                <ConnectedAccounts />
                <RecentActivity />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </DashboardLayout>
  );
}
