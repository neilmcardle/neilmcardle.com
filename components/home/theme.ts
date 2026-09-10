const KEY = "site-theme";
const listeners = new Set<() => void>();

export type SiteTheme = "dark" | "light";

export const THEME_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="light")document.documentElement.dataset.siteTheme="light"}catch(e){}`;

export function currentTheme(): SiteTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.siteTheme === "light"
    ? "light"
    : "dark";
}

function stored(): SiteTheme {
  try {
    return window.localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
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
