'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { useShortcuts } from '../hooks/use-shortcuts';
import { Dialog, DialogContent } from './dialog';
import { cn } from '../utils';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
  triggerClassName?: string;
}

export function CommandPalette({ items, triggerClassName }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);

  useShortcuts([
    {
      keyConfig: { key: 'k', metaOrControl: true },
      callback: () => setOpen((o) => !o),
    },
  ]);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(search.toLowerCase()),
  );

  React.useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          handleSelect(filteredItems[activeIndex].action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, activeIndex]);

  const handleSelect = (action: () => void) => {
    action();
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center space-x-2 w-full px-3 py-1.5 glass-card border border-white/5 hover:border-white/15 rounded-lg text-sm text-gray-400 hover:text-white transition-all text-left',
          triggerClassName,
        )}
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="flex-1 text-xs">Search dashboard...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-white/15 glass-card !translate-y-[-50%] !translate-x-[-50%]">
          <div className="flex items-center border-b border-white/10 px-4 py-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex h-9 w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none border-none"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No results found.</div>
            ) : (
              filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.action)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors text-left',
                    idx === activeIndex ? 'bg-white/10 text-white font-medium' : 'hover:bg-white/5',
                  )}
                >
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-gray-500 mt-0.5">{item.subtitle}</span>
                    )}
                  </div>
                  {item.shortcut && (
                    <kbd className="h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
