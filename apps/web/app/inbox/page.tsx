'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button, Input, Label, toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';

interface Conversation {
  recipientId: string;
  lastMessage: string;
  updatedAt: string;
  instagramAccountId: string;
  instagramAccountUsername: string;
  unreadCount: number;
}

interface Message {
  id: string;
  recipientId: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  errorMessage: string | null;
  createdAt: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all conversation threads
  const fetchConversations = async () => {
    try {
      const data = await apiRequest<Conversation[]>('/instagram/conversations');
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch message history for selected conversation
  const fetchMessages = async (recipientId: string, showLoading = false) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const data = await apiRequest<Message[]>(`/instagram/conversations/${recipientId}/messages`);
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages', err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  // Send manual message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRecipientId) return;

    const selectedConv = conversations.find((c) => c.recipientId === selectedRecipientId);
    if (!selectedConv) return;

    setSendingMessage(true);
    const messageContent = inputText;
    setInputText('');

    try {
      await apiRequest(`/instagram/conversations/${selectedRecipientId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          instagramAccountId: selectedConv.instagramAccountId,
          text: messageContent,
        }),
      });

      // Fetch messages immediately to update the list
      await fetchMessages(selectedRecipientId);
      // Refresh conversations list to update last message preview
      await fetchConversations();
    } catch (err) {
      toast.error('Failed to deliver message');
      setInputText(messageContent); // Restore text on failure
    } finally {
      setSendingMessage(false);
    }
  };

  // Load conversations once on mount
  useEffect(() => {
    fetchConversations();
    // Poll conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll messages every 4 seconds when a conversation is active
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    if (selectedRecipientId) {
      fetchMessages(selectedRecipientId, true);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedRecipientId, false);
      }, 4000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedRecipientId]);

  // Scroll to bottom when message list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations by search query
  const filteredConversations = conversations.filter(
    (c) =>
      c.recipientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instagramAccountUsername.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeConversation = conversations.find((c) => c.recipientId === selectedRecipientId);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
            Live Inbox
          </h1>
          <p className="text-xs text-gray-400">
            Real-time chat threads with customers, leads, and automated keywords matching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Left Column: Conversations List */}
          <div className="md:col-span-4 flex flex-col glass-card rounded-xl border border-white/5 overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full h-9 pl-8 pr-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loadingConversations ? (
                <div className="p-4 text-center text-xs text-gray-500">Loading threads...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No active threads found.
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = c.recipientId === selectedRecipientId;
                  return (
                    <button
                      key={c.recipientId}
                      onClick={() => setSelectedRecipientId(c.recipientId)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 text-left transition-colors ${
                        isActive ? 'bg-white/5 border-l-2 border-primary' : ''
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold text-white text-xs border border-white/10 shrink-0">
                        {c.recipientId.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate block">
                            ID: {c.recipientId}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(c.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{c.lastMessage}</p>
                        <span className="inline-block bg-white/5 text-[9px] text-primary px-1.5 py-0.5 rounded border border-primary/20 mt-1">
                          @{c.instagramAccountUsername}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Middle Column: Chat Window */}
          <div className="md:col-span-8 flex flex-col glass-card rounded-xl border border-white/5 overflow-hidden">
            {selectedRecipientId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs border border-white/10">
                      {selectedRecipientId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Recipient ID: {selectedRecipientId}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Connected through page: @{activeConversation?.instagramAccountUsername}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Automation Active
                    </span>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">
                      Loading chat history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <p className="text-xs text-gray-500">
                        No message logs recorded for this user yet.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isIncoming = msg.direction === 'INCOMING';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%] space-y-1`}>
                            <div
                              className={`p-3 rounded-xl text-xs leading-relaxed ${
                                isIncoming
                                  ? 'bg-zinc-800 text-white rounded-tl-none border border-white/5'
                                  : 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <div
                              className={`flex items-center gap-1 text-[9px] text-gray-500 px-1 ${
                                isIncoming ? 'justify-start' : 'justify-end'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {!isIncoming && (
                                <span
                                  className={
                                    msg.status === 'FAILED' ? 'text-rose-500' : 'text-primary'
                                  }
                                >
                                  • {msg.status.toLowerCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Footer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInputText(e.target.value)
                    }
                    className="flex-1 bg-white/5 border-white/10 text-white text-xs h-10 placeholder-gray-500 focus:outline-none"
                    disabled={sendingMessage}
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-xs h-10 px-4 shrink-0"
                    disabled={sendingMessage || !inputText.trim()}
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-black/10">
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">No Conversation Selected</h3>
                <p className="text-[11px] text-gray-500 max-w-[280px] mt-1">
                  Select a user thread from the sidebar to inspect logs and send direct replies.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
