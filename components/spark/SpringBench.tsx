"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { WidgetShell, useReducedMotion } from "./WidgetShell";

const TRACK = 260;
const BOX = 34;

function springPath(
  stiffness: number,
  damping: number,
  mass: number,
): number[] {
  const frames: number[] = [];
  let position = 0;
  let velocity = 0;
  const target = 1;
  const dt = 1 / 60;

  for (let i = 0; i < 260; i++) {
    const force = -stiffness * (position - target);
    const drag = -damping * velocity;
    velocity += ((force + drag) / mass) * dt;
    position += velocity * dt;
    frames.push(position);
  }
  return frames;
}

function settleFrame(frames: number[]): number {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (Math.abs(frames[i] - 1) > 0.005) return i + 1;
  }
  return 0;
}

function overshoot(frames: number[]): number {
  return Math.max(0, Math.max(...frames) - 1);
}

export function SpringBench() {
  const [stiffness, setStiffness] = useState(180);
  const [damping, setDamping] = useState(18);
  const [mass, setMass] = useState(1);
  const [duration, setDuration] = useState(320);
  const [tick, setTick] = useState(0);
  const [springX, setSpringX] = useState(0);
  const [easeOn, setEaseOn] = useState(false);
  const raf = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const frames = springPath(stiffness, damping, mass);
  const settle = settleFrame(frames);
  const over = overshoot(frames);

  const stop = useCallback(() => {
    if (raf.current !== null) {
      window.cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const run = useCallback(() => {
    stop();
    setTick((n) => n + 1);
    setEaseOn(false);
    setSpringX(0);

    if (reduced) {
      setSpringX(1);
      setEaseOn(true);
      return;
    }

    window.requestAnimationFrame(() => setEaseOn(true));

    let i = 0;
    const step = () => {
      setSpringX(frames[i] ?? 1);
      i++;
      if (i < frames.length) {
        raf.current = window.requestAnimationFrame(step);
      } else {
        raf.current = null;
      }
    };
    raf.current = window.requestAnimationFrame(step);
  }, [frames, reduced, stop]);

  const reset = () => {
    stop();
    setStiffness(180);
    setDamping(18);
    setMass(1);
    setDuration(320);
    setSpringX(0);
    setEaseOn(false);
  };

  const verdict =
    over > 0.2
      ? {
          text: "Broken. It bounces past the target far enough to read as a glitch.",
          tone: "#b8543a",
        }
      : over > 0.02
        ? {
            text: "Alive. A small overshoot reads as physical.",
            tone: "var(--spark-gold-ink)",
          }
        : {
            text: "Dead. No overshoot at all, so it reads as a slide, not a spring.",
            tone: "var(--spark-muted)",
          };

  const durationVerdict =
    duration > 900
      ? "Slow. Past about 800ms the user is waiting on you."
      : duration < 120
        ? "Abrupt. Under about 120ms the eye cannot follow what moved."
        : "Intentional. This is the range most interface motion lives in.";

  return (
    <WidgetShell
      title="Spring against easing, same distance"
      status={
        reduced
          ? "reduced motion"
          : `settles in ${Math.round((settle / 60) * 1000)}ms`
      }
      onReset={reset}
      caption="A spring is described by physics and finds its own duration. An easing curve is described by a duration you choose. Neither is better, and they fail in different ways."
    >
      {reduced && (
        <p className="mb-4 rounded-lg bg-[var(--spark-gold)]/[0.12] px-3.5 py-2.5 text-[12.5px] leading-[1.6] text-[#44423e]">
          Your system asks for reduced motion, so both rows jump straight to the
          end. This is exactly what a motion-sensitive visitor sees, and it is
          why the numbers below matter more than the animation.
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="spark-eyebrow text-[var(--spark-gold-ink)]">
              Spring
            </span>
            <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-faint)]">
              overshoot {(over * 100).toFixed(1)}%
            </span>
          </div>
          <div
            className="relative rounded-lg"
            style={{ height: BOX + 16, background: "rgba(20,20,19,0.04)" }}
          >
            <div
              className="absolute rounded-md"
              style={{
                top: 8,
                left: 8,
                width: BOX,
                height: BOX,
                background: "var(--spark-gold-deep)",
                transform: `translateX(${springX * TRACK}px)`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="spark-eyebrow text-[var(--spark-faint)]">
              Easing
            </span>
            <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-faint)]">
              {duration}ms
            </span>
          </div>
          <div
            className="relative rounded-lg"
            style={{ height: BOX + 16, background: "rgba(20,20,19,0.04)" }}
          >
            <div
              key={tick}
              className="absolute rounded-md"
              style={{
                top: 8,
                left: 8,
                width: BOX,
                height: BOX,
                background: "var(--spark-ink)",
                transform: `translateX(${easeOn ? TRACK : 0}px)`,
                transition: reduced
                  ? "none"
                  : `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={run}
        className="mt-4 min-h-[40px] rounded-full bg-[var(--spark-ink)] px-6 text-[13px] font-semibold text-white transition-transform hover:-translate-y-px"
      >
        Run both
      </button>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Slider
            label="Stiffness"
            value={stiffness}
            min={20}
            max={400}
            step={10}
            onChange={setStiffness}
          />
          <Slider
            label="Damping"
            value={damping}
            min={2}
            max={40}
            step={1}
            onChange={setDamping}
          />
          <Slider
            label="Mass"
            value={mass}
            min={0.4}
            max={3}
            step={0.1}
            onChange={setMass}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Slider
            label="Easing duration"
            value={duration}
            min={80}
            max={1500}
            step={20}
            onChange={setDuration}
            unit="ms"
          />
          <p
            className="rounded-lg px-3 py-2.5 text-[12.5px] leading-[1.6]"
            style={{ background: "rgba(216,180,106,0.1)", color: verdict.tone }}
          >
            {verdict.text}
          </p>
          <p className="rounded-lg bg-black/[0.03] px-3 py-2.5 text-[12.5px] leading-[1.6] text-[var(--spark-muted)]">
            {durationVerdict}
          </p>
        </div>
      </div>
    </WidgetShell>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="spark-eyebrow text-[var(--spark-faint)]">{label}</span>
        <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-text)]">
          {value}
          {unit ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--spark-gold-deep)]"
      />
    </label>
  );
}
