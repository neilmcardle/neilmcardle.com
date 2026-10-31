"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import styles from "./finale.module.css";

type Dot = {
  x: number;
  y: number;
  sx: number;
  sy: number;
  delay: number;
  phase: number;
};

const FLIGHT = 1300;
const SPREAD = 650;
const MAX_DOTS = 9000;
const DOT = 1.9;
const SWIRL = 1.4;
const SCATTERED = 0.08;
const FORMED = 0.85;
const LEVELS = 12;

const ease = (t: number) => 1 - Math.pow(1 - t, 4);

function sample(title: HTMLElement, pad: number) {
  const box = title.getBoundingClientRect();
  const css = getComputedStyle(title);
  const size = parseFloat(css.fontSize);
  const width = Math.ceil(box.width + pad * 2);
  const height = Math.ceil(box.height + pad * 2);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = `${css.fontWeight} ${size}px ${css.fontFamily}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = css.letterSpacing;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  const text = title.firstChild;
  if (!text || text.nodeType !== Node.TEXT_NODE) return null;
  const source = text.textContent ?? "";
  const range = document.createRange();
  const words = source.split(/(\s+)/);
  let offset = 0;
  for (const word of words) {
    if (word.trim()) {
      range.setStart(text, offset);
      range.setEnd(text, offset + word.length);
      const r = range.getBoundingClientRect();
      const label =
        css.textTransform === "uppercase" ? word.toUpperCase() : word;
      const ascent = ctx.measureText(label).fontBoundingBoxAscent;
      ctx.fillText(
        label,
        r.left - box.left + pad,
        r.top - box.top + pad + ascent,
      );
    }
    offset += word.length;
  }
  const data = ctx.getImageData(0, 0, width, height).data;
  const inside: [number, number][] = [];
  for (let y = 0; y < height; y += 2)
    for (let x = 0; x < width; x += 2)
      if (data[(y * width + x) * 4 + 3] > 140) inside.push([x, y]);
  for (let i = inside.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [inside[i], inside[j]] = [inside[j], inside[i]];
  }
  const points = inside
    .slice(0, MAX_DOTS)
    .map(([x, y]): [number, number] => [
      x + Math.random() * 2 - 1,
      y + Math.random() * 2 - 1,
    ]);
  return { points, width, height, box };
}

const ParticleTitle = forwardRef<
  HTMLHeadingElement,
  { text: string; shown: boolean; className?: string }
>(function ParticleTitle({ text, shown, className }, ref) {
  const own = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formed, setFormed] = useState(false);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    if (!shown) return;
    const title = own.current;
    const canvas = canvasRef.current;
    if (!title || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFormed(true);
      return;
    }
    let frame = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setFormed(true);
      window.setTimeout(() => setFlying(false), 420);
    };
    document.fonts.ready.then(() => {
      if (done) return;
      const pad = Math.round(
        parseFloat(getComputedStyle(title).fontSize) * 0.2,
      );
      const shape = sample(title, pad);
      const ctx = canvas.getContext("2d");
      if (!shape || !ctx || !shape.points.length) return finish();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = shape.width * dpr;
      canvas.height = shape.height * dpr;
      canvas.style.width = `${shape.width}px`;
      canvas.style.height = `${shape.height}px`;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      ctx.scale(dpr, dpr);
      const dots: Dot[] = shape.points.map(([x, y]) => {
        const angle = Math.random() * Math.PI * 2;
        const reach = (0.35 + Math.random() * 0.65) * shape.width * 0.45;
        return {
          x,
          y,
          sx: x + Math.cos(angle) * reach + shape.width * 0.18,
          sy: y + Math.sin(angle) * reach * 0.6,
          delay: (x / shape.width) * SPREAD + Math.random() * 160,
          phase: Math.random() * Math.PI * 2,
        };
      });
      const ink =
        getComputedStyle(title).getPropertyValue("--ink").trim() || "#ecebe7";
      setFlying(true);
      const begin = performance.now();
      const end = SPREAD + 160 + FLIGHT;
      const swirl = SWIRL * shape.height * 0.06;
      const draw = (now: number) => {
        const t = now - begin;
        ctx.clearRect(0, 0, shape.width, shape.height);
        ctx.fillStyle = ink;
        const buckets: number[][] = Array.from({ length: LEVELS }, () => []);
        for (const d of dots) {
          const p = Math.min(1, Math.max(0, (t - d.delay) / FLIGHT));
          if (p <= 0) continue;
          const e = ease(p);
          const curl = (1 - e) * swirl;
          const x = d.sx + (d.x - d.sx) * e + Math.cos(d.phase + e * 5) * curl;
          const y = d.sy + (d.y - d.sy) * e + Math.sin(d.phase + e * 5) * curl;
          const level = Math.min(LEVELS - 1, Math.floor(e * LEVELS));
          buckets[level].push(x, y);
        }
        for (let level = 0; level < LEVELS; level++) {
          const list = buckets[level];
          if (!list.length) continue;
          ctx.globalAlpha =
            SCATTERED + (FORMED - SCATTERED) * ((level + 0.5) / LEVELS);
          ctx.beginPath();
          for (let i = 0; i < list.length; i += 2) {
            ctx.moveTo(list[i] + DOT / 2, list[i + 1]);
            ctx.arc(list[i], list[i + 1], DOT / 2, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        if (t >= end) return finish();
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    });
    return () => {
      done = true;
      cancelAnimationFrame(frame);
    };
  }, [shown]);

  return (
    <h2
      ref={(el) => {
        own.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      className={`${className ?? ""} ${formed ? styles.formed : ""}`}
    >
      {text}
      <canvas
        ref={canvasRef}
        className={`${styles.dust} ${flying ? styles.flying : ""} ${formed ? styles.settled : ""}`}
        aria-hidden="true"
      />
    </h2>
  );
});

export default ParticleTitle;
