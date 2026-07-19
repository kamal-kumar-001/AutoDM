'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useShortcuts, toast } from '@autodm/ui';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationCenter } from './notification-center';
import {
  LayoutDashboard,
  MessageSquareCode,
  Inbox,
  BarChart3,
  Settings,
  Shield,
  Zap,
  LogOut,
  X,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Creator';
  const userRole = session?.user?.role || 'Creator';
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Automations', href: '/automations', icon: MessageSquareCode },
    { name: 'Inbox', href: '/inbox', icon: Inbox },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  const allNavItems = isAdmin
    ? [...navItems, { name: 'Admin', href: '/admin', icon: Shield }]
    : navItems;

  const navigateTo = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  // Register global hotkeys
  useShortcuts([
    {
      keyConfig: { key: 'd', alt: true },
      callback: () => {
        router.push('/dashboard');
        toast.success('Navigated to Dashboard', { id: 'nav-toast' });
      },
    },
    {
      keyConfig: { key: 'a', alt: true },
      callback: () => {
        router.push('/automations');
        toast.success('Navigated to Automations', { id: 'nav-toast' });
      },
    },
    {
      keyConfig: { key: 'i', alt: true },
      callback: () => {
        router.push('/inbox');
        toast.success('Navigated to Inbox', { id: 'nav-toast' });
      },
    },
    {
      keyConfig: { key: 'l', alt: true },
      callback: () => {
        router.push('/analytics');
        toast.success('Navigated to Analytics', { id: 'nav-toast' });
      },
    },
    {
      keyConfig: { key: 's', alt: true },
      callback: () => {
        router.push('/settings');
        toast.success('Navigated to Settings', { id: 'nav-toast' });
      },
    },
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <Header
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 relative">
          {/* Ambient glows for premium look */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-glow-gradient pointer-events-none opacity-40 z-0" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-mesh-gradient pointer-events-none opacity-30 z-0" />

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="relative z-10 max-w-7xl mx-auto space-y-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Drawer overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            />

            {/* Slide-out Sidebar Drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-64 bg-[#0a0a0c]/95 border-r border-white/5 flex flex-col justify-between h-full p-4 z-10"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan shadow-[0_0_12px_rgba(0,187,136,0.35)]">
                      <Zap className="h-4.5 w-4.5 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-extrabold text-white">AutoDM</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Nav list */}
                <nav className="space-y-1.5">
                  {allNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigateTo(item.href)}
                        className={`flex items-center w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden ${
                          isActive
                            ? 'text-primary bg-white/5'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 w-1 h-4 rounded-r bg-primary shadow-[0_0_8px_#00bb88]" />
                        )}
                        <item.icon
                          className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                        />
                        <span className="ml-3 truncate">{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent-emerald flex items-center justify-center text-primary-foreground font-extrabold text-xs shadow-sm flex-shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-xs font-bold text-white truncate">{userName}</span>
                    <span className="text-[9px] text-gray-500 truncate capitalize">
                      {userRole.toLowerCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
