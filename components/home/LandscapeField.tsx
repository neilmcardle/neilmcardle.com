"use client";

import { useEffect, useRef } from "react";
import { CANVAS, type Drawing } from "./drawingEngine";

const CELL = 6;
const SQUARE = 2.67;
const INK_SQUARE = 4.6;
const DENSITY = 0.07;
const LIVE = "rgba(216, 180, 106, 0.24)";
const SUPERSAMPLE = 3;
const COVER_FLOOR = 0.06;
const GAMMA = 1.35;
const LUM_FLOOR = 0.05;
const LUM_CEIL = 0.62;
const MASS = 0.5;
const FILL = 0.58;
const INKS = [
  [251, 249, 243],
  [240, 208, 145],
  [216, 180, 106],
  [184, 146, 63],
];

function nearestInk(r: number, g: number, b: number) {
  let best = INKS[0];
  let bestD = Infinity;
  for (const ink of INKS) {
    const dr = r - ink[0];
    const dg = g - ink[1];
    const db = b - ink[2];
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < bestD) {
      bestD = d;
      best = ink;
    }
  }
  return best;
}
const REVEAL_TICKS = 5;

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

function dither(x: number, y: number) {
  return (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GRID_CELL = CELL;
export const GRID_SQUARE = SQUARE;
export const PLATE = "#14120e";
export const PLATE_DOT = "rgba(217, 217, 217, 0.2)";

export function buildArt(drawing: Drawing, cols: number, rows: number) {
  const w = cols * SUPERSAMPLE;
  const h = rows * SUPERSAMPLE;
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const oc = off.getContext("2d", { willReadFrequently: true });
  const art: (string | null)[] = new Array(cols * rows).fill(null);
  if (!oc) return art;

  oc.scale(w / CANVAS, h / CANVAS);
  oc.lineCap = "round";
  oc.lineJoin = "round";
  for (const layer of drawing.layers) {
    for (const mark of layer.strokes) {
      if (mark.wash) continue;
      const path = new Path2D(mark.d);
      if (mark.fill) {
        oc.globalAlpha = mark.opacity ?? 1;
        oc.fillStyle = mark.fill;
        oc.fill(path);
      }
      if (mark.stroke) {
        oc.globalAlpha = mark.strokeOpacity ?? mark.opacity ?? 1;
        oc.strokeStyle = mark.stroke;
        oc.lineWidth = mark.strokeWidth ?? 1.4;
        oc.stroke(path);
      }
    }
  }

  const px = oc.getImageData(0, 0, w, h).data;
  const n = SUPERSAMPLE * SUPERSAMPLE;
  const lum = new Float32Array(cols * rows);
  const solid = new Float32Array(cols * rows);
  const cov = new Float32Array(cols * rows);
  const ink = new Array<number[] | null>(cols * rows).fill(null);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let ar = 0;
      let ag = 0;
      let ab = 0;
      let aa = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        let i = ((y * SUPERSAMPLE + sy) * w + x * SUPERSAMPLE) * 4;
        for (let sx = 0; sx < SUPERSAMPLE; sx++, i += 4) {
          const a = px[i + 3] / 255;
          ar += px[i] * a;
          ag += px[i + 1] * a;
          ab += px[i + 2] * a;
          aa += a;
        }
      }
      const cover = aa / n;
      if (cover < COVER_FLOOR) continue;
      const k = y * cols + x;
      const l =
        (0.2126 * (ar / aa) + 0.7152 * (ag / aa) + 0.0722 * (ab / aa)) / 255;
      lum[k] = l;
      solid[k] = Math.min(1, cover * 1.6);
      cov[k] = cover;
      ink[k] = nearestInk(ar / aa, ag / aa, ab / aa);
    }
  }

  const span = LUM_CEIL - LUM_FLOOR;
  const tone = new Float32Array(cols * rows);
  for (let k = 0; k < tone.length; k++) {
    if (!solid[k]) continue;
    const norm = (lum[k] - LUM_FLOOR) / span;
    tone[k] = Math.pow(Math.max(0, Math.min(1, norm)), GAMMA) * solid[k];
  }

  const bare = (i: number) => cov[i] < MASS;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = y * cols + x;
      const t = tone[k];
      if (t <= 0) continue;
      const edge =
        cov[k] >= MASS &&
        ((x > 0 && bare(k - 1)) ||
          (x < cols - 1 && bare(k + 1)) ||
          (y > 0 && bare(k - cols)) ||
          (y < rows - 1 && bare(k + cols)));
      if (!edge && dither(x, y) >= t * FILL) continue;
      const [ir, ig, ib] = ink[k] as number[];
      const a = edge ? 1 : 0.45 + 0.35 * t;
      art[k] = `rgba(${ir}, ${ig}, ${ib}, ${a.toFixed(3)})`;
    }
  }
  return art;
}

