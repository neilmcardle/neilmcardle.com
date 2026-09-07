const SRC = "/audio/rain-on-me.mp3";
const KEY = "site-rain";
const VOLUME = 0.16;
const FADE_MS = 900;

let el: HTMLAudioElement | null = null;
let fade: number | null = null;
let armed = false;
let wanted = false;
const listeners = new Set<(on: boolean) => void>();

export function motionAllowed() {
  if (typeof window === "undefined") return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stored() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function enabled() {
  return stored() && motionAllowed();
}

function remember(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* private browsing */
  }
}

function announce(on: boolean) {
  for (const fn of listeners) fn(on);
}

function ensure() {
  if (el) return el;
  el = new Audio(SRC);
  el.loop = true;
  el.preload = "none";
  el.volume = 0;
  return el;
}

function ramp(to: number, done?: () => void) {
  const node = ensure();
  if (fade !== null) window.clearInterval(fade);
  const from = node.volume;
  const start = performance.now();
  fade = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / FADE_MS);
    node.volume = from + (to - from) * t;
    if (t === 1) {
      if (fade !== null) window.clearInterval(fade);
      fade = null;
      done?.();
    }
  }, 40);
}

export function isPlaying() {
  return !!el && !el.paused;
}

export function subscribe(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export async function start() {
  wanted = true;
  const node = ensure();
  try {
    await node.play();
    if (!wanted) {
      node.pause();
      return false;
    }
    ramp(VOLUME);
    remember(true);
    announce(true);
    return true;
  } catch {
    remember(true);
    announce(false);
    return false;
  }
}

export function stop() {
  wanted = false;
  if (!el) {
    remember(false);
    announce(false);
    return;
  }
  const node = el;
  ramp(0, () => node.pause());
  remember(false);
  announce(false);
}

export function suspend() {
  wanted = false;
  armed = false;
  if (!el) return;
  const node = el;
  ramp(0, () => node.pause());
}

export async function resume() {
  if (!motionAllowed()) {
    announce(false);
    return;
  }
  if (!stored()) return;
  armFromPreference();
  wanted = true;
  const node = ensure();
  try {
    await node.play();
    if (!wanted) {
      node.pause();
      return;
    }
    ramp(VOLUME);
    announce(true);
  } catch {
    /* blocked until a gesture; the armed listener picks it up */
  }
}

export function armFromPreference() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  if (!stored() || !motionAllowed()) return;

  const events = ["pointerdown", "keydown", "touchend", "click"] as const;
  const go = () => {
    for (const name of events) window.removeEventListener(name, go);
    void start();
  };
  for (const name of events) {
    window.addEventListener(name, go, { once: true });
  }
}
