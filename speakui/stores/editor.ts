"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyDesign } from "@/lib/design/catalog";
import {
  modeOf,
  type Design,
  type Mode,
  type PointerTarget,
} from "@/lib/design/types";
import { useBuilds } from "./builds";
import type { EvalMeta, EvalResult } from "@/lib/engine/evaluate";

export type DecisionEntry = EvalResult & {
  id: string;
  at: number;

  version: number | null;
};

type EditorState = {
  buildId: string | null;
  committed: Design;
  past: Design[];
  future: Design[];
  version: number;
  lastAddedId: string | null;

  preview: EvalResult | null;

  flash: { ids: string[]; key: number };

  pointerMode: boolean;
  hover: PointerTarget | null;
  locked: PointerTarget | null;

  decisions: DecisionEntry[];

  demoLimit: string | null;
  panelOpen: boolean;

  usage: {
    calls: number;
    costUsd: number;
    inputTokens: number;
    totalMs: number;
  };
  lastMeta: EvalMeta | null;
  livePreview: boolean;

  commit: (result: EvalResult) => void;
  log: (result: EvalResult) => void;
  setPreview: (result: EvalResult | null) => void;
  undo: () => void;
  redo: () => void;

  reset: (mode?: Mode) => void;

  save: () => void;

  loadBuild: (id: string) => void;
  setHover: (t: PointerTarget | null) => void;
  toggleLock: () => void;

  lockOn: (t: PointerTarget) => void;
  clearTarget: () => void;
  togglePointer: () => void;
  togglePanel: () => void;
  recordUsage: (meta: EvalMeta | null) => void;
  toggleLivePreview: () => void;
};

const HISTORY_LIMIT = 100;
let entryCounter = 0;

export const selectTarget = (s: EditorState): PointerTarget | null => s.locked;

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => ({
      buildId: null,
      committed: emptyDesign(),
      past: [],
      future: [],
      version: 0,
      lastAddedId: null,
      preview: null,
      flash: { ids: [], key: 0 },
      pointerMode: true,
      hover: null,
      locked: null,
      decisions: [],
      demoLimit: null,
      panelOpen: true,
      usage: { calls: 0, costUsd: 0, inputTokens: 0, totalMs: 0 },
      lastMeta: null,
      livePreview: true,

      commit: (result) => {
        const s = get();
        if (result.command === "undo") return (s.undo(), s.log(result));
        if (result.command === "redo") return (s.redo(), s.log(result));
        if (result.command === "clear") {
          set({
            past: [...s.past, s.committed].slice(-HISTORY_LIMIT),
            future: [],
            committed: emptyDesign(result.commandMode ?? modeOf(s.committed)),
            version: s.version + 1,
            lastAddedId: null,
            locked: null,
            hover: null,
            preview: null,
          });
          return s.log(result);
        }
        if (result.status !== "applied") {
          set({ preview: null });
          return s.log(result);
        }
        set({
          past: [...s.past, s.committed].slice(-HISTORY_LIMIT),
          future: [],
          committed: result.design,
          version: s.version + 1,
          lastAddedId: result.lastAddedId,
          preview: null,
          flash: { ids: result.changed, key: s.flash.key + 1 },

          locked:
            s.locked?.type === "element" &&
            !result.design.elements.some(
              (e) => e.id === (s.locked as { id: string }).id,
            )
              ? null
              : s.locked,
        });
        get().log(result);
      },

      log: (result) => {
        const s = get();
        if (result.limit)
          set({
            demoLimit: result.error ?? "This demo has reached its limit.",
          });
        const changed = result.status === "applied";
        entryCounter += 1;
        const entry: DecisionEntry = {
          ...result,
          id: `${Date.now()}-${entryCounter}`,
          at: Date.now(),
          version: changed ? s.version : null,
        };
        set({ decisions: [entry, ...s.decisions].slice(0, 50) });

        get().save();
      },

      setPreview: (preview) => set({ preview }),

      undo: () => {
        const s = get();
        const prev = s.past.at(-1);
        if (!prev) return;
        set({
          past: s.past.slice(0, -1),
          future: [s.committed, ...s.future],
          committed: prev,
          version: s.version + 1,
          preview: null,
        });
      },

      redo: () => {
        const s = get();
        const next = s.future[0];
        if (!next) return;
        set({
          past: [...s.past, s.committed],
          future: s.future.slice(1),
          committed: next,
          version: s.version + 1,
          preview: null,
        });
      },

      save: () => {
        const s = get();
        if (!s.committed.elements.length) return;

        const id = s.buildId ?? `b${Date.now().toString(36)}`;
        if (!s.buildId) set({ buildId: id });
        useBuilds.getState().record({
          id,
          name: s.committed.name,
          mode: modeOf(s.committed),
          design: s.committed,
          past: s.past,
          decisions: s.decisions,
          costUsd: s.usage.costUsd,
        });
      },

      loadBuild: (id) => {
        const build = useBuilds.getState().builds.find((b) => b.id === id);
        if (!build) return;
        set({
          buildId: build.id,
          committed: build.design,
          past: build.past,
          future: [],
          version: get().version + 1,
          decisions: build.decisions,
          lastAddedId: null,
          preview: null,
          locked: null,
          hover: null,
          flash: { ids: [], key: get().flash.key + 1 },
        });
        useBuilds.getState().closePanel();
      },

      reset: (mode) => {
        const s = get();
        s.save();
        set({
          buildId: null,
          decisions: [],
          past: s.committed.elements.length
            ? [...s.past, s.committed].slice(-HISTORY_LIMIT)
            : s.past,
          future: [],
          committed: emptyDesign(mode ?? modeOf(s.committed)),
          version: s.version + 1,
          lastAddedId: null,
          locked: null,
          hover: null,
          preview: null,
        });
      },

      setHover: (hover) => {
        const cur = get().hover;
        if (JSON.stringify(cur) !== JSON.stringify(hover)) set({ hover });
      },
      toggleLock: () => {
        const s = get();
        set({ locked: s.locked ? null : s.hover });
      },
      lockOn: (t) => {
        const same = JSON.stringify(get().locked) === JSON.stringify(t);
        set({ hover: t, locked: same ? null : t });
      },
      clearTarget: () => set({ locked: null, hover: null }),
      togglePointer: () =>
        set((s) => ({
          pointerMode: !s.pointerMode,
          hover: null,
          locked: s.pointerMode ? null : s.locked,
        })),
      togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
      recordUsage: (meta) => {
        if (!meta) return;
        const u = get().usage;
        set({
          lastMeta: meta,
          usage: {
            calls: u.calls + 1,
            costUsd: u.costUsd + meta.costUsd,
            inputTokens: u.inputTokens + meta.inputTokens,
            totalMs: u.totalMs + meta.jevMs,
          },
        });
      },
      toggleLivePreview: () => set((s) => ({ livePreview: !s.livePreview })),
    }),
    {
      name: "speakui:editor",
      version: 1,

      partialize: (s) => ({
        pointerMode: s.pointerMode,
        panelOpen: s.panelOpen,
        livePreview: s.livePreview,
      }),
    },
  ),
);
