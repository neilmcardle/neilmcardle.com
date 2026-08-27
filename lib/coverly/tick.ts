"use client";

import { isSoundOn } from "./sound";

const SRC = "/coverly/tick-pop.mp3";

let context: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;

function ensure() {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  loading ??= fetch(SRC)
    .then((r) => r.arrayBuffer())
    .then((raw) => context!.decodeAudioData(raw))
    .then((decoded) => {
      buffer = decoded;
    })
    .catch(() => {
      buffer = null;
    });
  return context;
}

export function primeTick() {
  ensure();
}

export function playTick(volume = 0.25) {
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
}
