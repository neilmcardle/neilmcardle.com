"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

const ROOT = 16;

export function ClampPlayground() {
  const [viewport, setViewport] = useState(900);
  const [minRem, setMinRem] = useState(2);
  const [vw, setVw] = useState(5);
  const [maxRem, setMaxRem] = useState(4);

  const minPx = minRem * ROOT;
  const maxPx = maxRem * ROOT;
  const preferredPx = (vw / 100) * viewport;
  const resolved = Math.min(Math.max(preferredPx, minPx), maxPx);

  const state =
    preferredPx <= minPx
      ? { label: "minimum", tone: "#b8543a" }
      : preferredPx >= maxPx
        ? { label: "maximum", tone: "#4a5f7a" }
        : { label: "preferred", tone: "var(--spark-gold-ink)" };

  const floorAt = minPx / (vw / 100);
  const ceilAt = maxPx / (vw / 100);

  const reset = () => {
    setViewport(900);
    setMinRem(2);
    setVw(5);
    setMaxRem(4);
  };

  return (
    <WidgetShell
      title="clamp(min, preferred, max)"
      status={`${resolved.toFixed(0)}px, ${state.label}`}
      onReset={reset}
      caption="Drag the viewport. The preferred value scales continuously, and the floor and ceiling take over at the two crossover widths."
    >
      <label className="mb-4 block">
        <span className="mb-1 flex items-baseline justify-between gap-2">
          <span className="spark-eyebrow text-[var(--spark-faint)]">
            Viewport width
          </span>
          <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-text)]">
            {viewport}px
          </span>
        </span>
        <input
          type="range"
          min={320}
          max={1600}
          step={10}
          value={viewport}
          onChange={(event) => setViewport(Number(event.target.value))}
          className="w-full accent-[var(--spark-gold-deep)]"
        />
      </label>

      <div
        className="overflow-hidden rounded-lg bg-white"
        style={{ boxShadow: "inset 0 0 0 1px rgba(20,20,19,0.08)" }}
      >
        <div
          className="mx-auto px-4 py-5 transition-[width] duration-150"
          style={{ width: `${(viewport / 1600) * 100}%`, minWidth: 140 }}
        >
          <p
            className="font-serif font-black leading-[0.98] tracking-[-0.03em] text-[var(--spark-text)]"
            style={{ fontSize: resolved }}
          >
            Become an engineer
          </p>
        </div>
      </div>

      <div
        className="relative mt-4 h-[54px] rounded-lg"
        style={{ background: "rgba(20,20,19,0.04)" }}
      >
        <div
          aria-hidden
          className="absolute inset-y-0"
          style={{
            left: `${((floorAt - 320) / 1280) * 100}%`,
            right: `${100 - ((ceilAt - 320) / 1280) * 100}%`,
            background: "rgba(216,180,106,0.2)",
          }}
        />
        <div
          aria-hidden
          className="absolute top-0 h-full w-[2px]"
          style={{
            left: `${((viewport - 320) / 1280) * 100}%`,
            background: "var(--spark-ink)",
          }}
        />
        <span className="spark-mono absolute bottom-1 left-2 text-[9.5px] text-[var(--spark-faint)]">
          320px
        </span>
        <span className="spark-mono absolute bottom-1 right-2 text-[9.5px] text-[var(--spark-faint)]">
          1600px
        </span>
        <span className="spark-eyebrow absolute left-1/2 top-2 -translate-x-1/2 text-[9.5px] text-[var(--spark-gold-ink)]">
          preferred value applies
        </span>
      </div>

      <p className="mt-2 text-[12.5px] leading-[1.6] text-[var(--spark-muted)]">
        Below <strong className="font-semibold">{Math.round(floorAt)}px</strong>{" "}
        the minimum holds the size steady. Above{" "}
        <strong className="font-semibold">{Math.round(ceilAt)}px</strong> the
        maximum caps it. Between them the type scales with the window.
      </p>

      <pre className="spark-mono mt-4 overflow-x-auto rounded-lg bg-[var(--spark-ink)] p-3.5 text-[12.5px] leading-[1.7] text-[var(--spark-on-dark)]">
        <code>
          {`font-size: clamp(${minRem}rem, ${vw}vw, ${maxRem}rem);`}
          <span style={{ color: "var(--spark-gold)" }}>
            {`\n/* at ${viewport}px, resolves to ${resolved.toFixed(0)}px */`}
          </span>
        </code>
      </pre>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Slider
          label="Minimum"
          value={minRem}
          min={0.75}
          max={4}
          step={0.25}
          unit="rem"
          onChange={setMinRem}
        />
        <Slider
          label="Preferred"
          value={vw}
          min={1}
          max={14}
          step={0.5}
          unit="vw"
          onChange={setVw}
        />
        <Slider
          label="Maximum"
          value={maxRem}
          min={1}
          max={8}
          step={0.25}
          unit="rem"
          onChange={setMaxRem}
        />
      </div>

      {minPx > maxPx && (
        <p
          className="mt-3 rounded-lg bg-[rgba(184,84,58,0.09)] px-3.5 py-2.5 text-[12.5px] leading-[1.6]"
          style={{ color: "#b8543a" }}
        >
          Your minimum is larger than your maximum. CSS does not error on this,
          it just uses the minimum and ignores the maximum entirely, so the type
          stops scaling and nothing tells you why.
        </p>
      )}

      {vw >= 9 && minPx <= maxPx && (
        <p className="mt-3 rounded-lg bg-[rgba(216,180,106,0.12)] px-3.5 py-2.5 text-[12.5px] leading-[1.6] text-[#44423e]">
          A preferred value this aggressive is fine for a hero heading and
          punishing for body copy. Narrow the range when the text is meant to be
          read rather than seen.
        </p>
      )}
    </WidgetShell>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="spark-eyebrow text-[var(--spark-faint)]">{label}</span>
        <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-text)]">
          {value}
          {unit}
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
