"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { modeOf, type Design, type Mode } from "@/lib/design/types";
import type { DecisionEntry } from "./editor";

export type Build = {
  id: string;
  name: string;
  mode: Mode;

  at: number;
  design: Design;

  past: Design[];

  decisions: DecisionEntry[];

  costUsd: number;
};

const MAX_BUILDS = 24;
const MAX_PAST = 12;
const MAX_DECISIONS = 40;

type BuildsState = {
  builds: Build[];
  open: boolean;
  togglePanel: () => void;
  closePanel: () => void;

  record: (b: Omit<Build, "at">) => void;
  remove: (id: string) => void;
  clearAll: () => void;
};

export const useBuilds = create<BuildsState>()(
  persist(
    (set, get) => ({
      builds: [],
      open: false,

      togglePanel: () => set({ open: !get().open }),
      closePanel: () => set({ open: false }),

      record: (b) => {
        if (b.design.elements.length === 0) return;
        const entry: Build = {
          ...b,
          at: Date.now(),
          mode: modeOf(b.design),
          past: b.past.slice(-MAX_PAST),
          decisions: b.decisions.slice(0, MAX_DECISIONS),
        };
        const rest = get().builds.filter((x) => x.id !== b.id);
        set({ builds: [entry, ...rest].slice(0, MAX_BUILDS) });
      },

      remove: (id) => set({ builds: get().builds.filter((b) => b.id !== id) }),
      clearAll: () => set({ builds: [] }),
    }),
    {
      name: "speakui:builds",
      version: 1,
      partialize: (s) => ({ builds: s.builds }),
    },
  ),
);
