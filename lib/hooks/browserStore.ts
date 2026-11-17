"use client";

import { useSyncExternalStore } from "react";

export interface BrowserStore<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
}

interface EventStoreOptions<T> {
  events: readonly string[];
  read: () => T;
  server: T;
  target?: () => EventTarget | null;
  equals?: (a: T, b: T) => boolean;
}

function sameValue<T>(a: T, b: T): boolean {
  return a === b;
}

export function shallowEqualRecord<T>(
  a: Record<string, T> | null,
  b: Record<string, T> | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => a[k] === b[k]);
}

export function eventStore<T>(options: EventStoreOptions<T>): BrowserStore<T> {
  const equals = options.equals ?? sameValue;
  const listeners = new Set<() => void>();
  let cached: T | null = null;
  let loaded = false;

  function target(): EventTarget | null {
    if (typeof window === "undefined") return null;
    return options.target ? options.target() : window;
  }

  function current(): T {
    if (typeof window === "undefined") return options.server;
    if (!loaded) {
      cached = options.read();
      loaded = true;
    }
    return cached as T;
  }

  function refresh(): void {
    if (typeof window === "undefined") return;
    const next = options.read();
    if (loaded && equals(cached as T, next)) return;
    cached = next;
    loaded = true;
    for (const listener of listeners) listener();
  }

  return {
    subscribe(onChange) {
      const node = target();
      const first = listeners.size === 0;
      listeners.add(onChange);
      if (node && first) {
        for (const name of options.events) node.addEventListener(name, refresh);
      }
      return () => {
        listeners.delete(onChange);
        if (node && listeners.size === 0) {
          for (const name of options.events)
            node.removeEventListener(name, refresh);
          loaded = false;
        }
      };
    },
    getSnapshot: current,
    getServerSnapshot: () => options.server,
  };
}

const keyedStores = new Map<string, BrowserStore<unknown>>();

export function keyedEventStore<T>(
  key: string,
  options: EventStoreOptions<T>,
): BrowserStore<T> {
  const existing = keyedStores.get(key);
  if (existing) return existing as BrowserStore<T>;
  const store = eventStore(options);
  keyedStores.set(key, store as BrowserStore<unknown>);
  return store;
}

const clientStore = eventStore<boolean>({
  events: [],
  read: () => true,
  server: false,
});

export function useIsClient(): boolean {
  return useBrowserStore(clientStore);
}

const mediaStores = new Map<string, BrowserStore<boolean>>();

export function mediaQueryStore(
  query: string,
  server: boolean,
): BrowserStore<boolean> {
  const key = `${query}|${server}`;
  const existing = mediaStores.get(key);
  if (existing) return existing;

  const listeners = new Set<() => void>();
  let list: MediaQueryList | null = null;
  let cached = server;
  let loaded = false;

  function matcher(): MediaQueryList | null {
    if (typeof window === "undefined" || !window.matchMedia) return null;
    if (!list) list = window.matchMedia(query);
    return list;
  }

  function current(): boolean {
    const node = matcher();
    if (!node) return server;
    if (!loaded) {
      cached = node.matches;
      loaded = true;
    }
    return cached;
  }

  function onChange(event: MediaQueryListEvent): void {
    if (loaded && cached === event.matches) return;
    cached = event.matches;
    loaded = true;
    for (const listener of listeners) listener();
  }

  const store: BrowserStore<boolean> = {
    subscribe(notify) {
      const node = matcher();
      const first = listeners.size === 0;
      listeners.add(notify);
      if (node && first) node.addEventListener("change", onChange);
      return () => {
        listeners.delete(notify);
        if (node && listeners.size === 0) {
          node.removeEventListener("change", onChange);
          loaded = false;
        }
      };
    },
    getSnapshot: current,
    getServerSnapshot: () => server,
  };

  mediaStores.set(key, store);
  return store;
}

export function useBrowserStore<T>(store: BrowserStore<T>): T {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

export function useMediaQuery(query: string, server = false): boolean {
  return useBrowserStore(mediaQueryStore(query, server));
}
