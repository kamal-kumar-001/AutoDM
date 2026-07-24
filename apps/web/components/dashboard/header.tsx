'use client';

import * as React from 'react';
import { Breadcrumbs, CommandPalette } from '@autodm/ui';
import { Bell, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export interface HeaderProps {
  onOpenNotifications?: () => void;
  onOpenMobileMenu?: () => void;
  unreadNotificationsCount?: number;
}

export function Header({
  onOpenNotifications,
  onOpenMobileMenu,
  unreadNotificationsCount = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumb items based on current path
  const breadcrumbItems = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      let label = seg.charAt(0).toUpperCase() + seg.slice(1);
      if (seg.toLowerCase() === 'dashboard') label = 'Dashboard';
      if (seg.toLowerCase() === 'settings') label = 'Settings';
      if (seg.toLowerCase() === 'automations') label = 'Automations';
      if (seg.toLowerCase() === 'inbox') label = 'Inbox';
      if (seg.toLowerCase() === 'analytics') label = 'Analytics';
      return { label, href };
    });
  }, [pathname]);

  const commandItems = [
    {
      id: 'dash',
      title: 'Go to Dashboard',
      subtitle: 'Main analytics summary',
      shortcut: '⌥D',
      action: () => router.push('/dashboard'),
    },
    {
      id: 'autos',
      title: 'Go to Automations',
      subtitle: 'Configure DM triggers',
      shortcut: '⌥A',
      action: () => router.push('/automations'),
    },
    {
      id: 'inbox',
      title: 'Go to Inbox',
      subtitle: 'Instagram DM Live Chat',
      shortcut: '⌥I',
      action: () => router.push('/inbox'),
    },
    {
      id: 'analytics',
      title: 'Go to Analytics',
      subtitle: 'Audience growth metrics',
      shortcut: '⌥L',
      action: () => router.push('/analytics'),
    },
    {
      id: 'settings',
      title: 'Go to Settings',
      subtitle: 'Billing and Integrations',
      shortcut: '⌥S',
      action: () => router.push('/settings'),
    },
  ];

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/5 bg-background/50 px-4 md:px-6 backdrop-blur-md z-30">
      {/* Left side mobile menu trigger & breadcrumbs */}
      <div className="flex items-center space-x-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Command Palette */}
        <CommandPalette items={commandItems} />

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-colors relative"
          aria-label="Open Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-black animate-pulse shadow-lg shadow-primary/30">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
