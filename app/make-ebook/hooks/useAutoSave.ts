import { useEffect, useRef, useState, useCallback } from "react";

interface AutoSaveOptions {
  interval?: number;
  onSave: () => unknown | Promise<unknown>;
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
  enabled = true,
}: AutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isDirty: false,
    isSaving: false,
  });
  const [attempt, setAttempt] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSaveRef = useRef(onSave);
  const versionRef = useRef(0);
  const failuresRef = useRef(0);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const markDirty = useCallback(() => {
    versionRef.current += 1;
    setState((prev) => (prev.isDirty ? prev : { ...prev, isDirty: true }));
  }, []);

  const getVersion = useCallback(() => versionRef.current, []);

  const markClean = useCallback((version?: number) => {
    failuresRef.current = 0;
    if (version !== undefined && version !== versionRef.current) {
      setState((prev) => ({ ...prev, lastSaved: new Date(), isSaving: false }));
      setAttempt((a) => a + 1);
      return;
    }
    setState((prev) => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date(),
      isSaving: false,
    }));
  }, []);

  const triggerSave = useCallback(async () => {
    if (!state.isDirty || !enabled) return;
    setState((prev) => ({ ...prev, isSaving: true }));
    let ok = false;
    try {
      ok = (await onSaveRef.current()) !== false;
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
    if (!ok) {
      failuresRef.current += 1;
      setAttempt((a) => a + 1);
    }
  }, [state.isDirty, enabled]);

  useEffect(() => {
    if (!enabled || !state.isDirty) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const backoff = Math.min(8, 2 ** failuresRef.current);
    timeoutRef.current = setTimeout(() => {
      void triggerSave();
    }, interval * backoff);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isDirty, enabled, interval, triggerSave, attempt]);

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
    getVersion,
    triggerSave,
  };
}

export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
