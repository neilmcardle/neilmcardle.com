"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { N_DEFAULTS, type NSettings } from "@/app/explorations/_lab/settings";
import shell from "./signature.module.css";
import styles from "./hero.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const HERO: NSettings = {
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
  particles: 9000,
  dotSize: 1.9,
  strokes: 0.04,
  grain: 0.14,
  tilt: -10,
  rotateSpeed: 0.7,
  distance: 0.8,
  ink: "#ecebe7",
};

export default function Hero() {
  const mark = useRef<HTMLDivElement>(null);
  return (
    <>
      <section className={`${shell.wrap} ${styles.hero}`}>
        <NParticles
          className={styles.stage}
          settings={HERO}
          interactive
          momentum
          touchAction="pan-y"
          anchor={mark}
          face="/me.png"
        />
        <div ref={mark} className={styles.mark} aria-hidden="true" />
        <div className={styles.who}>
          <h1>Neil McArdle</h1>
          <p className={styles.role}>Product Designer</p>
          <p className={styles.site}>London</p>
        </div>
      </section>
    </>
  );
}
