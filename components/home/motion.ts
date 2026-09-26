const KEY = "site-motion";
const REDUCE = "(prefers-reduced-motion: reduce)";
const listeners = new Set<() => void>();

function stored() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function remember(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    return;
  }
}

export function motionEnabled() {
  if (typeof window === "undefined") return true;
  const value = stored();
  if (value === "on") return true;
  if (value === "off") return false;
  return !prefersReducedMotion();
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCE).matches;
}

export function subscribeReducedMotion(fn: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", fn);
  return () => query.removeEventListener("change", fn);
}

export function setMotion(on: boolean) {
  remember(on);
  for (const fn of listeners) fn();
}

export function subscribeMotion(fn: () => void) {
  listeners.add(fn);
  const unsubscribe = subscribeReducedMotion(fn);
  return () => {
    listeners.delete(fn);
    unsubscribe();
  };
}
