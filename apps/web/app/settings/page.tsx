'use client';

import { DashboardLayout } from '@/components/dashboard/layout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400">
          Manage system configurations, billing schedules, and access control.
        </p>
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <p className="text-sm text-gray-500">
            Settings panel details will load here once user authentication is linked.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
