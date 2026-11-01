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
  particles: 5200,
  dotSize: 0.8,
  faceCrop: [0.3, 0.78, 0.24, 0.78],
  faceContrast: 1.35,
  flightAlpha: 0.45,
  strokes: 0.03,
  grain: 0.08,
  tilt: 0,
  orbit: 0,
  follow: 0,
  autoRotate: false,
  depth: 2 / 3,
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
