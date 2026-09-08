"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import styles from "./home.module.css";

const DEG_PER_PX = 0.8;
const FRICTION = 0.982;
const MIN_VELOCITY = 0.12;
const MAX_VELOCITY = 55;
const SAMPLE_MS = 120;
const SETTLE_MS = 520;

const SIZE = 112;
const THICKNESS = 15;
const SLICES = 48;
const LIGHT = [-0.36, 0.46, 0.81];
const REST_TILT = 12;

export default function ProfileCoin() {
  const coinRef = useRef<HTMLDivElement>(null);
  const sliceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const angle = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(0);
  const lastX = useRef(0);
  const lastAt = useRef(0);
  const samples = useRef<{ x: number; t: number }[]>([]);
  const frame = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const paint = useCallback(() => {
    const el = coinRef.current;
    if (!el) return;
    const a = (angle.current * Math.PI) / 180;
    el.style.transform = `rotateX(${REST_TILT}deg) rotateY(${angle.current}deg)`;
    el.style.filter = `brightness(${(0.62 + 0.38 * Math.abs(Math.cos(a))).toFixed(3)})`;

    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    for (let i = 0; i < sliceRefs.current.length; i++) {
      const slice = sliceRefs.current[i];
      if (!slice) continue;
      const t = (i * 2 * Math.PI) / SLICES;
      const nx = Math.cos(t) * cosA;
      const ny = Math.sin(t);
      const nz = -Math.cos(t) * sinA;
      const lit = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
      const reed = i % 2 ? 0.74 : 1;
      slice.style.filter = `brightness(${(0.22 + 1.15 * lit * reed).toFixed(3)})`;
    }
  }, []);

  useEffect(() => {
    paint();
  }, [paint]);

  const settle = useCallback(() => {
    const el = coinRef.current;
    if (!el) return;
    const nearest = Math.round(angle.current / 180) * 180;
    if (nearest === angle.current) return;
    angle.current = nearest;
    el.style.transition = `transform ${SETTLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1), filter ${SETTLE_MS}ms linear`;
    paint();
    window.setTimeout(() => {
      if (el) el.style.transition = "";
    }, SETTLE_MS);
  }, [paint]);

  const glide = useCallback(() => {
    velocity.current *= FRICTION;
    angle.current += velocity.current;
    paint();
    if (Math.abs(velocity.current) > MIN_VELOCITY) {
      frame.current = requestAnimationFrame(glide);
    } else {
      frame.current = null;
      settle();
    }
  }, [paint, settle]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      const el = coinRef.current;
      if (el) el.style.transition = "";
      dragging.current = true;
      moved.current = 0;
      velocity.current = 0;
      lastX.current = event.clientX;
      lastAt.current = performance.now();
      samples.current = [{ x: event.clientX, t: lastAt.current }];
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const dx = event.clientX - lastX.current;
      const now = performance.now();
      const dt = Math.max(1, now - lastAt.current);
      moved.current += Math.abs(dx);
      angle.current += dx * DEG_PER_PX;
      void dt;
      samples.current.push({ x: event.clientX, t: now });
      while (
        samples.current.length > 2 &&
        now - samples.current[0].t > SAMPLE_MS
      ) {
        samples.current.shift();
      }
      lastX.current = event.clientX;
      lastAt.current = now;
      paint();
    },
    [paint],
  );

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;

    const trail = samples.current;
    const last = trail[trail.length - 1];
    const first = trail[0];
    if (last && first && last.t > first.t) {
      const perFrame =
        ((last.x - first.x) * DEG_PER_PX * 16) / (last.t - first.t);
      velocity.current = Math.max(
        -MAX_VELOCITY,
        Math.min(MAX_VELOCITY, perFrame),
      );
    } else {
      velocity.current = 0;
    }
    samples.current = [];

    if (reduced.current || Math.abs(velocity.current) <= MIN_VELOCITY) {
      settle();
      return;
    }
    frame.current = requestAnimationFrame(glide);
  }, [glide, settle]);

  const radius = SIZE / 2;
  const chord = (Math.PI * SIZE) / SLICES + 1;

  return (
    <div
      className={styles.coinStage}
      style={
        {
          "--coin-size": `${SIZE}px`,
          "--coin-thickness": `${THICKNESS}px`,
        } as React.CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={coinRef} className={styles.coin}>
        <div className={styles.coinEdge} aria-hidden>
          {Array.from({ length: SLICES }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                sliceRefs.current[i] = el;
              }}
              style={{
                height: `${chord}px`,
                marginTop: `${-chord / 2}px`,
                transform: `rotateZ(${(i * 360) / SLICES}deg) translateX(${radius}px) rotateY(90deg)`,
              }}
            />
          ))}
        </div>

        <div className={styles.coinFace}>
          <Image
            src="/hero/portrait.png"
            alt="Neil McArdle"
            width={480}
            height={480}
            sizes="112px"
            priority
            draggable={false}
          />
        </div>

        <div className={`${styles.coinFace} ${styles.coinBack}`}>
          <svg viewBox="18 18 27 27" fill="currentColor" aria-hidden>
            <path d="M45 45L32 31.2985V18H45V45Z" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
