"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { eventStore, useBrowserStore } from "@/lib/hooks/browserStore";
import { keys, readLocal, writeLocal } from "../storage/keys";
import { afterMorph, morph } from "../utils/surfaceMorph";

export type AmbientSound =
  | "none"
  | "pink-noise"
  | "rain-light"
  | "rain-medium"
  | "waves"
  | "fire"
  | "train"
  | "custom";

export interface FocusSettings {
  hideChrome: boolean;
  hideToolbar: boolean;
  typewriterMode: boolean;
  paragraphFocus: boolean;
  fullScreen: boolean;
  ambientSound: AmbientSound;
  ambientVolume: number;
}

const DEFAULTS: FocusSettings = {
  hideChrome: true,
  hideToolbar: false,
  typewriterMode: true,
  paragraphFocus: false,
  fullScreen: true,
  ambientSound: "none",
  ambientVolume: 0.3,
};

const storedSettingsStore = eventStore<Partial<FocusSettings> | null>({
  events: [],
  read: () => {
    try {
      const stored = readLocal(keys.focusSettings());
      return stored ? (JSON.parse(stored) as Partial<FocusSettings>) : {};
    } catch {
      return {};
    }
  },
  server: null,
});

export function useFocusMode() {
  const [active, setActive] = useState(false);
  const stored = useBrowserStore(storedSettingsStore);
  const [edited, setEdited] = useState<FocusSettings | null>(null);

  const settings = useMemo<FocusSettings>(
    () => edited ?? { ...DEFAULTS, ...(stored ?? {}) },
    [edited, stored],
  );

  useEffect(() => {
    writeLocal(keys.focusSettings(), JSON.stringify(settings));
  }, [settings]);

  const setSettings = useCallback(
    (next: FocusSettings | ((prev: FocusSettings) => FocusSettings)) => {
      setEdited((prev) => {
        const base = prev ?? { ...DEFAULTS, ...(stored ?? {}) };
        return typeof next === "function" ? next(base) : next;
      });
    },
    [stored],
  );

  const setSetting = useCallback(
    <K extends keyof FocusSettings>(key: K, value: FocusSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings],
  );

  const exitFocusMode = useCallback(() => {
    morph("focus", () => setActive(false));
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleFocusMode = useCallback(() => {
    morph("focus", () => setActive((prev) => !prev));
  }, []);

  useEffect(() => {
    afterMorph(() => {
      if (active && settings.fullScreen) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    });
  }, [active, settings.fullScreen]);

  useEffect(() => {
    function handleFsChange() {
      if (!document.fullscreenElement && settings.fullScreen) {
        setSetting("fullScreen", false);
      }
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, [settings.fullScreen, setSetting]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "f"
      ) {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
      if (e.key === "Escape" && active) {
        const layers =
          '[data-focus-trap], [data-radix-popper-content-wrapper], [role="menu"], [role="dialog"]';
        const fromLayer =
          e.target instanceof Element && e.target.closest(layers) !== null;
        const hasOpenModal = document.querySelector("[data-focus-trap]");
        if (!fromLayer && !hasOpenModal) exitFocusMode();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, toggleFocusMode, exitFocusMode]);

  return { active, settings, setSetting, toggleFocusMode, exitFocusMode };
}
