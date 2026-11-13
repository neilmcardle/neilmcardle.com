"use client";

import React, { useEffect, useReducer } from "react";
import type { Chapter } from "../types";

type PreviewModule = typeof import("./PreviewSurface");

let loading: Promise<PreviewModule> | null = null;
let loaded: PreviewModule | null = null;

export function preloadPreview(): Promise<PreviewModule> {
  loading ??= import("./PreviewSurface").then((mod) => {
    loaded = mod;
    return mod;
  });
  return loading;
}

export function PreviewSlot(props: {
  chapters: Chapter[];
  selectedChapter: number;
}) {
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const Surface = loaded?.default ?? null;

  useEffect(() => {
    if (Surface) return;
    let live = true;
    void preloadPreview().then(() => {
      if (live) refresh();
    });
    return () => {
      live = false;
    };
  }, [Surface]);

  return Surface ? <Surface {...props} /> : null;
}
