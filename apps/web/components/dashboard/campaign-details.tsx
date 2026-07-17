'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Play, Pause, Edit, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { Button, toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string | null;
  onEdit: (id: string) => void;
  onStatusToggle: (id: string, currentStatus: string, name: string) => void;
  onArchive: (id: string, name: string) => void;
}

interface CampaignDetail {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  status: string;
  createdAt: string;
  replyMessage: string;
  instagramAccount?: {
    username: string;
    displayName?: string | null;
  } | null;
  keywords?: {
    id: string;
    keyword: string;
    matchingRule: string;
  }[];
  posts?: {
    mediaId: string;
    mediaUrl?: string | null;
    permalink?: string | null;
  }[];
}

export function CampaignDetailsModal({
  isOpen,
  onClose,
  campaignId,
  onEdit,
  onStatusToggle,
  onArchive,
}: CampaignDetailsModalProps) {
  const [campaign, setCampaign] = React.useState<CampaignDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen && campaignId) {
      setLoading(true);
      apiRequest<CampaignDetail>(`/campaigns/${campaignId}`)
        .then((data) => {
          setCampaign(data);
        })
        .catch(() => {
          toast.error('Failed to load campaign details');
          onClose();
        })
        .finally(() => setLoading(false));
    } else {
      setCampaign(null);
    }
  }, [isOpen, campaignId, onClose]);

  const handleToggle = async () => {
    if (!campaign) return;
    const currentStatus = campaign.status;
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    onStatusToggle(campaign.id, currentStatus, campaign.name);
    setCampaign((prev) => (prev ? { ...prev, status: nextStatus } : null));
  };

  const handleArchiveClick = () => {
    if (!campaign) return;
    onArchive(campaign.id, campaign.name);
    onClose();
  };

  const handleEditClick = () => {
    if (!campaign) return;
    onEdit(campaign.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-lg glass-card border-gradient rounded-2xl shadow-glass z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Automation Details
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
              {loading || !campaign ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs text-gray-400">Fetching campaign setup details...</p>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Status Badge & Name */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-extrabold text-white">{campaign.name}</h2>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-bold ${
                          campaign.status === 'ACTIVE'
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-white/5 border-white/10 text-gray-500'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        {campaign.description}
                      </p>
                    )}
                  </div>

                  {/* General Config Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <span className="text-gray-500 block text-[9px] uppercase font-semibold">
                        Channel
                      </span>
                      <span className="text-white font-bold block">
                        @{campaign.instagramAccount?.username || 'instagram_account'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 block text-[9px] uppercase font-semibold">
                        Format Type
                      </span>
                      <span className="text-white font-bold block capitalize">
                        {campaign.type.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 block text-[9px] uppercase font-semibold">
                        Created On
                      </span>
                      <span className="text-white block font-bold">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {campaign.keywords && campaign.keywords.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-gray-500 block text-[9px] uppercase font-semibold">
                          Match Rule
                        </span>
                        <span className="text-white block font-bold uppercase">
                          {campaign.keywords[0].matchingRule}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Keywords section */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">
                      Trigger Keywords
                    </h4>
                    {campaign.keywords && campaign.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {campaign.keywords.map((kw: any) => (
                          <span
                            key={kw.id}
                            className="bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan px-2 py-0.5 rounded-lg font-semibold text-[10px]"
                          >
                            {kw.keyword} ({kw.matchingRule.toLowerCase()})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-500 italic">
                        {campaign.type === 'COMMENT_TO_DM'
                          ? 'No keyword restrictions (triggers on any comment on the post)'
                          : 'No trigger keywords configured'}
                      </div>
                    )}
                  </div>

                  {/* Monitored Post section */}
                  {campaign.posts && campaign.posts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">
                        Monitored Post
                      </h4>
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        {campaign.posts[0].mediaUrl ? (
                          <img
                            src={campaign.posts[0].mediaUrl}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover flex-shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-[10px] text-gray-400 line-clamp-2">
                            Post ID:{' '}
                            <strong className="text-white">{campaign.posts[0].mediaId}</strong>
                          </p>
                          {campaign.posts[0].permalink && (
                            <a
                              href={campaign.posts[0].permalink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] text-primary hover:underline font-bold cursor-pointer inline-block"
                            >
                              View live post
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DM Reply Template bubble mock */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-[10px] uppercase tracking-wider">
                      Auto-Response DM Template
                    </h4>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col space-y-2">
                      <div className="text-[8px] text-gray-500 uppercase font-semibold">
                        Mock Chat Preview
                      </div>
                      <div className="self-start bg-primary text-primary-foreground p-3 rounded-2xl rounded-tl-sm max-w-[85%] font-medium break-words whitespace-pre-line leading-relaxed">
                        {campaign.replyMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {campaign && !loading && (
              <div className="p-5 border-t border-white/5 bg-white/5 flex justify-between items-center gap-3">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleToggle}
                    variant="secondary"
                    size="sm"
                    className="text-xs h-9 cursor-pointer flex items-center gap-1.5"
                  >
                    {campaign.status === 'ACTIVE' ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleEditClick}
                    variant="secondary"
                    size="sm"
                    className="text-xs h-9 cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                </div>

                <Button
                  onClick={handleArchiveClick}
                  variant="secondary"
                  size="sm"
                  className="text-xs h-9 hover:text-red-400 hover:border-red-400/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Archive</span>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
