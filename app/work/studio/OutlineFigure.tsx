"use client";

import Image from "next/image";
import { useState } from "react";
import { OUTLINES, type Shape } from "./outlines";
import styles from "./outlines.module.css";

const W = 2560;
const H = 1448;

type Mode = "before" | "after";

const NAMES: Record<string, string> = {
  press: "Press",
  desk: "Desk",
  window: "Window",
  laptop: "Laptop",
  phone: "Phone",
  post: "Letters",
  "print-makeebook": "Makeebook print",
  "print-coverly": "Coverly print",
  "print-doodlewire": "DoodleWire print",
  easel: "Easel",
  drawer: "Drawer",
  coat: "Coat",
};

const PICKS = ["press", "desk", "easel", "coat", "laptop"];

const count = (shape?: Shape) =>
  shape ? shape.reduce((sum, poly) => sum + poly.length, 0) : 0;

const total = (mode: Mode) =>
  Object.values(OUTLINES[mode]).reduce((sum, shape) => sum + count(shape), 0);

function box(id: string, mode: Mode) {
  const points = (OUTLINES[mode][id] ?? OUTLINES.after[id]).flat();
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
}

function view(id: string | null, mode: Mode) {
  if (!id) return { s: 1, tx: 0, ty: 0 };
  const b = box(id, mode);
  const bw = (b.x1 - b.x0) * 1.7;
  const bh = (b.y1 - b.y0) * 1.7;
  const s = Math.min(5, Math.max(1, Math.min(W / bw, H / bh)));
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * s, v));
  return {
    s,
    tx: clamp((0.5 - (cx / W) * s) * 100),
    ty: clamp((0.5 - (cy / H) * s) * 100),
  };
}

export default function OutlineFigure({
  start = "after",
  focus: first = null,
}: {
  start?: Mode;
  focus?: string | null;
}) {
  const [mode, setMode] = useState<Mode>(start);
  const [focus, setFocus] = useState<string | null>(first);
  const v = view(focus, mode);
  const shapes = OUTLINES[mode];
  const dot = 8 / v.s;

  return (
    <figure className={styles.figure}>
      <div className={styles.stage}>
        <div
          className={styles.layer}
          style={{
            transform: `translate(${v.tx}%, ${v.ty}%) scale(${v.s})`,
          }}
        >
          <Image
            src="/hero-studio/scenes/studio.webp"
            alt="The studio painting with every clickable object outlined"
            fill
            sizes="(max-width: 1120px) 100vw, 1072px"
            className={styles.plate}
          />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className={styles.svg}
            aria-hidden="true"
          >
            {Object.entries(shapes).map(([id, shape]) =>
              shape.map((poly, index) => (
                <polygon
                  key={`${mode}-${id}-${index}`}
                  points={poly.map((p) => p.join(",")).join(" ")}
                  className={`${styles.ants} ${id === focus ? styles.on : ""}`}
                  onClick={() => setFocus(id === focus ? null : id)}
                />
              )),
            )}
            {Object.entries(shapes).map(([id, shape]) =>
              shape.flatMap((poly, index) =>
                poly.map((p, n) => (
                  <circle
                    key={`${mode}-${id}-${index}-${n}`}
                    cx={p[0]}
                    cy={p[1]}
                    r={id === focus ? dot * 1.4 : dot}
                    className={id === focus ? styles.nodeOn : styles.node}
                  />
                )),
              ),
            )}
          </svg>
        </div>
      </div>

      <div className={styles.bar}>
        <div
          className={styles.switch}
          role="group"
          aria-label="Outline version"
        >
          <button
            type="button"
            aria-pressed={mode === "before"}
            onClick={() => setMode("before")}
          >
            Automatic trace
          </button>
          <button
            type="button"
            aria-pressed={mode === "after"}
            onClick={() => setMode("after")}
          >
            My pass
          </button>
        </div>
        <p className={styles.count} aria-live="polite">
          {focus ? (
            <>
              {NAMES[focus]}:{" "}
              <strong>{count(OUTLINES.before[focus]) || "no outline"}</strong> →{" "}
              <strong>{count(OUTLINES.after[focus])}</strong> points
            </>
          ) : (
            <>
              Whole room: <strong>{total("before")}</strong> →{" "}
              <strong>{total("after")}</strong> points
            </>
          )}
        </p>
      </div>

      <div className={styles.picks} role="group" aria-label="Zoom to an object">
        <button
          type="button"
          aria-pressed={focus === null}
          onClick={() => setFocus(null)}
        >
          Whole room
        </button>
        {PICKS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={focus === id}
            onClick={() => setFocus(id)}
          >
            {NAMES[id]}
          </button>
        ))}
      </div>
    </figure>
  );
}
