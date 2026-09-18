"use client";
import { useState, useEffect, useCallback } from "react";

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

const STORAGE_KEY = "makeebook-focus-settings";

export function useFocusMode() {
  const [active, setActive] = useState(false);
  const [settings, setSettings] = useState<FocusSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  function setSetting<K extends keyof FocusSettings>(
    key: K,
    value: FocusSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  const exitFocusMode = useCallback(() => {
    setActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleFocusMode = useCallback(() => {
    setActive((prev) => !prev);
  }, []);

  useEffect(() => {
    if (active && settings.fullScreen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.fullScreen]);

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
        const hasOpenModal = document.querySelector("[data-focus-trap]");
        if (!hasOpenModal) exitFocusMode();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, toggleFocusMode, exitFocusMode]);

  return { active, settings, setSetting, toggleFocusMode, exitFocusMode };
}
