"use client";

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
