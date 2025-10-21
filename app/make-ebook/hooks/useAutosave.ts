import { useEffect, useRef, useState, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions {
  onSave: () => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutosave({ onSave, debounceMs = 10000, enabled = true }: UseAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    setSaveStatus('idle');
  }, []);

  const save = useCallback(async () => {
    if (saveInProgressRef.current || !enabled) return;
    
    try {
      saveInProgressRef.current = true;
      setSaveStatus('saving');
      await onSave();
      setSaveStatus('saved');
      setIsDirty(false);
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Autosave error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      saveInProgressRef.current = false;
    }
  }, [onSave, enabled]);

  const scheduleSave = useCallback(() => {
    if (!enabled || !isDirty) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      save();
    }, debounceMs);
  }, [save, debounceMs, enabled, isDirty]);

  useEffect(() => {
    if (isDirty && enabled) {
      scheduleSave();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isDirty, enabled, scheduleSave]);

  return {
    saveStatus,
    markDirty,
    save,
    isDirty,
  };
}
