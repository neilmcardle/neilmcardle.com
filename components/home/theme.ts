const KEY = "site-theme";
const listeners = new Set<() => void>();

export type SiteTheme = "dark" | "light";

export const THEME_SCRIPT = `try{document.documentElement.dataset.siteTheme=localStorage.getItem("${KEY}")==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.siteTheme="light"}`;

export function currentTheme(): SiteTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.siteTheme === "dark"
    ? "dark"
    : "light";
}

function stored(): SiteTheme {
  try {
    return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function remember(next: SiteTheme) {
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    return;
  }
}

function apply(next: SiteTheme) {
  document.documentElement.dataset.siteTheme = next;
  for (const fn of listeners) fn();
}

export function setTheme(next: SiteTheme) {
  remember(next);
  apply(next);
}

export function syncTheme() {
  const next = stored();
  if (next !== currentTheme()) apply(next);
}

export function subscribeTheme(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
