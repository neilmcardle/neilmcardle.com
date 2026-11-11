"use client";

import { isSoundOn } from "./sound";

let context: AudioContext | null = null;

function audioContext() {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!context) {
    const ctx = new Ctor();
    context = ctx;
    const wake = () => {
      if (ctx.state === "suspended") void ctx.resume();
    };
    const activated = (
      navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }
    ).userActivation?.hasBeenActive;
    if (activated) wake();
    window.addEventListener("pointerdown", wake, { capture: true });
    window.addEventListener("keydown", wake, { capture: true });
  }
  return context;
}

export function createSample(
  src: string,
  enabled: () => boolean = isSoundOn,
  {
    gap = 0,
    live = false,
    skip = 0,
  }: { gap?: number; live?: boolean; skip?: number } = {},
) {
  let buffer: AudioBuffer | null = null;
  let loading: Promise<void> | null = null;
  let last: AudioBufferSourceNode | null = null;
  let lastAt = 0;

  const ensure = () => {
    const ctx = audioContext();
    if (!ctx) return null;
    loading ??= fetch(src)
      .then((r) => r.arrayBuffer())
      .then((raw) => ctx.decodeAudioData(raw))
      .then((decoded) => {
        buffer = decoded;
      })
      .catch(() => {
        buffer = null;
      });
    return ctx;
  };

  return {
    prime() {
      ensure();
    },
    unlock() {
      const ctx = ensure();
      if (ctx?.state === "suspended") void ctx.resume();
    },
    play(volume = 0.25, from = skip, wait = 0) {
      if (!enabled()) return;
      const ctx = ensure();
      if (!ctx || !buffer) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
        if (live) return;
      }
      const now = performance.now();
      if (gap && now - lastAt < gap) return;
      lastAt = now;
      if (gap) last?.stop();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      const at = ctx.currentTime + wait;
      if (from) {
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(volume, at + 0.02);
      } else gain.gain.value = volume;
      source.connect(gain).connect(ctx.destination);
      source.start(at, from);
      last = source;
    },
    stop() {
      last?.stop();
      last = null;
    },
  };
}
