"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Backend,
  type BrowserName,
  cachedBackend,
  detectBackend,
  detectBrowser,
  downloadBytes,
  voiceModel,
} from "@/lib/voice/model";
import { setPreferredInput } from "@/lib/voice/voice";

export type VoicePhase =
  "checking" | "not_set_up" | "downloading" | "preparing" | "ready" | "error";

type VoiceSetupState = {
  phase: VoicePhase;
  browser: BrowserName;

  backend: Backend;
  progress: { loaded: number; total: number; bytesPerSec: number } | null;
  error: string | null;

  setupOpen: boolean;

  dismissed: boolean;
  soundTestDone: boolean;

  deviceId: string;

  bootstrap: () => Promise<void>;
  download: (backend?: Backend) => Promise<void>;
  openSetup: () => void;
  closeSetup: () => void;
  dismiss: () => void;
  finishSoundTest: () => void;
  chooseInput: (deviceId: string) => void;

  retestMic: () => void;
};

let booted = false;

export const useVoice = create<VoiceSetupState>()(
  persist(
    (set, get) => ({
      phase: "checking",
      browser: "other",
      backend: "wasm",
      progress: null,
      error: null,
      setupOpen: false,
      dismissed: false,
      soundTestDone: false,
      deviceId: "",

      bootstrap: async () => {
        if (booted) return;
        booted = true;
        setPreferredInput(get().deviceId);
        const browser = detectBrowser();
        let backend: Backend = "wasm";
        let cached: Backend | null = null;
        try {
          [backend, cached] = await Promise.all([
            detectBackend(),
            cachedBackend(),
          ]);
        } catch {
          booted = false;
        }
        set({ browser, backend });
        if (!cached) {
          set({ phase: "not_set_up" });
          return;
        }

        set({ phase: "preparing" });
        try {
          await voiceModel.load(cached);
          set({ phase: "ready", backend: cached });
        } catch (err) {
          set({ phase: "error", error: String((err as Error).message ?? err) });
        }
      },

      download: async (choice) => {
        const backend = choice ?? get().backend;
        const total = downloadBytes(backend);
        set({
          phase: "downloading",
          backend,
          error: null,
          progress: { loaded: 0, total, bytesPerSec: 0 },
        });

        let lastT = performance.now();
        let lastLoaded = 0;
        let bps = 0;

        try {
          await voiceModel.load(
            backend,
            ({ loaded }) => {
              const now = performance.now();
              const dt = (now - lastT) / 1000;
              if (dt >= 0.5) {
                const instant = (loaded - lastLoaded) / dt;
                bps = bps ? bps * 0.7 + instant * 0.3 : instant;
                lastT = now;
                lastLoaded = loaded;
              }
              set({ progress: { loaded, total, bytesPerSec: bps } });
            },
            () => set({ phase: "preparing" }),
          );
          set({ phase: "ready", progress: null });
        } catch (err) {
          set({
            phase: "error",
            error: String((err as Error).message ?? err),
            progress: null,
          });
        }
      },

      openSetup: () => set({ setupOpen: true }),
      closeSetup: () => set({ setupOpen: false }),
      dismiss: () => set({ dismissed: true, setupOpen: false }),
      finishSoundTest: () => set({ soundTestDone: true, setupOpen: false }),
      retestMic: () => set({ soundTestDone: false, setupOpen: true }),
      chooseInput: (deviceId) => {
        setPreferredInput(deviceId);
        set({ deviceId });
      },
    }),
    {
      name: "speakui:voice",
      version: 1,
      partialize: (s) => ({
        dismissed: s.dismissed,
        soundTestDone: s.soundTestDone,
        deviceId: s.deviceId,
      }),
    },
  ),
);

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __voice?: typeof useVoice }).__voice = useVoice;
}
