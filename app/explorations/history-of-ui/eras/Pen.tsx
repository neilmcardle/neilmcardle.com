"use client";

import { useEffect, useRef, useState } from "react";
import { Fit, useScale } from "../lib";
import s from "./pen.module.css";

type Pt = { x: number; y: number };

const STROKES: Record<string, number[][]> = {
  A: [
    [0, 1],
    [0.5, 0],
    [1, 1],
  ],
  B: [
    [0, 1],
    [0, 0],
    [0.8, 0.05],
    [0.85, 0.4],
    [0.1, 0.5],
    [0.9, 0.6],
    [0.9, 0.95],
    [0, 1],
  ],
  C: [
    [1, 0.1],
    [0.5, 0],
    [0.1, 0.2],
    [0, 0.5],
    [0.1, 0.8],
    [0.5, 1],
    [1, 0.9],
  ],
  D: [
    [0, 1],
    [0, 0],
    [0.6, 0.05],
    [1, 0.5],
    [0.6, 0.95],
    [0, 1],
  ],
  E: [
    [1, 0],
    [0.1, 0.05],
    [0.6, 0.5],
    [0.05, 0.6],
    [0.15, 0.95],
    [1, 1],
  ],
  F: [
    [1, 0],
    [0, 0],
    [0, 1],
  ],
  G: [
    [1, 0.1],
    [0.5, 0],
    [0.05, 0.4],
    [0.3, 0.95],
    [0.9, 0.9],
    [1, 0.6],
    [0.55, 0.6],
  ],
  H: [
    [0, 0],
    [0, 1],
    [0.1, 0.5],
    [0.9, 0.45],
    [1, 1],
  ],
  J: [
    [1, 0],
    [1, 0.75],
    [0.6, 1],
    [0.1, 0.85],
  ],
  K: [
    [1, 0],
    [0, 0.5],
    [1, 1],
  ],
  L: [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  M: [
    [0, 1],
    [0.15, 0],
    [0.5, 0.6],
    [0.85, 0],
    [1, 1],
  ],
  N: [
    [0, 1],
    [0, 0],
    [1, 1],
    [1, 0],
  ],
  O: [
    [0.5, 0],
    [0.1, 0.2],
    [0, 0.5],
    [0.1, 0.8],
    [0.5, 1],
    [0.9, 0.8],
    [1, 0.5],
    [0.9, 0.2],
    [0.5, 0],
  ],
  P: [
    [0, 1],
    [0, 0],
    [0.9, 0.05],
    [0.95, 0.4],
    [0, 0.5],
  ],
  Q: [
    [0.5, 0],
    [0.05, 0.3],
    [0.2, 0.8],
    [0.6, 0.85],
    [0.85, 0.5],
    [0.5, 0.05],
    [0.6, 0.6],
    [1, 1],
  ],
  R: [
    [0, 1],
    [0, 0],
    [0.9, 0.05],
    [0.9, 0.4],
    [0.1, 0.5],
    [1, 1],
  ],
  S: [
    [1, 0.05],
    [0.4, 0],
    [0, 0.25],
    [0.5, 0.5],
    [1, 0.75],
    [0.6, 1],
    [0, 0.95],
  ],
  T: [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  U: [
    [0, 0],
    [0, 0.8],
    [0.5, 1],
    [1, 0.8],
    [1, 0],
  ],
  V: [
    [0, 0],
    [0.5, 1],
    [1, 0],
  ],
  W: [
    [0, 0],
    [0.25, 1],
    [0.5, 0.3],
    [0.75, 1],
    [1, 0],
  ],
  X: [
    [0, 0],
    [1, 1],
    [1, 0],
    [0, 1],
  ],
  Y: [
    [0, 0],
    [0.5, 0.55],
    [1, 0],
    [0.5, 0.55],
    [0.5, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
};

const N = 40;

function pathLength(p: Pt[]) {
  let d = 0;
  for (let i = 1; i < p.length; i++)
    d += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  return d;
}

function resample(points: Pt[], n = N) {
  const pts = points.map((p) => ({ ...p }));
  const I = pathLength(pts) / (n - 1);
  if (!I) return Array.from({ length: n }, () => ({ ...pts[0] }));
  let D = 0;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (D + d >= I && d > 0) {
      const t = (I - D) / d;
      const q = {
        x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x),
        y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y),
      };
      out.push(q);
      pts.splice(i, 0, q);
      D = 0;
    } else D += d;
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  return out.slice(0, n);
}

function normalise(points: Pt[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const size = Math.max(w, h) || 1;
  const cx = minX + w / 2;
  const cy = minY + h / 2;
  return points.map((p) => ({ x: (p.x - cx) / size, y: (p.y - cy) / size }));
}

const TEMPLATES = Object.entries(STROKES).map(([ch, pts]) => ({
  ch,
  pts: normalise(resample(pts.map(([x, y]) => ({ x, y })))),
}));

function recognise(raw: Pt[]): string | null {
  if (raw.length < 2) return null;
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  if (Math.max(w, h) < 8) return null;
  const dx = raw[raw.length - 1].x - raw[0].x;
  const dy = raw[raw.length - 1].y - raw[0].y;
  if (h < w * 0.28 && Math.abs(dx) > w * 0.6) return dx > 0 ? " " : "⌫";
  if (w < h * 0.28 && Math.abs(dy) > h * 0.6) return dy > 0 ? "I" : null;
  const p = normalise(resample(raw));
  let best = "";
  let bd = Infinity;
  for (const t of TEMPLATES) {
    let d = 0;
    for (let i = 0; i < N; i++)
      d += Math.hypot(p[i].x - t.pts[i].x, p[i].y - t.pts[i].y);
    if (d < bd) {
      bd = d;
      best = t.ch;
    }
  }
  return bd / N < 0.22 ? best : null;
}

function Guide({ onClose }: { onClose: () => void }) {
  return (
    <div className={s.guide}>
      <div className={s.guideHead}>
        <span>Graffiti</span>
        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
      <div className={s.guideGrid}>
        {[...Object.keys(STROKES), "I"].sort().map((ch) => {
          const pts =
            ch === "I"
              ? [
                  [0.5, 0],
                  [0.5, 1],
                ]
              : STROKES[ch];
          const d = pts
            .map(([x, y], i) => `${i ? "L" : "M"}${3 + x * 14} ${3 + y * 14}`)
            .join(" ");
          return (
            <div key={ch} className={s.glyph}>
              <svg viewBox="0 0 20 20" aria-hidden>
                <path d={d} />
                <circle
                  cx={3 + pts[0][0] * 14}
                  cy={3 + pts[0][1] * 14}
                  r="1.8"
                />
              </svg>
              <span>{ch}</span>
            </div>
          );
        })}
        <div className={s.glyph}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M3 10 L17 10" />
            <circle cx="3" cy="10" r="1.8" />
          </svg>
          <span>space</span>
        </div>
        <div className={s.glyph}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M17 10 L3 10" />
            <circle cx="17" cy="10" r="1.8" />
          </svg>
          <span>delete</span>
        </div>
      </div>
    </div>
  );
}

function Device() {
  const scale = useScale();
  const [text, setText] = useState("");
  const [last, setLast] = useState<{ ch: string; k: number } | null>(null);
  const [guide, setGuide] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<Pt[]>([]);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvas.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = 232 * dpr;
    c.height = 78 * dpr;
    c.getContext("2d")!.scale(dpr, dpr);
  }, []);

  const pt = (e: React.PointerEvent): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  const ctx = () => canvas.current!.getContext("2d")!;

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    stroke.current = [pt(e)];
    const g = ctx();
    g.clearRect(0, 0, 232, 78);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pt(e);
    const prev = stroke.current[stroke.current.length - 1];
    stroke.current.push(p);
    const g = ctx();
    g.strokeStyle = "rgba(30, 36, 25, 0.75)";
    g.lineWidth = 2.5;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(prev.x, prev.y);
    g.lineTo(p.x, p.y);
    g.stroke();
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const ch = recognise(stroke.current);
    window.setTimeout(() => ctx().clearRect(0, 0, 232, 78), 260);
    if (!ch) {
      setLast({ ch: "?", k: Date.now() });
      return;
    }
    setLast({
      ch: ch === " " ? "space" : ch === "⌫" ? "delete" : ch,
      k: Date.now(),
    });
    if (ch === "⌫") setText((t) => t.slice(0, -1));
    else
      setText((t) =>
        (
          t + (t.length === 0 || t.endsWith(". ") ? ch : ch.toLowerCase())
        ).slice(-120),
      );
  };

  return (
    <div className={s.device}>
      <div className={s.brand}>Pocket organiser</div>
      <div className={s.lcd}>
        {guide ? (
          <Guide onClose={() => setGuide(false)} />
        ) : (
          <div className={s.memo}>
            <div className={s.tabBar}>
              <span className={s.tab}>Memo Pad</span>
              <span className={s.count}>1 of 1</span>
            </div>
            <div className={s.page} aria-live="polite">
              {text ? (
                text
              ) : (
                <span className={s.placeholder}>
                  Write in the box below, one stroke a letter.
                </span>
              )}
              <span className={s.caret} aria-hidden />
            </div>
            <div className={s.buttons}>
              <button type="button" onClick={() => setText("")}>
                Clear
              </button>
              <button type="button" onClick={() => setGuide(true)}>
                Stroke guide
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={s.silk}>
        <span className={s.silkIcon} aria-hidden>
          ⌂
        </span>
        <div className={s.writeArea}>
          <canvas
            ref={canvas}
            className={s.ink}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-label="Graffiti writing area. Draw one letter at a time."
          />
          <span className={s.divider} aria-hidden />
          <span className={s.areaLabel} data-side="l" aria-hidden>
            abc
          </span>
          <span className={s.areaLabel} data-side="r" aria-hidden>
            abc
          </span>
          {last && (
            <span key={last.k} className={s.flash} aria-hidden>
              {last.ch}
            </span>
          )}
        </div>
        <span className={s.silkIcon} aria-hidden>
          ⌕
        </span>
      </div>
      <div className={s.hard} aria-hidden>
        <i />
        <i />
        <span className={s.rocker} />
        <i />
        <i />
      </div>
    </div>
  );
}

export default function Pen() {
  return (
    <Fit width={340} height={560}>
      <Device />
    </Fit>
  );
}
