"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { N_DEFAULTS, type NSettings } from "@/app/explorations/_lab/settings";
import { MARK_EVENT } from "./intro-script";
import styles from "./home.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

export const MARK_SETTINGS: NSettings = {
  ...N_DEFAULTS,
  loop: false,
  particles: 5000,
  dotSize: 1,
  strokes: 0,
  grain: 0,
  zoom: 1,
  orbit: 0,
  tilt: -8,
  rotateSpeed: 0.6,
  sway: 30,
  distance: 0.9,
  returnTime: 1.5,
};

export default function ParticleMark() {
  const [ready, setReady] = useState(false);
  const [assemble, setAssemble] = useState<{ angle: number }>();

  useEffect(() => {
    const form = (event: Event) =>
      setAssemble({ angle: (event as CustomEvent<number>).detail });
    window.addEventListener(MARK_EVENT, form);
    return () => window.removeEventListener(MARK_EVENT, form);
  }, []);

  return (
    <span className={styles.particleMark} data-ready={ready || undefined}>
      <svg
        className={styles.particleFallback}
        viewBox="0 0 63 63"
        aria-hidden="true"
      >
        <path d="M45 45L32 31.2985V18H45V45Z" />
        <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
      </svg>
      <NParticles
        className={styles.particleStage}
        settings={MARK_SETTINGS}
        interactive={false}
        assemble={assemble}
        onReady={() => setReady(true)}
      />
    </span>
  );
}
