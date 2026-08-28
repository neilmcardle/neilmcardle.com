"use client";

import { createTuner } from "./tuner";

export type DockConfig = {
  peak: number;
  reach: number;
  curve: number;
  ease: number;
  anchor: number;
  tilt: number;
  height: number;
  gap: number;
  volume: number;
};

export const DOCK_DEFAULTS: DockConfig = {
  peak: 1.4,
  reach: 1.8,
  curve: 2.9,
  ease: 110,
  anchor: 0.35,
  tilt: -2,
  height: 88,
  gap: 12,
  volume: 0.2,
};

export const dockTuner = createTuner({
  storageKey: "coverly:dock-config",
  defaults: DOCK_DEFAULTS,
});

export const getDockConfig = dockTuner.get;
export const setDockValue = dockTuner.set;
export const resetDockConfig = dockTuner.reset;
export const useDockConfig = dockTuner.use;
export const subscribeDock = dockTuner.subscribe;
