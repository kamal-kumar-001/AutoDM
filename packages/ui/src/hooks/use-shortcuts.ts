'use client';

import { useEffect } from 'react';

export interface ShortcutKey {
  key: string;
  metaOrControl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

export interface ShortcutConfig {
  keyConfig: ShortcutKey;
  callback: () => void;
}

export function useShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true');

      for (const shortcut of shortcuts) {
        const { keyConfig, callback } = shortcut;

        const keyMatch = event.key.toLowerCase() === keyConfig.key.toLowerCase();
        const metaMatch = keyConfig.metaOrControl
          ? event.metaKey || event.ctrlKey
          : !(event.metaKey || event.ctrlKey);
        const altMatch = keyConfig.alt ? event.altKey : !event.altKey;
        const shiftMatch = keyConfig.shift ? event.shiftKey : !event.shiftKey;

        // Cmd+K is allowed to open search command palette even when input is focused
        const isCommandPaletteToggle =
          keyConfig.key.toLowerCase() === 'k' && keyConfig.metaOrControl;

        if (keyMatch && metaMatch && altMatch && shiftMatch) {
          if (!isInputActive || isCommandPaletteToggle) {
            event.preventDefault();
            callback();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
