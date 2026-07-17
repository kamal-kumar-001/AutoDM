'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Layers,
  Instagram,
  MessageSquare,
  CheckCircle,
  X,
  HelpCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button, Input, Label, toast } from '@autodm/ui';
import { apiRequest, ApiError } from '@/lib/api-client';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCampaignId?: string | null;
}

interface LivePost {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface ConnectedAccount {
  id: string;
  instagramId: string;
  username: string;
  displayName: string | null;
  profilePicture: string | null;
  isConnected: boolean;
}

export function CampaignWizard({
  isOpen,
  onClose,
  onSuccess,
  editCampaignId,
}: CampaignWizardProps) {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // Accounts State
  const [accounts, setAccounts] = React.useState<ConnectedAccount[]>([]);

  // Form State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<'COMMENT_TO_DM' | 'KEYWORD_TO_DM' | 'WELCOME_DM'>(
    'COMMENT_TO_DM',
  );
  const [accountId, setAccountId] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [matchingRule, setMatchingRule] = React.useState<'EXACT' | 'CONTAINS'>('EXACT');
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);
  const [replyMessage, setReplyMessage] = React.useState('');

  // Live posts state
  const [posts, setPosts] = React.useState<LivePost[]>([]);
  const [postsStatus, setPostsStatus] = React.useState<'idle' | 'fetching' | 'cached' | 'error'>(
    'idle',
  );
  const pollRef = React.useRef<NodeJS.Timeout | null>(null);

  interface EditingCampaign {
    name: string;
    description?: string | null;
    type: 'COMMENT_TO_DM' | 'KEYWORD_TO_DM' | 'WELCOME_DM';
    instagramAccountId: string;
    replyMessage: string;
    keywords?: { keyword: string; matchingRule: 'EXACT' | 'CONTAINS' }[];
    posts?: { mediaId: string }[];
  }

  // Load campaign for editing
  React.useEffect(() => {
    if (isOpen && editCampaignId) {
      setLoading(true);
      apiRequest<EditingCampaign>(`/campaigns/${editCampaignId}`)
        .then((camp) => {
          setName(camp.name);
          setDescription(camp.description || '');
          setType(camp.type);
          setAccountId(camp.instagramAccountId);
          setReplyMessage(camp.replyMessage);

          if (camp.keywords && camp.keywords.length > 0) {
            setKeywords(camp.keywords.map((k) => k.keyword).join(', '));
            setMatchingRule(camp.keywords[0].matchingRule);
          } else {
            setKeywords('');
          }

          if (camp.posts && camp.posts.length > 0) {
            setSelectedPostId(camp.posts[0].mediaId);
          } else {
            setSelectedPostId(null);
          }
        })
        .catch(() => toast.error('Failed to load campaign details'))
        .finally(() => setLoading(false));
    } else if (isOpen) {
      setName('');
      setDescription('');
      setType('COMMENT_TO_DM');
      setKeywords('');
      setReplyMessage('');
      setSelectedPostId(null);
      setStep(1);
    }
  }, [isOpen, editCampaignId]);

  // Fetch accounts on open
  React.useEffect(() => {
    if (isOpen) {
      apiRequest<ConnectedAccount[]>('/instagram')
        .then((res) => {
          setAccounts(res || []);
          if (res && res.length > 0) {
            setAccountId(res[0].id);
          }
        })
        .catch(() => setAccounts([]));
    }
  }, [isOpen]);

  const activeAccount = accounts.find((a) => a.id === accountId) || accounts[0];

  // Fetch posts when account changes and type is COMMENT_TO_DM
  const fetchPosts = React.useCallback(async (accId: string, silent = false) => {
    if (!silent) setPostsStatus('fetching');
    try {
      const data = await apiRequest<{ posts: LivePost[]; status: string }>(
        `/instagram/${accId}/posts`,
      );
      setPosts(data.posts || []);
      setPostsStatus(data.status === 'fetching' ? 'fetching' : 'cached');
      return data.status;
    } catch (error) {
      setPosts((sub) => sub || []); // preserve previous posts or default to empty
      setPostsStatus('error');
      return 'error';
    }
  }, []);

  React.useEffect(() => {
    if (type !== 'COMMENT_TO_DM' || !accountId) return;
    setSelectedPostId(null);
    setPosts([]);
    fetchPosts(accountId);
  }, [type, accountId, fetchPosts]);

  // Poll until posts are populated
  React.useEffect(() => {
    if (postsStatus !== 'fetching') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      const status = await fetchPosts(accountId, true);
      if (status !== 'fetching') clearInterval(pollRef.current!);
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [postsStatus, accountId, fetchPosts]);

  // Cleanup on close
  React.useEffect(() => {
    if (!isOpen) {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Please enter a campaign name');
        return;
      }
    }
    if (step === 2) {
      if (type === 'KEYWORD_TO_DM' && !keywords.trim()) {
        toast.error('Please enter trigger keywords');
        return;
      }
      if (type === 'COMMENT_TO_DM' && !selectedPostId) {
        toast.error('Please select a post to monitor comments');
        return;
      }
    }
    if (step === 3) {
      if (!replyMessage.trim()) {
        toast.error('Please compose a reply message template');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleLaunch = async () => {
    setLoading(true);

    try {
      interface CampaignPayload {
        name: string;
        description: string;
        type: string;
        instagramAccountId: string;
        replyMessage: string;
        keywords?: { keyword: string; matchingRule: string }[];
        posts?: { mediaId: string; mediaUrl: string; permalink: string }[];
      }

      const payload: CampaignPayload = {
        name,
        description,
        type,
        instagramAccountId: accountId,
        replyMessage,
      };

      if ((type === 'KEYWORD_TO_DM' || type === 'COMMENT_TO_DM') && keywords.trim()) {
        payload.keywords = keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
          .map((k) => ({
            keyword: k,
            matchingRule,
          }));
      }

      if (type === 'COMMENT_TO_DM' && selectedPostId) {
        const post = posts.find((p) => p.id === selectedPostId);
        payload.posts = [
          {
            mediaId: selectedPostId,
            mediaUrl: post?.mediaUrl || '',
            permalink: post?.permalink || '',
          },
        ];
      }

      if (editCampaignId) {
        await apiRequest(`/campaigns/${editCampaignId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Campaign updated successfully!', {
          description: `Changes for '${name}' are now active.`,
        });
      } else {
        await apiRequest('/campaigns', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Campaign launched successfully!', {
          description: `Automations for '${name}' are now active.`,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to launch campaign', error);
      const errMsg = error instanceof ApiError ? error.message : 'Please check your inputs.';
      toast.error(`Failed to launch campaign: ${errMsg}`);
    } finally {
      setLoading(false);
    }
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

          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="w-full max-w-4xl glass-card border-gradient rounded-2xl shadow-glass z-10 flex flex-col md:flex-row overflow-hidden max-h-[85vh]"
          >
            {/* Left Sidebar Steps Indicator */}
            <div className="md:w-60 bg-white/5 border-r border-white/5 p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center text-white">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Builder
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { s: 1, label: 'Campaign Specs' },
                    { s: 2, label: 'Trigger Settings' },
                    { s: 3, label: 'DM Content' },
                    { s: 4, label: 'Flow & Launch' },
                  ].map((stepItem) => (
                    <div key={stepItem.s} className="flex items-center space-x-3 text-xs">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold transition-all ${
                          step === stepItem.s
                            ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,187,136,0.3)]'
                            : step > stepItem.s
                              ? 'bg-primary/20 text-primary border border-primary/20'
                              : 'bg-white/5 text-gray-500 border border-white/5'
                        }`}
                      >
                        {stepItem.s}
                      </div>
                      <span
                        className={`font-semibold ${step >= stepItem.s ? 'text-white' : 'text-gray-500'}`}
                      >
                        {stepItem.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:block text-[10px] text-gray-500 leading-normal">
                Step-by-step assistant for configuring Instagram DM responses.
              </div>
            </div>

            {/* Right Main Content Pane */}
            <div className="flex-1 flex flex-col justify-between p-6 md:p-8 bg-background/40 overflow-y-auto">
              {/* Header Close button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Steps views wrapper */}
              <div className="flex-1 flex flex-col md:flex-row gap-6 mb-8 items-start">
                {/* Inputs block */}
                <div className="flex-1 space-y-4 w-full">
                  {/* Step 1: Specs */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-white">Campaign Details</h3>
                        <p className="text-xs text-gray-400">
                          Configure name guidelines and automation triggers.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="camp-name">Campaign Name</Label>
                        <Input
                          id="camp-name"
                          placeholder="e.g. Ebook Funnel 'GROW'"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="camp-desc">Description (Optional)</Label>
                        <Input
                          id="camp-desc"
                          placeholder="Automated direct replies for summer ebook promo"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Automation Type</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              id: 'COMMENT_TO_DM',
                              title: 'Comment to DM',
                              desc: 'Monitor post comments',
                            },
                            {
                              id: 'KEYWORD_TO_DM',
                              title: 'Keyword DM',
                              desc: 'Reply to inbox keywords',
                            },
                            {
                              id: 'WELCOME_DM',
                              title: 'Welcome DM',
                              desc: 'Reply to new message threads',
                            },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() =>
                                setType(t.id as 'COMMENT_TO_DM' | 'KEYWORD_TO_DM' | 'WELCOME_DM')
                              }
                              type="button"
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                type === t.id
                                  ? 'bg-primary/10 border-primary text-white shadow-glass'
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              <span className="text-xs font-bold">{t.title}</span>
                              <span className="text-[9px] text-gray-500 mt-1">{t.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Trigger Rules */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-white">Trigger Actions</h3>
                        <p className="text-xs text-gray-400">
                          Map connected account and select target triggers.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="acc-select">Instagram Creator Account</Label>
                        <select
                          id="acc-select"
                          value={accountId}
                          onChange={(e) => setAccountId(e.target.value)}
                          className="custom-select w-full"
                        >
                          {accounts.map((acc) => (
                            <option
                              key={acc.id}
                              value={acc.id}
                              className="bg-background text-white"
                            >
                              @{acc.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Keyword to DM trigger inputs */}
                      {(type === 'KEYWORD_TO_DM' || type === 'COMMENT_TO_DM') && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="keywords-in">
                              Trigger Keywords (comma separated){' '}
                              {type === 'COMMENT_TO_DM' && '(Optional)'}
                            </Label>
                            <Input
                              id="keywords-in"
                              placeholder={
                                type === 'COMMENT_TO_DM'
                                  ? 'e.g. shoes, promo (leave empty for any comment)'
                                  : 'e.g. GROW, START, EBOOK'
                              }
                              value={keywords}
                              onChange={(e) => setKeywords(e.target.value)}
                            />
                            <span className="text-[10px] text-gray-500">
                              Trigger phrase is case-insensitive.
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="match-rule">Matching Strategy</Label>
                            <select
                              id="match-rule"
                              value={matchingRule}
                              onChange={(e) =>
                                setMatchingRule(e.target.value as 'EXACT' | 'CONTAINS')
                              }
                              className="custom-select w-full"
                            >
                              <option value="EXACT" className="bg-background text-white">
                                Exact Match
                              </option>
                              <option value="CONTAINS" className="bg-background text-white">
                                Contains Phrase
                              </option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Comment to DM triggers */}
                      {type === 'COMMENT_TO_DM' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Select Target Post</Label>
                            {postsStatus === 'fetching' && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Loader2 className="h-3 w-3 animate-spin" /> Fetching live posts…
                              </span>
                            )}
                            {postsStatus === 'cached' && posts && posts.length > 0 && (
                              <button
                                type="button"
                                onClick={() => fetchPosts(accountId)}
                                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
                              >
                                <RefreshCw className="h-3 w-3" /> Refresh
                              </button>
                            )}
                          </div>

                          {postsStatus === 'fetching' && (!posts || posts.length === 0) ? (
                            <div className="grid grid-cols-2 gap-3">
                              {[1, 2, 3, 4].map((n) => (
                                <div
                                  key={n}
                                  className="h-20 rounded-xl bg-white/5 border border-white/5 animate-pulse"
                                />
                              ))}
                            </div>
                          ) : posts && posts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {posts.map((post) => (
                                <button
                                  key={post.id}
                                  onClick={() => setSelectedPostId(post.id)}
                                  type="button"
                                  className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                                    selectedPostId === post.id
                                      ? 'bg-primary/10 border-primary text-white'
                                      : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                                  }`}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
                                    {post.mediaUrl ? (
                                      <img
                                        src={post.mediaUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Instagram className="h-4 w-4 m-2 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                                      {post.caption || 'No caption'}
                                    </p>
                                    <span className="text-[8px] text-gray-500 block mt-1">
                                      ❤️ {post.likes} · 💬 {post.comments}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-center text-xs text-gray-400 space-y-2">
                              <Instagram className="h-6 w-6 text-gray-500 mx-auto" />
                              <p>No posts found. Make sure your account is connected.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Welcome DM triggers */}
                      {type === 'WELCOME_DM' && (
                        <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-center text-xs text-gray-400 space-y-2">
                          <HelpCircle className="h-6 w-6 text-gray-500 mx-auto" />
                          <p>
                            Welcome DM triggers execute on every new thread opened with @
                            {activeAccount?.username || 'your account'}. No keywords or post
                            selections required.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Response Message Editor */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-white">DM Content Composer</h3>
                        <p className="text-xs text-gray-400">
                          Compose your auto-reply text template.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reply-composer">Message Text</Label>
                        <textarea
                          id="reply-composer"
                          rows={4}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Hey! Thanks for leaving a comment. Here is the link to access your free guide: https://autodm.com/free-guide"
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-600 resize-none font-sans"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Flow Review */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-white">Flow Verification</h3>
                        <p className="text-xs text-gray-400">
                          Review your campaign automations before enabling.
                        </p>
                      </div>

                      {/* Flow Diagram */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-accent-cyan" />

                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          Automation Loop
                        </div>

                        <div className="flex items-center space-x-2.5 text-xs text-white">
                          <div className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 font-bold flex items-center space-x-1">
                            <Instagram className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {type === 'COMMENT_TO_DM'
                                ? 'Comment'
                                : type === 'KEYWORD_TO_DM'
                                  ? 'Keyword'
                                  : 'New Thread'}
                            </span>
                          </div>

                          <ArrowRight className="h-4 w-4 text-gray-500" />

                          <div className="px-2.5 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/20 font-bold flex items-center space-x-1">
                            <MessageSquare className="h-3.5 w-3.5 text-accent-cyan" />
                            <span>Auto DM</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-400 text-center max-w-xs leading-normal pt-2 border-t border-white/5 w-full">
                          Target Account:{' '}
                          <strong className="text-white">@{activeAccount?.username}</strong>
                          {type === 'KEYWORD_TO_DM' && (
                            <span>
                              <br />
                              Keywords: <strong className="text-white">{keywords}</strong>
                            </span>
                          )}
                          {type === 'COMMENT_TO_DM' && (
                            <span>
                              <br />
                              Post media monitored:{' '}
                              <strong className="text-white">{selectedPostId}</strong>
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-primary flex items-start space-x-2 text-[10px] leading-normal">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>
                          Launching this campaign will immediately listen to live Meta webhooks. You
                          can toggle active status at any time from the automations panel.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right phone preview (Visible in Step 3 and 4) */}
                {(step === 3 || step === 4) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-56 bg-background border border-white/10 rounded-3xl p-3 flex-shrink-0 shadow-2xl relative overflow-hidden"
                  >
                    {/* Simulated Camera notch */}
                    <div className="h-3 w-16 bg-white/10 rounded-full mx-auto mb-2" />

                    {/* Simulated IG header */}
                    <div className="flex items-center space-x-1.5 border-b border-white/5 pb-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-white font-bold text-[8px]">
                        {activeAccount?.profilePicture}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-bold text-white truncate">
                          @{activeAccount?.username}
                        </span>
                        <span className="text-[6px] text-gray-500">Instagram Direct</span>
                      </div>
                    </div>

                    {/* Chat Bubble container */}
                    <div className="h-40 flex flex-col justify-end space-y-2 overflow-y-auto pr-1">
                      {type === 'KEYWORD_TO_DM' && (
                        <div className="self-end bg-white/10 px-2.5 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] text-[8px] text-white">
                          {keywords.split(',')[0] || 'START'}
                        </div>
                      )}

                      <div className="self-start bg-primary text-primary-foreground px-2.5 py-1.5 rounded-2xl rounded-tl-sm max-w-[85%] text-[8px] leading-normal break-words whitespace-pre-line">
                        {replyMessage || 'Type message content to preview...'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Navigation Actions Footer */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                {step > 1 ? (
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    className="text-xs h-9 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Back</span>
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="text-xs h-9 bg-gradient-to-r from-primary to-accent-cyan hover:opacity-90 transition-all text-primary-foreground border-0 shadow-[0_0_12px_rgba(0,187,136,0.2)] cursor-pointer font-bold"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleLaunch}
                    disabled={loading}
                    className="text-xs h-9 bg-gradient-to-r from-primary to-accent-cyan hover:opacity-90 transition-all text-primary-foreground border-0 shadow-[0_0_12px_rgba(0,187,136,0.2)] cursor-pointer font-bold"
                  >
                    {loading
                      ? 'Launching Campaign...'
                      : editCampaignId
                        ? 'Save Changes'
                        : 'Launch Campaign'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
