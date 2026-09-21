import { useEffect, useRef, useState, useCallback } from "react";

interface AutoSaveOptions {
  interval?: number;
  maxWait?: number;
  onSave: () => unknown | Promise<unknown>;
  enabled?: boolean;
}

interface AutoSaveState {
  lastSaved: Date | null;
  isDirty: boolean;
  isSaving: boolean;
  hasFailed: boolean;
}

export function useAutoSave({
  interval = 2000,
  maxWait = 20000,
  onSave,
  enabled = true,
}: AutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isDirty: false,
    isSaving: false,
    hasFailed: false,
  });
  const [attempt, setAttempt] = useState(0);
  const [edits, setEdits] = useState(0);
  const firstDirtyAtRef = useRef(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSaveRef = useRef(onSave);
  const versionRef = useRef(0);
  const failuresRef = useRef(0);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const markDirty = useCallback(() => {
    versionRef.current += 1;
    setEdits((n) => n + 1);
    setState((prev) => {
      if (prev.isDirty) return prev;
      firstDirtyAtRef.current = Date.now();
      return { ...prev, isDirty: true };
    });
  }, []);

  const getVersion = useCallback(() => versionRef.current, []);

  const markClean = useCallback((version?: number) => {
    failuresRef.current = 0;
    if (version !== undefined && version !== versionRef.current) {
      firstDirtyAtRef.current = Date.now();
      setState((prev) => ({
        ...prev,
        lastSaved: new Date(),
        isSaving: false,
        hasFailed: false,
      }));
      setAttempt((a) => a + 1);
      return;
    }
    setState((prev) => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date(),
      isSaving: false,
      hasFailed: false,
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
      setState((prev) => ({ ...prev, hasFailed: true }));
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

    const failures = failuresRef.current;
    const waited = Date.now() - firstDirtyAtRef.current;
    const delay =
      failures > 0
        ? Math.min(120000, 15000 * 2 ** (failures - 1))
        : Math.max(0, Math.min(interval, maxWait - waited));
    timeoutRef.current = setTimeout(() => {
      void triggerSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isDirty, enabled, interval, maxWait, triggerSave, attempt, edits]);

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
