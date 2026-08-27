"use client";

import { useSyncExternalStore } from "react";

export type TunerField<T> = {
  key: keyof T & string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

export type Tuner<T extends Record<string, number>> = {
  storageKey: string;
  defaults: T;
  get: () => T;
  set: (key: keyof T & string, value: number) => void;
  reset: () => void;
  use: () => T;
  subscribe: (listener: () => void) => () => void;
};

export function createTuner<T extends Record<string, number>>(opts: {
  storageKey: string;
  defaults: T;
}): Tuner<T> {
  const { storageKey, defaults } = opts;
  const listeners = new Set<() => void>();
  let current: T | null = null;

  const read = (): T => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return defaults;
      return { ...defaults, ...(JSON.parse(raw) as Partial<T>) };
    } catch {
      return defaults;
    }
  };

  const get = () => {
    current ??= read();
    return current;
  };

  const emit = () => listeners.forEach((listener) => listener());

  const set = (key: keyof T & string, value: number) => {
    current = { ...get(), [key]: value };
    try {
      localStorage.setItem(storageKey, JSON.stringify(current));
    } catch {}
    emit();
  };

  const reset = () => {
    current = defaults;
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    emit();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const use = () => useSyncExternalStore(subscribe, get, () => defaults);

  return { storageKey, defaults, get, set, reset, use, subscribe };
}
