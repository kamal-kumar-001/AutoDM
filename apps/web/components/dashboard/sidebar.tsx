'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquareCode,
  Inbox,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';
import { cn } from '@autodm/ui';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

const navItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, shortcut: '⌥D' },
  { name: 'Automations', href: '/automations', icon: MessageSquareCode, shortcut: '⌥A' },
  { name: 'Inbox', href: '/inbox', icon: Inbox, shortcut: '⌥I' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, shortcut: '⌥L' },
  { name: 'Settings', href: '/settings', icon: Settings, shortcut: '⌥S' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Creator';
  const userRole = session?.user?.role || 'Creator';

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen border-r border-white/5 bg-black/40 backdrop-blur-md sticky top-0 left-0 overflow-hidden select-none"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan shadow-[0_0_15px_rgba(0,187,136,0.3)]">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base font-bold bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent truncate"
            >
              AutoDM
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex items-center w-full px-3 py-2.5 rounded-lg text-sm transition-all group relative overflow-hidden',
                isActive
                  ? 'text-primary font-semibold bg-white/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              {/* Glow Highlight background for active route */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-glow"
                  className="absolute left-0 w-1 h-5 rounded-r bg-primary text-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white',
                )}
              />

              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 flex-1 text-left truncate"
                >
                  {item.name}
                </motion.span>
              )}

              {!collapsed && item.shortcut && (
                <kbd className="hidden group-hover:inline-flex items-center text-[9px] font-mono border border-white/10 bg-black/40 px-1 rounded text-gray-500">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-3 truncate">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-emerald flex-shrink-0 shadow-sm flex items-center justify-center text-primary-foreground font-bold text-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col truncate"
            >
              <span className="text-sm font-medium text-white truncate">{userName}</span>
              <span className="text-[10px] text-gray-500 truncate capitalize">
                {userRole.toLowerCase()}
              </span>
            </motion.div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
}
