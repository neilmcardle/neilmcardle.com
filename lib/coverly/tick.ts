"use client";

import { createSample } from "./sfx";

const tick = createSample("/coverly/tick-pop.mp3");

export const primeTick = tick.prime;
export const playTick = tick.play;
