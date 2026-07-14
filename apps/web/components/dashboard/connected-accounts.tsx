'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, CheckCircle, RefreshCw, LogOut, Link2 } from 'lucide-react';
import { mockAccounts, ConnectedAccount } from '@/lib/mock-data';
import { Button, toast } from '@autodm/ui';

export function ConnectedAccounts() {
  const [accounts, setAccounts] = React.useState<ConnectedAccount[]>(mockAccounts);

  const handleReconnect = (username: string) => {
    toast.success(`Meta connection verified for @${username}`);
  };

  const handleDisconnect = (id: string, username: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast.error(`Disconnected @${username} Instagram channel`);
  };

  return (
    <div className="glass-card border-gradient p-5 rounded-xl shadow-glass flex flex-col space-y-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          <h3 className="text-sm font-semibold text-white">Linked Channels</h3>
        </div>

        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-400 font-medium">
          {accounts.length} Connected
        </span>
      </div>

      {/* Account List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px] custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {accounts.length > 0 ? (
            accounts.map((account, i) => (
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
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0">
                    {account.profilePicture}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      @{account.username}
                    </span>
                    <span className="text-[9px] text-gray-500 truncate">{account.displayName}</span>
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
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <Link2 className="h-10 w-10 text-gray-600 animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">No Linked Channels</p>
                <p className="text-[10px] text-gray-500 max-w-xs px-2">
                  Connect your Instagram Professional accounts to start automation flows.
                </p>
              </div>
              <Button size="sm" className="h-8 text-[10px] font-bold">
                Link account now
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
