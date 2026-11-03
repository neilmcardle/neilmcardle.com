"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { NSettings } from "@/app/explorations/_lab/settings";
import { MARK } from "@/app/_signature/NavMark";
import styles from "./home.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const TURN: NSettings = { ...MARK, hold: 0.5, faceHold: 1e6, particles: 7000 };

export default function FaceCard() {
  const anchor = useRef<HTMLSpanElement>(null);
  const unmount = useRef(0);
  const [live, setLive] = useState(false);
  const [shown, setShown] = useState(false);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => window.clearTimeout(unmount.current);
  }, []);

  const start = () => {
    if (calm) return;
    window.clearTimeout(unmount.current);
    setLive(true);
  };

  const stop = () => {
    setShown(false);
    window.clearTimeout(unmount.current);
    unmount.current = window.setTimeout(() => setLive(false), 320);
  };

  return (
    <button
      type="button"
      className={styles.faceCard}
      aria-label="Turn the N into my face"
      aria-pressed={live}
      onPointerEnter={(e) => e.pointerType === "mouse" && start()}
      onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
      onClick={(e) => {
        if (e.detail !== 0 && !matchMedia("(hover: none)").matches) return;
        if (live) stop();
        else start();
      }}
    >
      <svg
        className={`${styles.bigN} ${shown ? styles.away : ""}`}
        viewBox="18 18 27 27"
        aria-hidden="true"
      >
        <path d="M45 45L32 31.2985V18H45V45Z" />
        <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
      </svg>
      {calm ? (
        <img
          className={styles.calmFace}
          src="/home/face-card.png"
          alt=""
          width={129}
          height={240}
        />
      ) : null}
      {live ? (
        <span className={`${styles.faceFade} ${shown ? styles.on : ""}`}>
          <NParticles
            className={styles.faceStage}
            settings={TURN}
            interactive={false}
            anchor={anchor}
            face="/me.png"
            onReady={() => setShown(true)}
          />
        </span>
      ) : null}
      <span ref={anchor} className={styles.faceAnchor} />
    </button>
  );
}
