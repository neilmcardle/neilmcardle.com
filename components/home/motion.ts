const KEY = "site-motion";
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
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setMotion(on: boolean) {
  remember(on);
  for (const fn of listeners) fn();
}

export function subscribeMotion(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
