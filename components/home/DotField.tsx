"use client";

import { useEffect, useRef } from "react";

const CELL = 6;
const SQUARE = 2.67;
const DENSITY = 0.14;
const LIVE = "rgba(216, 180, 106, 0.55)";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function DotField({
  className,
  seedOffset = 0,
  fps = 7,
}: {
  className?: string;
  seedOffset?: number;
  fps?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let cur = new Uint8Array(0);
    let next = new Uint8Array(0);
    let frame: number | null = null;
    let last = 0;
    let visible = true;

    const seed = () => {
      const day = Math.floor(Date.now() / 86400000) + seedOffset;
      const rf = mulberry32(day * 2654435761 + seedOffset * 40503);
      for (let i = 0; i < cur.length; i++) cur[i] = rf() < DENSITY ? 1 : 0;
    };

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(r.width / CELL);
      rows = Math.ceil(r.height / CELL);
      cur = new Uint8Array(cols * rows);
      next = new Uint8Array(cols * rows);
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
          const n =
            cur[up + l] +
            cur[up + x] +
            cur[up + r] +
            cur[mid + l] +
            cur[mid + r] +
            cur[dn + l] +
            cur[dn + x] +
            cur[dn + r];
          next[mid + x] = n === 3 || (n === 2 && cur[mid + x]) ? 1 : 0;
        }
      }
      const swap = cur;
      cur = next;
      next = swap;
    };

    const paint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    if (!still) {
      const interval = 1000 / fps;
      const loop = (t: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible || t - last < interval) return;
        last = t;
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
      if (frame !== null) cancelAnimationFrame(frame);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
    };
  }, [seedOffset, fps]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
