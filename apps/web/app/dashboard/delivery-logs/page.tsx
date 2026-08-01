'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { CreatorDeliveryLog } from '@/components/monitoring/creator-delivery-log';

export default function DashboardDeliveryLogsPage() {
  return (
    <DashboardLayout>
      <CreatorDeliveryLog />
    </DashboardLayout>
  );
}
