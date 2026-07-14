'use client';

import { DashboardLayout } from '@/components/dashboard/layout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-gray-400">
          Track conversion rates, user engagement, and trigger frequency metrics.
        </p>
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <p className="text-sm text-gray-500">
            Analytics reports will generate automatically upon tracking live triggers.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
