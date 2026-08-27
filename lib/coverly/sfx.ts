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

export function createSample(src: string) {
  let buffer: AudioBuffer | null = null;
  let loading: Promise<void> | null = null;

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
    play(volume = 0.25) {
      if (!isSoundOn()) return;
      const ctx = ensure();
      if (!ctx || !buffer) return;
      if (ctx.state === "suspended") void ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain).connect(ctx.destination);
      source.start();
    },
  };
}
