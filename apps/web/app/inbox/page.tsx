'use client';

import { DashboardLayout } from '@/components/dashboard/layout';

export default function InboxPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Live Inbox
        </h1>
        <p className="text-gray-400">
          Manage user direct messages in real time with automated fallback control.
        </p>
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <p className="text-sm text-gray-500">
            Live chat messages will appear here once Instagram integration is completed.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
