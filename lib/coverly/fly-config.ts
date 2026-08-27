"use client";

import { createTuner } from "./tuner";

export type FlyConfig = {
  duration: number;
  lift: number;
  arcX: number;
  arcY: number;
  spin: number;
  pop: number;
  endScale: number;
  endOpacity: number;
  bounce: number;
  bounceMs: number;
  turn: number;
  swish: number;
};

export const FLY_DEFAULTS: FlyConfig = {
  duration: 1000,
  lift: 280,
  arcX: 0.1,
  arcY: 0.05,
  spin: 680,
  pop: 1.78,
  endScale: 0.02,
  endOpacity: 0.75,
  bounce: 1.44,
  bounceMs: 700,
  turn: 0.35,
  swish: 0.35,
};

export const flyTuner = createTuner({
  storageKey: "coverly:fly-config",
  defaults: FLY_DEFAULTS,
});

export const getFlyConfig = flyTuner.get;
