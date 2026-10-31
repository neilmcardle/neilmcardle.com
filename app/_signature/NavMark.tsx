"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { N_DEFAULTS, type NSettings } from "@/app/explorations/_lab/settings";
import styles from "./header.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const MARK: NSettings = {
  ...N_DEFAULTS,
  loop: true,
  hold: 5,
  faceHold: 4,
  scatterTime: 2.4,
  driftTime: 0.6,
  returnTime: 2.2,
  sweep: 0.12,
  swirl: 1.4,
  trail: 0.4,
  particles: 2600,
  dotSize: 0.95,
  flightAlpha: 0.45,
  strokes: 0.03,
  grain: 0.08,
  tilt: -10,
  rotateSpeed: 0.7,
  distance: 0.55,
  ink: "#ecebe7",
};

export default function NavMark() {
  const anchor = useRef<HTMLSpanElement>(null);
  return (
    <span className={styles.particleMark}>
      <NParticles
        className={styles.particleStage}
        settings={MARK}
        interactive={false}
        anchor={anchor}
        face="/me.png"
      />
      <span ref={anchor} className={styles.particleAnchor} />
    </span>
  );
}
