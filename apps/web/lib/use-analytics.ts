'use client';

import * as React from 'react';
import { apiRequest } from '@/lib/api-client';

export interface AnalyticsSummary {
  totalComments: number;
  totalDmsSent: number;
  successRate: number;
  activeCampaigns: number;
  failedDms: number;
}

export interface ChartDataPoint {
  date: string;
  comments: number;
  messages: number;
}

export interface ActivityItem {
  type: 'comment' | 'dm';
  id: string;
  label: string;
  detail: string;
  success: boolean;
  ts: string;
}

export function useAnalyticsSummary() {
  const [data, setData] = React.useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchSummary = async () => {
    try {
      const res = await apiRequest<AnalyticsSummary>('/analytics/summary');
      setData(res);
    } catch (error) {
      console.error('Failed to load summary analytics', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSummary();
  }, []);

  return { data, loading, refetch: fetchSummary };
}

export function useAnalyticsChart() {
  const [data, setData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await apiRequest<ChartDataPoint[]>('/analytics/chart');
        setData(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Failed to load chart analytics', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
  }, []);

  return { data, loading };
}

export function useRecentActivity() {
  const [data, setData] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const res = await apiRequest<ActivityItem[]>('/analytics/activity');
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to load recent activities', error);
      setData([]);
    }
  }, []);

  React.useEffect(() => {
    load().finally(() => setLoading(false));

    // Auto-refresh every 30 s
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  return { data, loading, refetch: load };
}
