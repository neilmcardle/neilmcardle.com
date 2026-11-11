import { useEffect, useReducer, useRef, useCallback } from "react";
import {
  autosave,
  autosaveDelay,
  initialAutosave,
  isSaveOk,
} from "../state/autosave";

interface AutoSaveOptions {
  interval?: number;
  maxWait?: number;
  onSave: () => unknown | Promise<unknown>;
  enabled?: boolean;
}

export function useAutoSave({
  interval = 2000,
  maxWait = 20000,
  onSave,
  enabled = true,
}: AutoSaveOptions) {
  const [state, dispatch] = useReducer(autosave, initialAutosave);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSaveRef = useRef(onSave);
  const versionRef = useRef(0);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const markDirty = useCallback(() => {
    versionRef.current += 1;
    dispatch({ type: "edited", at: Date.now() });
  }, []);

  const getVersion = useCallback(() => versionRef.current, []);

  const markClean = useCallback((version?: number) => {
    dispatch({
      type: "saved",
      at: Date.now(),
      current: version === undefined || version === versionRef.current,
    });
  }, []);

  const triggerSave = useCallback(async () => {
    if (!state.isDirty || !enabled) return;
    dispatch({ type: "saveStarted" });
    let ok = false;
    try {
      ok = isSaveOk(await onSaveRef.current());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
    dispatch({ type: "saveFinished", ok });
  }, [state.isDirty, enabled]);

  const { isDirty, attempt, edits, failures, firstDirtyAt } = state;

  useEffect(() => {
    if (!enabled || !isDirty) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delay = autosaveDelay(
      { failures, firstDirtyAt },
      Date.now(),
      interval,
      maxWait,
    );
    timeoutRef.current = setTimeout(() => {
      void triggerSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, enabled, interval, maxWait, triggerSave, attempt, edits]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    lastSaved: state.lastSaved,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    hasFailed: state.hasFailed,
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
