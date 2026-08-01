'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { WebhookLogs } from '@/components/monitoring/webhook-logs';

export default function DashboardDeliveryLogsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Delivery & Webhook Audit Logs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time execution status, Meta Graph API error trace diagnostics, and Delivery Trace
            IDs for your connected Instagram accounts.
          </p>
        </div>

        <WebhookLogs />
      </div>
    </DashboardLayout>
  );
}
