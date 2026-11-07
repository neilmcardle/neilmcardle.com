"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { NSettings } from "@/app/explorations/_lab/settings";
import { MARK } from "@/app/_signature/NavMark";
import styles from "./home.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const BASE: NSettings = {
  ...MARK,
  particles: 7000,
  faceScale: 1.7,
  faceCrop: [0.21, 0.69, 0.24, 0.78],
};

const REST: NSettings = { ...BASE, hold: 1e6, faceHold: 0.01 };
const TURN: NSettings = { ...BASE, hold: 0.5, faceHold: 1e6 };

export default function FaceCard() {
  const card = useRef<HTMLButtonElement>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);
  const [shown, setShown] = useState(false);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCalm(still);
    const el = card.current;
    if (still || !el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        watch.disconnect();
        setNear(true);
      },
      { rootMargin: "400px 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const start = () => {
    if (calm) return;
    setLive(true);
  };

  const stop = () => setLive(false);

  return (
    <button
      ref={card}
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
      {calm ? (
        <>
          <svg className={styles.bigN} viewBox="18 18 27 27" aria-hidden="true">
            <path d="M45 45L32 31.2985V18H45V45Z" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
          </svg>
          <img
            className={styles.calmFace}
            src="/home/face-card.png"
            alt=""
            width={129}
            height={240}
          />
        </>
      ) : null}
      {near ? (
        <span className={`${styles.faceFade} ${shown ? styles.on : ""}`}>
          <NParticles
            className={styles.faceStage}
            settings={live ? TURN : REST}
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
