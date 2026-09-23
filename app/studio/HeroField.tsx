"use client";

import { useEffect, useRef } from "react";

const W = 1440;
const H = 560;

function rng(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function HeroField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = W;
    canvas.height = H;

    const r = rng(Math.floor(Math.random() * 99999));
    const n = 16 + Math.floor(r() * 10);
    const cell = W / n;
    const rows = Math.ceil(H / cell);

    ctx.fillStyle = "#111110";
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "square";
    ctx.lineWidth = cell * (0.06 + r() * 0.04);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < n; i++) {
        ctx.strokeStyle = r() < 0.88 ? "#6b3fe0" : "#d2ea1c";
        ctx.beginPath();
        if (r() < 0.5) {
          ctx.moveTo(i * cell, j * cell);
          ctx.lineTo(i * cell + cell, j * cell + cell);
        } else {
          ctx.moveTo(i * cell + cell, j * cell);
          ctx.lineTo(i * cell, j * cell + cell);
        }
        ctx.stroke();
      }
    }
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
