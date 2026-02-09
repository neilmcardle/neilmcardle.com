import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ 
  shortcuts, 
  enabled = true 
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs (except for save/export)
    const target = e.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;

    for (const shortcut of shortcuts) {
      const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
      const isCtrlOrMetaPressed = e.ctrlKey || e.metaKey;
      
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const modifierMatch = ctrlOrMeta ? isCtrlOrMetaPressed : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (keyMatch && modifierMatch && shiftMatch && altMatch) {
        // Allow save, export, and find-replace shortcuts even in input fields
        if (isInputField && !['s', 'e', 'h'].includes(shortcut.key.toLowerCase())) {
          continue;
        }
        
        e.preventDefault();
        e.stopPropagation();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for the ebook editor
export function useEditorShortcuts({
  onSave,
  onExport,
  onPreview,
  onNewChapter,
  onFindReplace,
  enabled = true,
}: {
  onSave: () => void;
  onExport: () => void;
  onPreview: () => void;
  onNewChapter?: () => void;
  onFindReplace?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      meta: true,
      action: onSave,
      description: 'Save book',
    },
    {
      key: 'e',
      meta: true,
      shift: true,
      action: onExport,
      description: 'Export as EPUB',
    },
    {
      key: 'p',
      meta: true,
      action: onPreview,
      description: 'Toggle preview',
    },
  ];

  if (onNewChapter) {
    shortcuts.push({
      key: 'n',
      meta: true,
      shift: true,
      action: onNewChapter,
      description: 'New chapter',
    });
  }

  if (onFindReplace) {
    shortcuts.push({
      key: 'h',
      meta: true,
      action: onFindReplace,
      description: 'Find & Replace',
    });
  }

  useKeyboardShortcuts({ shortcuts, enabled });

  return shortcuts;
}