export function paintLandscape(
  ctx: CanvasRenderingContext2D,
  drawing: Drawing,
  size: number,
) {
  const cols = Math.ceil(size / CELL);
  const rows = cols;
  const art = buildArt(drawing, cols, rows);
  const cell = size / cols;
  const square = cell * (SQUARE / CELL);

  ctx.fillStyle = PLATE;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = PLATE_DOT;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillRect(x * cell, y * cell, square, square);
    }
  }
  for (let y = 0; y < rows; y++) {
    const row = y * cols;
    for (let x = 0; x < cols; x++) {
      const tone = art[row + x];
      if (!tone) continue;
      ctx.fillStyle = tone;
      ctx.fillRect(
        x * cell,
        y * cell,
        cell * (INK_SQUARE / CELL),
        cell * (INK_SQUARE / CELL),
      );
    }
  }
}

export default function LandscapeField({
  drawing,
  revealKey,
  still = false,
  fps = 10,
  className,
  label,
}: {
  drawing: Drawing | null;
  revealKey?: string;
  still?: boolean;
  fps?: number;
  className?: string;
  label?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shownRef = useRef<string | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !drawing) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frozen =
      still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instant = frozen || shownRef.current === revealKey;
    shownRef.current = revealKey ?? null;

    let cols = 0;
    let rows = 0;
    let art: (string | null)[] = [];
    let revealAt = new Int16Array(0);
    let cur = new Uint8Array(0);
    let next = new Uint8Array(0);
    let tick = 0;
    let frame: number | null = null;
    let last = 0;
    let visible = true;

    const rf = mulberry32(drawing.dayNumber * 2654435761 + drawing.index * 977);

    const rasterise = () => {
      art = buildArt(drawing, cols, rows);
      revealAt = new Int16Array(cols * rows);
      for (let i = 0; i < art.length; i++) {
        if (art[i]) revealAt[i] = instant ? 0 : Math.floor(rf() * REVEAL_TICKS);
      }
    };

    const seed = () => {
      for (let i = 0; i < cur.length; i++) {
        cur[i] = !art[i] && rf() < DENSITY ? 1 : 0;
      }
    };

    const measure = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 1 || h < 1) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      cur = new Uint8Array(cols * rows);
      next = new Uint8Array(cols * rows);
      rasterise();
      seed();
      return true;
    };

    const step = () => {
      for (let y = 0; y < rows; y++) {
        const up = ((y - 1 + rows) % rows) * cols;
        const mid = y * cols;
        const dn = ((y + 1) % rows) * cols;
        for (let x = 0; x < cols; x++) {
          const l = (x - 1 + cols) % cols;
          const r = (x + 1) % cols;
          const k = mid + x;
          if (art[k]) {
            next[k] = 0;
            continue;
          }
          const c =
            cur[up + l] +
            cur[up + x] +
            cur[up + r] +
            cur[mid + l] +
            cur[mid + r] +
            cur[dn + l] +
            cur[dn + x] +
            cur[dn + r];
          next[k] = c === 3 || (c === 2 && cur[k]) ? 1 : 0;
        }
      }
      const swap = cur;
      cur = next;
      next = swap;
    };

    const paint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < rows; y++) {
        const row = y * cols;
        for (let x = 0; x < cols; x++) {
          const k = row + x;
          const tone = art[k];
          if (!tone || revealAt[k] > tick) continue;
          ctx.fillStyle = tone;
          ctx.fillRect(x * CELL, y * CELL, INK_SQUARE, INK_SQUARE);
        }
      }
      ctx.fillStyle = LIVE;
      for (let y = 0; y < rows; y++) {
        const row = y * cols;
        for (let x = 0; x < cols; x++) {
          if (cur[row + x]) ctx.fillRect(x * CELL, y * CELL, SQUARE, SQUARE);
        }
      }
    };

    if (!measure()) return;
    paint();

    const settle = requestAnimationFrame(() => {
      if (Math.abs(wrap.clientWidth - cols * CELL) > CELL && measure()) paint();
    });

    if (!frozen) {
      const interval = 1000 / fps;
      const loop = (t: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible || t - last < interval) return;
        last = t;
        tick += 1;
        step();
        paint();
      };
      frame = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    io.observe(wrap);

    let resizeTimer: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (measure()) paint();
      }, 180);
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(settle);
      if (frame !== null) cancelAnimationFrame(frame);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
    };
  }, [drawing, revealKey, still, fps]);

  return (
    <div
      ref={wrapRef}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
