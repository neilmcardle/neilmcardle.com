"use client";

import { createTuner } from "./tuner";

export type FlyConfig = {
  duration: number;
  lift: number;
  tilt: number;
  ink: number;
  mark: number;
  turn: number;
  swish: number;
};

export const FLY_DEFAULTS: FlyConfig = {
  duration: 600,
  lift: 1.06,
  tilt: 4,
  ink: 0.4,
  mark: 0.72,
  turn: 0.35,
  swish: 0.12,
};

export const flyTuner = createTuner({
  storageKey: "coverly:fly-config-v2",
  defaults: FLY_DEFAULTS,
});

export const getFlyConfig = flyTuner.get;
