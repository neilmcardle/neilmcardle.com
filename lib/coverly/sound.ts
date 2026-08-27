"use client";

import { useSyncExternalStore } from "react";

const KEY = "coverly:sound";

let enabled: boolean | null = null;
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function isSoundOn(): boolean {
  enabled ??= read();
  return enabled;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleSound() {
  const next = !isSoundOn();
  enabled = next;
  try {
    localStorage.setItem(KEY, next ? "on" : "off");
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribe, isSoundOn, () => true);
}
