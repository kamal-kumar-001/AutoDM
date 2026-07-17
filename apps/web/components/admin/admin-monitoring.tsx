'use client';

import * as React from 'react';
import { HealthPanel } from '@/components/monitoring/health-panel';
import { QueueHealth } from '@/components/monitoring/queue-health';
import { WebhookLogs } from '@/components/monitoring/webhook-logs';
import { FailedJobs } from '@/components/monitoring/failed-jobs';
import { SystemMetricsPanel } from '@/components/monitoring/system-metrics';

export function AdminMonitoring() {
  return (
    <div className="space-y-8">
      {/* Row 1: Health + System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthPanel />
        <SystemMetricsPanel />
      </div>

      {/* Row 2: Queue Health */}
      <QueueHealth />

      {/* Row 3: Failed Jobs + Webhook Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FailedJobs />
        <WebhookLogs />
      </div>
    </div>
  );
}
