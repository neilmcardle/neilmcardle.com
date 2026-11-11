"use client";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function shallowEqual<T>(a: T, b: T) {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  )
    return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      Object.is(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
  );
}

export function useStoreSelector<T, S>(
  store: Store<T>,
  selector: (state: T) => S,
  equal: (a: S, b: S) => boolean = Object.is,
): S {
  const cache = useRef<{
    state: T;
    selector: (state: T) => S;
    selected: S;
  } | null>(null);
  const read = useCallback(() => {
    const state = store.get();
    const last = cache.current;
    if (last && Object.is(last.state, state) && last.selector === selector)
      return last.selected;
    const selected = selector(state);
    if (last && equal(last.selected, selected)) {
      cache.current = { state, selector, selected: last.selected };
      return last.selected;
    }
    cache.current = { state, selector, selected };
    return selected;
  }, [store, selector, equal]);
  return useSyncExternalStore(store.subscribe, read, read);
}

export function usePublishedStore<T>(value: T): Store<T> {
  const [store] = useState(() => createStore(value));
  useLayoutEffect(() => {
    store.set(value);
  });
  return store;
}

type AnyFn = (...args: never[]) => unknown;

export function useStableActions<T extends { [K in keyof T]: AnyFn }>(
  actions: T,
): T {
  const latest = useRef(actions);
  useLayoutEffect(() => {
    latest.current = actions;
  });
  const [stable] = useState(() => {
    const out = {} as Record<string, AnyFn>;
    for (const key of Object.keys(actions)) {
      out[key] = (...args: never[]) =>
        (latest.current as Record<string, AnyFn>)[key](...args);
    }
    return out as unknown as T;
  });
  return stable;
}

export function usePort<T extends { [K in keyof T]: AnyFn }>(fallback: T) {
  const handlers = useRef<Partial<T>>({});
  const [port] = useState(() => {
    const out = {} as Record<string, AnyFn>;
    for (const key of Object.keys(fallback)) {
      out[key] = (...args: never[]) => {
        const current = handlers.current as Record<string, AnyFn | undefined>;
        const handler =
          current[key] ?? (fallback as Record<string, AnyFn>)[key];
        return handler(...args);
      };
    }
    return out as unknown as T;
  });
  const connect = useCallback((next: Partial<T>) => {
    handlers.current = { ...handlers.current, ...next };
  }, []);
  return { port, connect };
}
