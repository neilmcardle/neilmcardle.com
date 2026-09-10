"use client";

import { createSample } from "@/lib/coverly/sfx";

export const menuClick = createSample("/coverly/tick-pop.mp3", () => true);
export const dockClick = createSample(
  "/audio/mouse-menu-click.wav",
  () => true,
);
