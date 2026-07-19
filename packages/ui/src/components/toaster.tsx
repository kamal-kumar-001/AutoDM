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
            'group-[.toaster]:border-primary/50 group-[.toaster]:bg-primary/[0.08] group-[.toaster]:text-[#00FFBB] shadow-[0_0_15px_rgba(0,187,136,0.15)] font-semibold',
          error:
            'group-[.toaster]:border-red-500/50 group-[.toaster]:bg-red-500/[0.08] group-[.toaster]:text-[#FF6666] shadow-[0_0_15px_rgba(239,68,68,0.15)] font-semibold',
          warning:
            'group-[.toaster]:border-amber-500/50 group-[.toaster]:bg-amber-500/[0.08] group-[.toaster]:text-[#FFCC66] shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold',
          info: 'group-[.toaster]:border-accent-cyan/50 group-[.toaster]:bg-accent-cyan/[0.08] group-[.toaster]:text-[#66E8FF] shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold',
        },
      }}
    />
  );
}
