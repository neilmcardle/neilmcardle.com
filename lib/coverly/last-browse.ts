"use client";

import { useSyncExternalStore } from "react";

const KEY = "coverly:last-browse";

export function rememberBrowse(url: string) {
  try {
    sessionStorage.setItem(KEY, url);
  } catch {}
}

export function getLastBrowse(): string {
  try {
    return sessionStorage.getItem(KEY) || "/coverly/browse";
  } catch {
    return "/coverly/browse";
  }
}

const noop = () => () => {};

export function useLastBrowse(): string {
  return useSyncExternalStore(noop, getLastBrowse, () => "/coverly/browse");
}
