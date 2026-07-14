'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layers, Play, Pause, AlertCircle, Sparkles } from 'lucide-react';
import { mockCampaigns, MockCampaign } from '@/lib/mock-data';
import { Input, toast } from '@autodm/ui';

export function CampaignsList() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [campaigns, setCampaigns] = React.useState<MockCampaign[]>(mockCampaigns);

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          toast.success(
            `Campaign ${nextStatus === 'ACTIVE' ? 'activated' : 'paused'} successfully`,
          );
          return { ...c, status: nextStatus };
        }
        return c;
      }),
    );
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCampaignBadgeColor = (type: string) => {
    switch (type) {
      case 'COMMENT_TO_DM':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'KEYWORD_TO_DM':
        return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="glass-card border-gradient p-5 rounded-xl shadow-glass flex flex-col space-y-4 h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-white">Active Automations</h3>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
          {(['ALL', 'ACTIVE', 'PAUSED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
                statusFilter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
        <Input
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Campaign List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px] custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-4"
              >
                {/* Info block */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                      {campaign.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[8px] font-semibold ${getCampaignBadgeColor(campaign.type)}`}
                    >
                      {campaign.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Reply progress indicators */}
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>
                      Replies: <strong className="text-white">{campaign.repliesSent}</strong>
                      <span className="text-gray-500"> / {campaign.triggersCount} triggers</span>
                    </span>
                    <span className="flex items-center space-x-0.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{campaign.conversionRate} conv.</span>
                    </span>
                  </div>

                  {/* Simple indicator bar */}
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full"
                      style={{
                        width: `${Math.min(100, (campaign.repliesSent / Math.max(1, campaign.triggersCount)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions toggles */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCampaignStatus(campaign.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      campaign.status === 'ACTIVE'
                        ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                    title={campaign.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    {campaign.status === 'ACTIVE' ? (
                      <Pause className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <p className="text-xs text-gray-400">No campaigns found matching criteria.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
