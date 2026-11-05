"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { N_DEFAULTS, type NSettings } from "@/app/explorations/_lab/settings";
import styles from "./header.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

export const MARK: NSettings = {
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

const HOVER: NSettings = { ...MARK, hold: 0.7, faceHold: 60 };

const FADE_MS = 320;

export default function NavMark() {
  const anchor = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const unmount = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(unmount.current), []);

  useEffect(() => {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const near = (event: PointerEvent) => {
      if (event.clientY > 160) return;
      window.removeEventListener("pointermove", near);
      import("@/app/explorations/_lab/NParticles").then((m) =>
        m.prepareParticles(HOVER, "/me.png"),
      );
    };
    window.addEventListener("pointermove", near, { passive: true });
    return () => window.removeEventListener("pointermove", near);
  }, []);

  const enter = () => {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    window.clearTimeout(unmount.current);
    setLive(true);
    if (ready) setShown(true);
  };

  const leave = () => {
    setShown(false);
    window.clearTimeout(unmount.current);
    unmount.current = window.setTimeout(() => {
      setLive(false);
      setReady(false);
    }, FADE_MS);
  };

  return (
    <span
      className={styles.particleMark}
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <svg
        className={`${styles.solid} ${shown ? styles.away : ""}`}
        viewBox="18 18 27 27"
        aria-hidden="true"
      >
        <path d="M45 45L32 31.2985V18H45V45Z" />
        <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
      </svg>
      {live ? (
        <span className={`${styles.fade} ${shown ? styles.on : ""}`}>
          <NParticles
            className={styles.particleStage}
            settings={HOVER}
            interactive={false}
            anchor={anchor}
            face="/me.png"
            onReady={() => {
              setReady(true);
              setShown(true);
            }}
          />
        </span>
      ) : null}
      <span ref={anchor} className={styles.particleAnchor} />
    </span>
  );
}
