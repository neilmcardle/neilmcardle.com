"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./landing.module.css";

export function Stage({
  image,
  className = "",
  children,
}: {
  image: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${styles.stage} ${className}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      {children}
    </div>
  );
}

export function Window({
  title,
  right,
  className = "",
  children,
}: {
  title: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.window} ${className}`}>
      <div className={styles.titlebar}>
        <div className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className={styles.titleText}>{title}</span>
        <div className={styles.titleRight}>{right}</div>
      </div>
      {children}
    </div>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

export function useTimeline(active: boolean, delays: number[], runKey = 0) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const delaysKey = delays.join(",");

  useEffect(() => {
    if (!active || reduced) return;
    const schedule = delaysKey.split(",").map(Number);
    const timers: number[] = [window.setTimeout(() => setStep(0), 0)];
    let elapsed = 0;
    schedule.forEach((delay, i) => {
      elapsed += delay;
      timers.push(window.setTimeout(() => setStep(i + 1), elapsed));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, reduced, delaysKey, runKey]);

  return active && reduced ? delays.length : step;
}

export function Arrow({
  direction = "right",
}: {
  direction?: "right" | "left" | "out";
}) {
  const d =
    direction === "left"
      ? "M10 3L5 8l5 5"
      : direction === "out"
        ? "M5 11l6-6M6 5h5v5"
        : "M6 3l5 5-5 5";
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
