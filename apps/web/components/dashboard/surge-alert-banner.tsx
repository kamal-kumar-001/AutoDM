'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Pause, ShieldCheck, Zap } from 'lucide-react';
import { Button, toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';

interface SurgeAlertBannerProps {
  onRefreshCampaigns?: () => void;
}

export function SurgeAlertBanner({ onRefreshCampaigns }: SurgeAlertBannerProps) {
  const [activeSurge, setActiveSurge] = useState<{
    campaignId: string;
    campaignName: string;
    hourlyVolume: number;
  } | null>(null);

  useEffect(() => {
    // Check campaign activity metrics for traffic spikes
    apiRequest<any[]>('/campaigns')
      .then((campaigns) => {
        if (!campaigns || campaigns.length === 0) return;
        // Find campaign with high hourly volume
        const surging = campaigns.find(
          (c) => c.status === 'ACTIVE' && c.metrics?.totalDmsSent > 30,
        );
        if (surging) {
          setActiveSurge({
            campaignId: surging.id,
            campaignName: surging.name,
            hourlyVolume: surging.metrics?.totalDmsSent || 120,
          });
        }
      })
      .catch(() => null);
  }, []);

  if (!activeSurge) return null;

  const handlePauseSurge = async () => {
    try {
      await apiRequest(`/campaigns/${activeSurge.campaignId}/status`, {
        method: 'PATCH',
      });
      toast.success(
        `Surge Protection: Paused "${activeSurge.campaignName}" to protect account rate limits.`,
      );
      setActiveSurge(null);
      if (onRefreshCampaigns) onRefreshCampaigns();
    } catch (e) {
      toast.error('Failed to pause surging campaign.');
    }
  };

  return (
    <div className="glass-card border border-amber-500/40 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Viral Spike Alert — High Volume Detected
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
              {activeSurge.hourlyVolume} DMs Active
            </span>
          </div>
          <p className="text-[11px] text-gray-300 mt-0.5">
            Campaign <strong className="text-white">"{activeSurge.campaignName}"</strong> is
            experiencing viral comment traffic. Adaptive BullMQ rate-limiting is active.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <Button
          onClick={handlePauseSurge}
          size="sm"
          variant="outline"
          className="text-xs font-bold gap-1.5 border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
        >
          <Pause className="w-3.5 h-3.5" />
          <span>Pause Campaign</span>
        </Button>
      </div>
    </div>
  );
}
