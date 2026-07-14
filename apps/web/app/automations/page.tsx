'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/layout';
import { CampaignWizard } from '../../components/dashboard/campaign-wizard';
import { mockCampaigns, MockCampaign } from '../../lib/mock-data';
import { Button, Input, toast } from '@autodm/ui';
import {
  Play,
  Pause,
  Copy,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function AutomationsPage() {
  const [campaigns, setCampaigns] = React.useState<MockCampaign[]>(mockCampaigns);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);

  // KPI calculations
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const pausedCampaigns = campaigns.filter((c) => c.status === 'PAUSED').length;

  const handleToggleStatus = (id: string) => {
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

  const handleDuplicate = (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;

    const clone: MockCampaign = {
      ...target,
      id: `c_clone_${Date.now()}`,
      name: `${target.name} (Copy)`,
      status: 'PAUSED',
      triggersCount: 0,
      repliesSent: 0,
      conversionRate: '0%',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCampaigns((prev) => [clone, ...prev]);
    toast.success('Campaign duplicated successfully', {
      description: 'Cloned campaign is paused by default for your review.',
    });
  };

  const handleArchive = (id: string, name: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.error(`Archived campaign '${name}'`, {
      description: 'You can restore archived campaigns from settings.',
    });
  };

  const handleCreateSuccess = () => {
    // Add a mock campaign to the list representing the newly created item
    const newCamp: MockCampaign = {
      id: `c_new_${Date.now()}`,
      name: 'New Funnel Automation',
      type: 'COMMENT_TO_DM',
      status: 'ACTIVE',
      triggersCount: 0,
      repliesSent: 0,
      conversionRate: '0%',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' ? true : c.type === typeFilter;
    return matchesSearch && matchesType;
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Campaign Builder</h1>
            <p className="text-xs text-gray-500">
              Construct message triggers, reply links, and launch DMs
            </p>
          </div>

          <Button
            onClick={() => setIsWizardOpen(true)}
            size="sm"
            className="text-xs font-semibold gap-2 h-9 self-start"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </Button>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Campaigns', val: totalCampaigns, color: 'text-white' },
            { label: 'Active Automations', val: activeCampaigns, color: 'text-primary' },
            { label: 'Paused Review', val: pausedCampaigns, color: 'text-gray-400' },
          ].map((card, i) => (
            <div
              key={i}
              className="glass-card border-gradient p-4 rounded-xl flex items-center justify-between shadow-glass"
            >
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {card.label}
              </span>
              <span className={`text-2xl font-extrabold ${card.color}`}>{card.val}</span>
            </div>
          ))}
        </div>

        {/* Filters and search list */}
        <div className="glass-card border-gradient p-5 rounded-xl shadow-glass space-y-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
              <Input
                placeholder="Search campaigns by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Type filter */}
            <div className="flex items-center space-x-1.5 overflow-x-auto bg-white/5 p-0.5 rounded-lg border border-white/5 self-start">
              {[
                { id: 'ALL', label: 'All Formats' },
                { id: 'COMMENT_TO_DM', label: 'Comment to DM' },
                { id: 'KEYWORD_TO_DM', label: 'Keyword DM' },
                { id: 'WELCOME_DM', label: 'Welcome DM' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md whitespace-nowrap transition-all ${
                    typeFilter === f.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaigns lists */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Campaign core info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <h3 className="text-sm font-extrabold text-white truncate max-w-[250px]">
                          {campaign.name}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-bold tracking-wider ${getCampaignBadgeColor(campaign.type)}`}
                        >
                          {campaign.type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-bold ${
                            campaign.status === 'ACTIVE'
                              ? 'bg-primary/5 border-primary/20 text-primary'
                              : 'bg-white/5 border-white/10 text-gray-500'
                          }`}
                        >
                          {campaign.status.toLowerCase()}
                        </span>
                      </div>

                      {/* Timeline dates and descriptors */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span>Created {campaign.createdAt}</span>
                        </span>

                        <span className="flex items-center space-x-1">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span>
                            Replies: <strong className="text-white">{campaign.repliesSent}</strong>{' '}
                            / {campaign.triggersCount} triggers
                          </span>
                        </span>

                        <span className="text-primary font-bold">
                          {campaign.conversionRate} Conversion
                        </span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full max-w-sm h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full"
                          style={{
                            width: `${Math.min(100, (campaign.repliesSent / Math.max(1, campaign.triggersCount)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Operational trigger buttons */}
                    <div className="flex items-center space-x-2 self-end md:self-auto">
                      {/* Play/Pause */}
                      <button
                        onClick={() => handleToggleStatus(campaign.id)}
                        className={`p-2 rounded-lg border transition-all ${
                          campaign.status === 'ACTIVE'
                            ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={campaign.status === 'ACTIVE' ? 'Pause campaign' : 'Resume campaign'}
                      >
                        {campaign.status === 'ACTIVE' ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 fill-current" />
                        )}
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicate(campaign.id)}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Duplicate Campaign"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {/* Archive */}
                      <button
                        onClick={() => handleArchive(campaign.id, campaign.name)}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-gray-500 hover:text-red-400 hover:bg-white/10 transition-all"
                        title="Archive Campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <AlertCircle className="h-10 w-10 text-gray-600 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">No Automations Configured</p>
                    <p className="text-xs text-gray-500 max-w-sm">
                      Create your first message trigger funnel flow using our step-by-step Campaign
                      Builder wizard.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsWizardOpen(true)}
                    className="text-xs font-semibold h-9"
                  >
                    Create Campaign
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Campaign Builder Multi-Step Wizard Modal */}
      <CampaignWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </DashboardLayout>
  );
}
