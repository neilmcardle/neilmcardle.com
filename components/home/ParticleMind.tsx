"use client";

import dynamic from "next/dynamic";
import { N_DEFAULTS, type NSettings } from "@/app/explorations/_lab/settings";
import styles from "./home.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const MIND: NSettings = {
  ...N_DEFAULTS,
  shape: "mind",
  loop: false,
  particles: 2200,
  ink: "#ffffff",
  dotSize: 1,
  strokes: 0.06,
  trail: 0.4,
  grain: 0,
  distance: 0.9,
  returnTime: 2.6,
  sweep: 0.2,
  swirl: 1.4,
  orbit: 0,
  tilt: -4,
  zoom: 1.35,
  autoRotate: false,
  follow: 28,
};

const FORM = { angle: 0 };

export default function ParticleMind() {
  return (
    <NParticles
      className={styles.particleMind}
      settings={MIND}
      assemble={FORM}
      interactive={false}
    />
  );
}
