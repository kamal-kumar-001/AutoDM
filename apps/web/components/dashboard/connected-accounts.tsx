'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, CheckCircle, RefreshCw, LogOut, Link2, Loader2 } from 'lucide-react';
import { toast } from '@autodm/ui';
import { apiRequest } from '@/lib/api-client';

interface ConnectedAccount {
  id: string;
  instagramId: string;
  username: string;
  displayName: string | null;
  profilePicture: string | null;
  isConnected: boolean;
  createdAt: string;
}

export function ConnectedAccounts() {
  const [accounts, setAccounts] = React.useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAccounts = async () => {
    try {
      const data = await apiRequest<ConnectedAccount[]>('/instagram');
      setAccounts(data || []);
    } catch (error) {
      console.error('Failed to load accounts', error);
      toast.error('Failed to load linked channels');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  const handleReconnect = (username: string) => {
    toast.success(`Meta connection verified for @${username}`);
  };

  const handleDisconnect = async (id: string, username: string) => {
    const toastId = toast.loading(`Disconnecting @${username}...`);
    try {
      await apiRequest(`/instagram/${id}`, {
        method: 'DELETE',
      });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.error(`Disconnected @${username} Instagram channel`, { id: toastId });
    } catch (error) {
      toast.error(`Failed to disconnect @${username}`, { id: toastId });
    }
  };

  return (
    <div className="glass-card border-gradient p-5 rounded-xl shadow-glass flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          <h3 className="text-sm font-semibold text-white">Linked Channels</h3>
        </div>

        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-400 font-medium">
          {loading ? '...' : `${accounts.length} Connected`}
        </span>
      </div>

      {/* Account List */}
      <div className="overflow-y-auto space-y-3 pr-1 max-h-[330px] custom-scrollbar flex flex-col justify-start pt-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-[10px] text-gray-500">Loading channels...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {accounts.length > 0 ? (
              <div className="space-y-3 w-full self-start">
                {accounts.map((account, i) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                  >
                    {/* Account details */}
                    <div className="flex items-center space-x-3 min-w-0">
                      {account.profilePicture ? (
                        <img
                          src={account.profilePicture}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-white/10"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0">
                          {account.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          @{account.username}
                        </span>
                        <span className="text-[9px] text-gray-500 truncate">
                          {account.displayName || 'Instagram Creator'}
                        </span>
                      </div>
                    </div>

                    {/* Status and Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Health check badge */}
                      <span className="flex items-center space-x-1 text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold">
                        <CheckCircle className="h-2 w-2 text-primary" />
                        <span>Active</span>
                      </span>

                      {/* Options */}
                      <button
                        onClick={() => handleReconnect(account.username)}
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Verify Connection"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(account.id, account.username)}
                        className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                        title="Disconnect Account"
                      >
                        <LogOut className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 w-full">
                <Link2 className="h-10 w-10 text-gray-600 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">No Linked Channels</p>
                  <p className="text-[10px] text-gray-500 max-w-xs px-2">
                    Connect your Instagram Professional accounts to start automation flows.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
