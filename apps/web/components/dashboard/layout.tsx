'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useShortcuts, toast } from '@autodm/ui';
import { useRouter } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Register global hotkeys
  useShortcuts([
    {
      keyConfig: { key: 'd', alt: true },
      callback: () => {
        router.push('/');
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
        <Header />

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-8 py-8 relative">
          {/* Ambient glows for premium look */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-glow-gradient pointer-events-none opacity-40 z-0" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-mesh-gradient pointer-events-none opacity-30 z-0" />

          <div className="relative z-10 max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
