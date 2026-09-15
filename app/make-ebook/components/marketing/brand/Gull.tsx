"use client";

import { useEffect, useRef } from "react";
import styles from "./brand.module.css";

const ENTER_AT = 0.8;
const LEAVE_AT = 0.28;
const RESET_BELOW = 1.05;
const ARRIVE_MS = 2600;
const LEAVE_MS = 2000;
const HOLD_MS = 900;
const FLAP_MS = 85;
const SETTLE_MS = 420;
const ROWS = { flyIn: 0, land: 1, settle: 2, flyOut: 3 };
const COUNTS = { flyIn: 8, land: 8, settle: 6, flyOut: 8 };
const ARRIVE = [
  [-140, -780],
  [-120, -540],
  [-40, -200],
  [0, 0],
];
const LEAVE = [
  [0, 0],
  [140, -70],
  [460, -260],
  [1000, -720],
];

function bezier(points: number[][], t: number) {
  const u = 1 - t;
  const [a, b, c, d] = points;
  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],
    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * (3 - 2 * t);

export function Gull() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const gull = ref.current;
    const perch = gull?.parentElement;
    if (!gull || !perch) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let phase = "away";
    let leaveRequested = false;
    let started = 0;
    let anim = 0;
    let scrollFrame = 0;

    const setFrame = (row: number, index: number) => {
      gull.style.setProperty("--fx", String(index));
      gull.style.setProperty("--fy", String(row));
    };
    const place = (x: number, y: number) => {
      gull.style.setProperty("--x", `${x.toFixed(1)}px`);
      gull.style.setProperty("--y", `${y.toFixed(1)}px`);
    };
    const setPhase = (next: string) => {
      phase = next;
      gull.dataset.phase = next;
      started = performance.now();
    };

    const tick = (now: number) => {
      anim = requestAnimationFrame(tick);
      const elapsed = now - started;
      if (phase === "arriving") {
        const t = Math.min(1, elapsed / ARRIVE_MS);
        const [x, y] = bezier(ARRIVE, easeOut(t));
        place(x, y);
        if (t < 0.72)
          setFrame(ROWS.flyIn, Math.floor(elapsed / FLAP_MS) % COUNTS.flyIn);
        else
          setFrame(
            ROWS.land,
            Math.min(
              COUNTS.land - 1,
              Math.floor(((t - 0.72) / 0.28) * COUNTS.land),
            ),
          );
        if (t >= 1) setPhase("perched");
        return;
      }
      if (phase === "perched") {
        place(0, 0);
        setFrame(ROWS.settle, Math.floor(elapsed / SETTLE_MS) % COUNTS.settle);
        if (leaveRequested && elapsed >= HOLD_MS) setPhase("leaving");
        return;
      }
      if (phase === "leaving") {
        const t = Math.min(1, elapsed / LEAVE_MS);
        const [x, y] = bezier(LEAVE, easeIn(t));
        place(x, y);
        if (t < 0.3)
          setFrame(
            ROWS.flyOut,
            Math.min(COUNTS.flyOut - 1, Math.floor((t / 0.3) * COUNTS.flyOut)),
          );
        else setFrame(ROWS.flyIn, Math.floor(elapsed / FLAP_MS) % COUNTS.flyIn);
        if (t >= 1) setPhase("gone");
        return;
      }
      cancelAnimationFrame(anim);
      anim = 0;
    };

    const run = () => {
      if (!anim) anim = requestAnimationFrame(tick);
    };

    const check = () => {
      scrollFrame = 0;
      const top = perch.getBoundingClientRect().top / window.innerHeight;
      if (reduced) {
        const inView = top < ENTER_AT && top > LEAVE_AT - 0.3;
        setPhase(inView ? "perched" : "away");
        place(0, 0);
        setFrame(ROWS.settle, 0);
        return;
      }
      if (top > RESET_BELOW) {
        leaveRequested = false;
        if (phase !== "away") setPhase("away");
        return;
      }
      if (phase === "away" && top < ENTER_AT) {
        setPhase("arriving");
        run();
        return;
      }
      if ((phase === "perched" || phase === "arriving") && top < LEAVE_AT) {
        leaveRequested = true;
        run();
      }
    };

    const schedule = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(check);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(anim);
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={styles.gull}
      data-phase="away"
      aria-hidden="true"
    />
  );
}
