'use client';

import { DashboardLayout } from '@/components/dashboard/layout';

export default function AutomationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Automations
        </h1>
        <p className="text-gray-400">
          Configure automated responses, keywords, and triggers. In Phase 2, we will integrate Meta
          OAuth here.
        </p>
        <div className="glass-card p-6 rounded-xl border border-white/5">
          <p className="text-sm text-gray-500">
            No automations configured yet. Use the command palette or workspace trigger to create a
            mock campaign.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
