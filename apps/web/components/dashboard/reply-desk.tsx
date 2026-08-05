'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  MessageSquare,
  Tag,
  DollarSign,
  Truck,
  Box,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button, toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';

interface BuyerQueryItem {
  id: string;
  commentId: string;
  mediaId: string;
  text: string;
  username: string;
  userId: string;
  category: 'PRICE' | 'SHIPPING' | 'AVAILABILITY' | 'GENERAL';
  intentScore: number;
  suggestedReply: string;
  isReplied: boolean;
  createdAt: string;
  account: {
    id: string;
    username: string;
  };
}

export function ReplyDesk() {
  const [queries, setQueries] = useState<BuyerQueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [customReplyMap, setCustomReplyMap] = useState<Record<string, string>>({});

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<BuyerQueryItem[]>('/instagram/reply-desk');
      setQueries(data || []);
    } catch (e) {
      console.error('Failed to load Reply Desk queries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleSendReply = async (query: BuyerQueryItem) => {
    const textToSend = customReplyMap[query.id] || query.suggestedReply;
    if (!textToSend.trim()) return;

    setReplyingId(query.id);
    try {
      await apiRequest(`/instagram/reply-desk/${query.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyText: textToSend }),
      });
      toast.success(`1-Click Smart Reply sent to @${query.username}! 🚀`);
      setQueries((prev) => prev.map((q) => (q.id === query.id ? { ...q, isReplied: true } : q)));
    } catch (e) {
      toast.error('Failed to dispatch reply message.');
    } finally {
      setReplyingId(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'PRICE':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Price Inquiry
          </span>
        );
      case 'SHIPPING':
        return (
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" /> Shipping & Delivery
          </span>
        );
      case 'AVAILABILITY':
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
            <Box className="w-3 h-3" /> Stock & Size
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">
            <Tag className="w-3 h-3" /> High-Intent Buyer
          </span>
        );
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (filterCategory === 'UNREPLIED') return !q.isReplied;
    if (filterCategory === 'REPLIED') return q.isReplied;
    if (filterCategory !== 'ALL') return q.category === filterCategory;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card border-gradient p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Reply Desk — AI Buyer Query Classifier
            </h3>
          </div>
          <p className="text-xs text-gray-400 max-w-xl">
            Automatically parses repetitive comment noise to surface high-intent prospective buyers
            asking about prices, shipping, and availability with 1-click Smart Replies.
          </p>
        </div>

        <Button
          onClick={fetchQueries}
          variant="secondary"
          size="sm"
          disabled={loading}
          className="text-xs font-bold gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        {['ALL', 'UNREPLIED', 'PRICE', 'SHIPPING', 'AVAILABILITY', 'REPLIED'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat === 'ALL'
              ? `All Buyers (${queries.length})`
              : cat === 'UNREPLIED'
                ? `Pending (${queries.filter((q) => !q.isReplied).length})`
                : cat}
          </button>
        ))}
      </div>

      {/* Buyer Feed List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs text-gray-500">Parsing buyer queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="glass-card border-gradient p-10 rounded-2xl text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No buyer queries found</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            High-intent buyer comments asking for prices, shipping, or availability will
            automatically appear here with AI Smart Reply suggestions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQueries.map((q) => (
            <div
              key={q.id}
              className={`glass-card border-gradient p-5 rounded-2xl space-y-3 transition-all ${
                q.isReplied ? 'opacity-65 bg-white/[0.01]' : 'bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-bold text-white font-mono">@{q.username}</span>
                  <span className="text-[10px] text-gray-500">via @{q.account.username}</span>
                  {getCategoryBadge(q.category)}
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                  <span>Buyer Intent: {q.intentScore}%</span>
                  <span>•</span>
                  <span>
                    {new Date(q.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <div className="p-3 rounded-xl bg-white/5 text-xs text-gray-200 font-medium leading-relaxed">
                "{q.text}"
              </div>

              {/* AI Smart Reply Generator & Dispatch */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Smart Reply Suggestion
                  </span>
                  {q.isReplied && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Replied
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customReplyMap[q.id] ?? q.suggestedReply}
                    onChange={(e) =>
                      setCustomReplyMap((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    disabled={q.isReplied || replyingId === q.id}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 font-sans"
                  />
                  <Button
                    onClick={() => handleSendReply(q)}
                    disabled={q.isReplied || replyingId === q.id}
                    className="text-xs font-bold gap-1.5 bg-primary hover:bg-primary-hover text-white flex-shrink-0"
                  >
                    {replyingId === q.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{q.isReplied ? 'Replied' : '1-Click Reply'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
