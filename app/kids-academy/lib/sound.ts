"use client";

const SOUNDS = {
  stepDone: "/kids-academy/sounds/three-tone-sucess.mp3",
  continueTap: "/kids-academy/sounds/bubble-pop.mp3",
  moduleComplete: "/kids-academy/sounds/applause-task-done.mp3",
} as const;

export type SoundKey = keyof typeof SOUNDS;

const STORAGE_KEY = "ka_sound_muted";

export const MUTE_EVENT = "ka-sound-mute-change";
const cache = new Map<SoundKey, HTMLAudioElement>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function isMuted(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (!isBrowser()) return;
  try {
    if (muted) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event(MUTE_EVENT));
}

export function play(key: SoundKey): void {
  if (!isBrowser() || isMuted()) return;
  let audio = cache.get(key);
  if (!audio) {
    audio = new Audio(SOUNDS[key]);
    audio.preload = "auto";
    cache.set(key, audio);
  }
  audio.currentTime = 0;

  audio.play().catch(() => {});
}
