'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { mockNotifications, NotificationItem } from '@/lib/mock-data';
import { toast } from '@autodm/ui';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Sparkles className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-accent-cyan" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm glass-card border-l border-white/5 bg-background/95 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all flex items-start space-x-3 relative group ${
                      item.isRead
                        ? 'bg-white/0 border-white/5 opacity-60'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {/* Alert Icon */}
                    <div className="mt-0.5 flex-shrink-0">{getAlertIcon(item.type)}</div>

                    {/* Alert text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white leading-normal truncate">
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <button
                            onClick={() => markAsRead(item.id)}
                            className="text-[9px] text-primary hover:underline flex-shrink-0 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Check className="h-3 w-3" />
                            <span>Read</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-normal">{item.message}</p>
                      <span className="text-[9px] text-gray-500 block">{item.createdAt}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-gray-500">
                  <Bell className="h-8 w-8 text-gray-600" />
                  <p className="text-xs">All caught up! No notifications.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
