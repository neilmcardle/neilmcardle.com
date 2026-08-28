"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createSample } from "./sfx";

const LIKES_STORAGE_KEY = "coverly:likes";
const HEART_VOLUME = 0.3;

const heartBeat = createSample("/coverly/heart-beat.mp3");

const EMPTY: ReadonlySet<string> = new Set<string>();
let snapshot: ReadonlySet<string> | null = null;
const listeners = new Set<() => void>();

function read(): ReadonlySet<string> {
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    return new Set<string>(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set<string>();
  }
}

function getSnapshot(): ReadonlySet<string> {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY;
}

function onStorage(e: StorageEvent) {
  if (e.key !== LIKES_STORAGE_KEY) return;
  snapshot = read();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    heartBeat.prime();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function toggleLike(coverId: string) {
  const next = new Set(getSnapshot());
  const adding = !next.has(coverId);
  if (adding) next.add(coverId);
  else next.delete(coverId);
  snapshot = next;
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(next)));
  } catch {}
  if (adding) heartBeat.play(HEART_VOLUME);
  listeners.forEach((l) => l());
}

export function useLikes() {
  const liked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLiked = useCallback((coverId: string) => liked.has(coverId), [liked]);
  return {
    isLiked,
    toggle: toggleLike,
    likeCount: liked.size,
    getLikedIds: () => Array.from(liked),
  };
}

export function getLikedCoversSync(): string[] {
  return Array.from(getSnapshot());
}
