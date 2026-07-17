'use client';

import * as React from 'react';
import { Breadcrumbs, CommandPalette } from '@autodm/ui';
import { Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export interface HeaderProps {
  onOpenNotifications?: () => void;
}

export function Header({ onOpenNotifications }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumb items based on current path
  const breadcrumbItems = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      const isActive = idx === segments.length - 1;
      return { label, href, active: isActive };
    });
  }, [pathname]);

  // Mock items for command palette
  const commandItems = React.useMemo(
    () => [
      {
        id: 'dash',
        title: 'Go to Dashboard',
        subtitle: 'Main analytics summary',
        shortcut: '⌥D',
        action: () => router.push('/'),
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
        id: 'settings',
        title: 'Go to Settings',
        subtitle: 'Billing and Integrations',
        shortcut: '⌥S',
        action: () => router.push('/settings'),
      },
    ],
    [router],
  );

  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* Command Palette */}
        <CommandPalette items={commandItems} />

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-colors relative"
          aria-label="Open Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary text-glow" />
        </button>
      </div>
    </header>
  );
}
