"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./fps-meter.module.css";

const SLOW_MS = 25;

function wanted() {
  if (process.env.NODE_ENV !== "development") return false;
  return new URLSearchParams(window.location.search).get("fps") !== "0";
}

export default function FpsMeter() {
  const [on, setOn] = useState(false);
  const [stats, setStats] = useState({ fps: 0, worst: 0, slow: 0 });
  const slowTotal = useRef(0);

  useEffect(() => {
    setOn(wanted());
  }, []);

  useEffect(() => {
    if (!on) return;
    let frame = 0;
    let last = performance.now();
    let windowStart = last;
    let frames = 0;
    let worst = 0;
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      frames += 1;
      if (delta > worst) worst = delta;
      if (delta > SLOW_MS && delta < 1000) slowTotal.current += 1;
      if (now - windowStart >= 1000) {
        setStats({
          fps: Math.round((frames * 1000) / (now - windowStart)),
          worst: Math.round(worst),
          slow: slowTotal.current,
        });
        frames = 0;
        worst = 0;
        windowStart = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      if (document.hidden) return;
      last = performance.now();
      windowStart = last;
      frames = 0;
      worst = 0;
    };
    document.addEventListener("visibilitychange", restart);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [on]);

  if (!on) return null;

  const level = stats.fps >= 55 ? "good" : stats.fps >= 40 ? "warn" : "bad";

  return (
    <button
      type="button"
      className={styles.meter}
      data-level={level}
      onClick={() => {
        slowTotal.current = 0;
        setStats((s) => ({ ...s, slow: 0 }));
      }}
      aria-label={`${stats.fps} frames per second. Press to reset the slow frame count.`}
    >
      <span className={styles.fps}>{stats.fps || "--"}</span>
      <span className={styles.unit}>fps</span>
      <span className={styles.sep} />
      <span className={styles.label}>worst</span>
      <span className={styles.num}>{stats.worst}ms</span>
      <span className={styles.sep} />
      <span className={styles.label}>slow</span>
      <span className={styles.num}>{stats.slow}</span>
    </button>
  );
}
