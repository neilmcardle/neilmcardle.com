"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const cache = new Map<string, string | null>();
const listeners = new Map<string, Set<() => void>>();

function read(key: string): string | null {
  if (!cache.has(key)) {
    try {
      cache.set(key, localStorage.getItem(key));
    } catch {
      cache.set(key, null);
    }
  }
  return cache.get(key) ?? null;
}

function subscribeTo(key: string) {
  return (listener: () => void) => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(listener);
    return () => {
      set?.delete(listener);
    };
  };
}

export function useLocalPref<T>(
  key: string,
  fallback: T,
  parse: (raw: string) => T | null,
): [T, (value: T) => void] {
  const subscribe = useMemo(() => subscribeTo(key), [key]);
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const set = useCallback(
    (value: T) => {
      const serialised = String(value);
      cache.set(key, serialised);
      try {
        localStorage.setItem(key, serialised);
      } catch {}
      listeners.get(key)?.forEach((listener) => listener());
    },
    [key],
  );

  const value = raw === null ? fallback : (parse(raw) ?? fallback);
  return [value, set];
}
