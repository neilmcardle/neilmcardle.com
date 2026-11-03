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
  context ??= new Ctor();
  return context;
}

export function createSample(
  src: string,
  enabled: () => boolean = isSoundOn,
  { gap = 0, live = false }: { gap?: number; live?: boolean } = {},
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
    play(volume = 0.25) {
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
      gain.gain.value = volume;
      source.connect(gain).connect(ctx.destination);
      source.start();
      last = source;
    },
  };
}
