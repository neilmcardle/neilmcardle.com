import { useEffect, useRef, useState, useCallback } from 'react';

interface AutoSaveOptions {
  interval?: number;
  onSave: () => void;
  enabled?: boolean;
}

interface AutoSaveState {
  lastSaved: Date | null;
  isDirty: boolean;
  isSaving: boolean;
}

export function useAutoSave({ 
  interval = 30000, 
  onSave, 
  enabled = true 
}: AutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isDirty: false,
    isSaving: false,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const markDirty = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: true }));
  }, []);

  const markClean = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date(),
      isSaving: false
    }));
  }, []);

  const triggerSave = useCallback(() => {
    if (state.isDirty && enabled) {
      setState(prev => ({ ...prev, isSaving: true }));
      try {
        onSaveRef.current();
        markClean();
      } catch (error) {
        console.error('Auto-save failed:', error);
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }
  }, [state.isDirty, enabled, markClean]);

  useEffect(() => {
    if (!enabled || !state.isDirty) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerSave();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isDirty, enabled, interval, triggerSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    markDirty,
    markClean,
    triggerSave,
  };
}

export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
