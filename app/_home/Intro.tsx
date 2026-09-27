"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { N_DEFAULTS, type NSettings } from "@/app/explorations/_lab/settings";
import { INTRO_KEY, MARK_EVENT } from "./intro-script";
import styles from "./intro.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

const BASE: NSettings = {
  ...N_DEFAULTS,
  loop: false,
  hold: 0.8,
  distance: 2.6,
  scatterTime: 1.1,
  returnTime: 2.2,
  sweep: 0.15,
  swirl: 1.4,
  trail: 0.5,
  strokes: 0.03,
  dotSize: 1.5,
  grain: 0.1,
  orbit: -24,
  tilt: -8,
  rotateSpeed: 0.4,
};

const WIDTH = 192;
const FORM = { angle: BASE.orbit };

function fitted(): NSettings {
  if (typeof window === "undefined") return BASE;
  const zoom = WIDTH / (0.45 * window.innerHeight);
  return {
    ...BASE,
    particles: 40000,
    zoom,
    dotSize: 0.62 / zoom,
    distance: 1.1 / zoom,
  };
}

const noop = () => () => {};
const skipped = () => document.documentElement.dataset.intro !== "on";

export default function Intro() {
  const skip = useSyncExternalStore(noop, skipped, () => false);
  const [settings] = useState(fitted);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [done, setDone] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const angle = useRef(0);

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "on") return;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    const fallback = window.setTimeout(() => setReady(true), 3000);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let live = true;
    const leave = () => {
      if (!live) return;
      live = false;
      setLeaving(true);
    };
    const fill = bar.current?.getAnimations()[0];
    if (fill) fill.finished.then(leave, leave);
    else leave();
    window.addEventListener("keydown", leave);
    window.addEventListener("pointerdown", leave);
    return () => {
      live = false;
      window.removeEventListener("keydown", leave);
      window.removeEventListener("pointerdown", leave);
    };
  }, [ready]);

  useEffect(() => {
    if (!leaving) return;
    const form = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(MARK_EVENT, { detail: angle.current }),
      );
      setHandoff(true);
    }, 450);
    const finish = window.setTimeout(() => {
      delete document.documentElement.dataset.intro;
      setDone(true);
    }, 1700);
    return () => {
      window.clearTimeout(form);
      window.clearTimeout(finish);
    };
  }, [leaving]);

  if (skip || done) return null;

  return (
    <div
      id={INTRO_KEY}
      className={styles.intro}
      data-ready={ready || undefined}
      data-leaving={leaving || undefined}
      data-handoff={handoff || undefined}
      aria-hidden="true"
    >
      <span className={styles.veil} />
      <NParticles
        className={styles.stage}
        settings={settings}
        replay={leaving ? 1 : 0}
        assemble={FORM}
        interactive={false}
        onReady={() => setReady(true)}
        onScatter={(at) => {
          angle.current = at;
        }}
      />
      <span className={styles.track}>
        <span ref={bar} className={styles.fill} />
      </span>
    </div>
  );
}
