'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:glass-card group-[.toaster]:border-white/10 group-[.toaster]:text-white group-[.toaster]:shadow-glass-glow rounded-xl p-4',
          description: 'group-[.toast]:text-gray-400 text-xs mt-1',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white',
          success:
            'group-[.toaster]:border-primary/40 group-[.toaster]:bg-primary/[0.04] group-[.toaster]:text-primary',
          error:
            'group-[.toaster]:border-red-500/40 group-[.toaster]:bg-red-500/[0.04] group-[.toaster]:text-red-400',
          warning:
            'group-[.toaster]:border-amber-500/40 group-[.toaster]:bg-amber-500/[0.04] group-[.toaster]:text-amber-400',
          info: 'group-[.toaster]:border-accent-cyan/40 group-[.toaster]:bg-accent-cyan/[0.04] group-[.toaster]:text-accent-cyan',
        },
      }}
    />
  );
}
