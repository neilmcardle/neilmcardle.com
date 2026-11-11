"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { NSettings } from "@/app/explorations/_lab/settings";
import { MARK } from "@/app/_signature/NavMark";
import { createSample } from "@/lib/coverly/sfx";
import { media } from "@/lib/media";
import styles from "./home.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const BASE: NSettings = {
  ...MARK,
  particles: 7000,
  faceScale: 1,
  faceCrop: [0.21, 0.69, 0.24, 0.78],
  scatterTime: 0.6,
  driftTime: 0.1,
  returnTime: 2.2,
  morphDelay: 0.1,
  morphIn: 0.2,
  distance: 0,
  swirl: 0,
  sweep: 0,
};

const REST: NSettings = {
  ...BASE,
  hold: 1e6,
  faceHold: 0.01,
  faceTarget: 0,
};
const TURN: NSettings = {
  ...BASE,
  hold: 0.01,
  faceHold: 1e6,
  faceTarget: 1,
};

const always = () => true;
const rise = createSample(media("/audio/particle-high.mp3"), always, {
  live: true,
});
const fall = createSample(media("/audio/particle-1.mp3"), always, {
  live: true,
});
let lastSound = 0;

const SOUND = {
  volume: 0.16,
  faceFrom: 0.9,
  faceWait: 0.08,
  nFrom: 0.3,
  nWait: 0.99,
};

function sound(toFace: boolean) {
  const next = toFace ? rise : fall;
  const other = toFace ? fall : rise;
  other.stop();
  next.stop();
  const now = performance.now();
  if (now - lastSound < 120) return;
  lastSound = now;
  next.play(
    SOUND.volume,
    toFace ? SOUND.faceFrom : SOUND.nFrom,
    toFace ? SOUND.faceWait : SOUND.nWait,
  );
}

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
        rise.prime();
        fall.prime();
      },
      { rootMargin: "400px 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const start = (audible: boolean) => {
    if (calm || live) return;
    setLive(true);
    if (audible) sound(true);
  };

  const stop = (audible: boolean) => {
    if (!live) return;
    setLive(false);
    if (audible) sound(false);
  };

  return (
    <button
      ref={card}
      type="button"
      className={styles.faceCard}
      aria-label="Turn the N into my face"
      aria-pressed={live}
      onPointerEnter={(e) => e.pointerType === "mouse" && start(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && stop(true)}
      onClick={(e) => {
        if (e.detail !== 0 && !matchMedia("(hover: none)").matches) return;
        const keyboard = e.detail === 0;
        if (live) stop(keyboard);
        else start(keyboard);
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
