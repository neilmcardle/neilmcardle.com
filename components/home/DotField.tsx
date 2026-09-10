"use client";

import { useEffect, useRef } from "react";

const CELL = 6;
const SQUARE = 2.67;
const INK = "216, 180, 106";

const SPEED_MIN = 80;
const SPEED_MAX = 136;
const LEN_MIN = 5;
const LEN_MAX = 16;
const ALPHA_MIN = 0.1;
const ALPHA_MAX = 0.26;
const ALPHA_BRIGHT = 1;
const BRIGHT_SHARE = 0.2;

const WEATHER_RATE = 0.055;
const CALM = 0.16;
const SPLASH_GRAVITY = 52;
const SPLASH_LIFE_MIN = 0.45;
const SPLASH_LIFE_MAX = 0.9;
const GROUND_INSET = 4;
const SPLASH_SQUARE = 4.4;

const CURSOR_RADIUS = 17;
const CURSOR_FORCE = 430;
const CURSOR_HIT_RADIUS = 8;
const DRIFT_DECAY = 3.2;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Streak = {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  hit: boolean;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
};

type Splash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  life: number;
  alpha: number;
};

export default function DotField({
  className,
  seedOffset = 0,
  count,
  paused = false,
}: {
  className?: string;
  seedOffset?: number;
  count: number;
  paused?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ink =
      getComputedStyle(wrap).getPropertyValue("--home-rain-rgb").trim() || INK;

    const rf = mulberry32(0x9e3779b1 + seedOffset * 40503);

    const lean = 0.3 + rf() * 0.16;

    let cols = 0;
    let rows = 0;
    let pool: Streak[] = [];
    let splashes: Splash[] = [];
    let weather = 0.5;
    let frame: number | null = null;
    let last = 0;
    let visible = true;

    const reset = (s: Streak, seeded: boolean) => {
      s.len = LEN_MIN + rf() * (LEN_MAX - LEN_MIN);
      s.speed = SPEED_MIN + rf() * (SPEED_MAX - SPEED_MIN);
      s.alpha =
        rf() < BRIGHT_SHARE
          ? ALPHA_MAX + rf() * (ALPHA_BRIGHT - ALPHA_MAX)
          : ALPHA_MIN + rf() * (ALPHA_MAX - ALPHA_MIN);
      const drift = lean * rows;
      s.x = -drift + rf() * (cols + drift);
      s.y = seeded ? rf() * rows : -s.len - rf() * rows * 0.3;
      s.hit = false;
      s.vx = 0;
      s.vy = 0;
      s.dx = lean;
      s.dy = 1;
    };

    const groundRow = () => Math.max(1, rows - GROUND_INSET);

    const splash = (
      x: number,
      y: number,
      alpha: number,
      nx: number,
      ny: number,
    ) => {
      const n = 4 + Math.floor(rf() * 5);
      for (let i = 0; i < n; i++) {
        const spray = (rf() - 0.3) * 18;
        const sp = 9 + rf() * 14;
        splashes.push({
          x,
          y,
          vx: nx * sp + spray,
          vy: ny * sp,
          t: 0,
          life: SPLASH_LIFE_MIN + rf() * (SPLASH_LIFE_MAX - SPLASH_LIFE_MIN),
          alpha: Math.min(1, Math.max(0.3, alpha) * 1.1),
        });
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

      pool = [];
      splashes = [];
      for (let i = 0; i < count; i++) {
        const s: Streak = {
          x: 0,
          y: 0,
          len: 0,
          speed: 0,
          alpha: 0,
          hit: false,
          vx: 0,
          vy: 0,
          dx: lean,
          dy: 1,
        };
        reset(s, true);
        pool.push(s);
      }
      return true;
    };

    const activeCount = () =>
      Math.max(2, Math.round(pool.length * (CALM + (1 - CALM) * weather)));

    const step = (dt: number) => {
      const phase = (Date.now() / 1000) * WEATHER_RATE;
      const raw =
        0.5 + 0.36 * Math.sin(phase) + 0.14 * Math.sin(phase * 2.7 + 1.3);
      weather = Math.max(0, Math.min(1, raw));

      const active = activeCount();
      const gust = 0.75 + 0.5 * weather;
      const drag = Math.exp(-DRIFT_DECAY * dt);

      for (let i = 0; i < pool.length; i++) {
        const s = pool[i];
        if (i >= active) {
          if (s.y > -s.len) reset(s, false);
          continue;
        }

        let struck = false;
        if (pointerLive) {
          const ox = s.x - pointerX;
          const oy = s.y - pointerY;
          const d2 = ox * ox + oy * oy;
          if (d2 < CURSOR_RADIUS * CURSOR_RADIUS) {
            const d = Math.sqrt(d2) || 0.0001;
            const nx = ox / d;
            const ny = oy / d;
            if (d < CURSOR_HIT_RADIUS) {
              splash(
                pointerX + nx * CURSOR_HIT_RADIUS,
                pointerY + ny * CURSOR_HIT_RADIUS,
                s.alpha,
                nx,
                ny,
              );
              reset(s, false);
              struck = true;
            } else {
              const falloff = 1 - d / CURSOR_RADIUS;
              const push = CURSOR_FORCE * falloff * falloff * dt;
              s.vx += nx * push;
              s.vy += ny * push;
            }
          }
        }
        if (struck) continue;

        const moveX = s.speed * gust * lean + s.vx;
        const moveY = s.speed * gust + s.vy;
        s.x += moveX * dt;
        s.y += moveY * dt;
        s.dx = moveX;
        s.dy = moveY;
        s.vx *= drag;
        s.vy *= drag;

        const floor = groundRow();
        if (!s.hit && s.y >= floor) {
          s.hit = true;
          if (s.x >= 0 && s.x < cols) splash(s.x, groundRow(), s.alpha, 0, -1);
        }
        if (s.y - s.len > floor) reset(s, false);
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const p = splashes[i];
        p.t += dt;
        p.vy += SPLASH_GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const floor = groundRow();
        if (p.y > floor) {
          p.y = floor;
          p.vy = 0;
          p.vx *= 0.4;
        }
        if (p.t > p.life) splashes.splice(i, 1);
      }
    };

    const paint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const active = activeCount();

      for (let i = 0; i < active && i < pool.length; i++) {
        const s = pool[i];
        const cells = Math.max(2, Math.round(s.len));
        const taper = s.alpha > ALPHA_MAX ? 0.3 : 0.65;
        const speed = Math.hypot(s.dx, s.dy) || 1;
        const ux = s.dx / speed;
        const uy = s.dy / speed;
        const trail = s.len * Math.hypot(1, lean);
        for (let j = 0; j < cells; j++) {
          const t = j / (cells - 1);
          const gy = Math.round(s.y - trail * t * uy);
          if (gy < 0 || gy > groundRow()) continue;
          const gx = Math.round(s.x - trail * t * ux);
          if (gx < 0 || gx >= cols) continue;
          const a = s.alpha * (1 - t * taper);
          if (a < 0.03) continue;
          ctx.fillStyle = `rgba(${ink}, ${a.toFixed(3)})`;
          ctx.fillRect(gx * CELL, gy * CELL, SQUARE, SQUARE);
        }
      }

      for (const p of splashes) {
        const gx = Math.round(p.x);
        const gy = Math.round(p.y);
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
        const a = p.alpha * (1 - p.t / p.life);
        if (a < 0.03) continue;
        ctx.fillStyle = `rgba(${ink}, ${a.toFixed(3)})`;
        ctx.fillRect(gx * CELL, gy * CELL, SPLASH_SQUARE, SPLASH_SQUARE);
      }
    };

    if (!measure()) return;
    paint();

    last = performance.now();
    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!visible || pausedRef.current) return;
      step(dt);
      paint();
    };
    frame = requestAnimationFrame(loop);

    let pointerX = 0;
    let pointerY = 0;
    let pointerLive = false;

    const onPointerMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointerX = (e.clientX - r.left) / CELL;
      pointerY = (e.clientY - r.top) / CELL;
      pointerLive = true;
    };
    const onPointerGone = () => {
      pointerLive = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerGone);
    window.addEventListener("blur", onPointerGone);

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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      document.removeEventListener("pointerleave", onPointerGone);
      window.removeEventListener("blur", onPointerGone);
      io.disconnect();
      ro.disconnect();
    };
  }, [seedOffset, count]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
