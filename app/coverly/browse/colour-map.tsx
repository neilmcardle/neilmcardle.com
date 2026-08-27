"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hexToHsl } from "@/lib/coverly/color";
import type { MapPoint } from "./actions";

type Placed = MapPoint & { x: number; y: number };

const IMAGE_ZOOM = 2.4;
const MAX_IMAGES = 220;
const PAD = 56;

function hash(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function ColourMap({
  points,
  zoom,
  onZoom,
  onOpen,
}: {
  points: MapPoint[];
  zoom: number;
  onZoom: (z: number) => void;
  onOpen: (id: string) => void;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef({ k: 1, tx: 0, ty: 0 });
  const imagesRef = useRef(new Map<string, HTMLImageElement | null>());
  const hoverRef = useRef<Placed | null>(null);
  const frameRef = useRef(0);
  const drawRef = useRef<() => void>(() => {});

  const [hover, setHover] = useState<Placed | null>(null);
  const onOpenRef = useRef(onOpen);
  const onZoomRef = useRef(onZoom);

  useEffect(() => {
    onOpenRef.current = onOpen;
    onZoomRef.current = onZoom;
  });

  const placed = useMemo<Placed[]>(
    () =>
      points.map((p) => {
        const { h, l } = hexToHsl(p.hex);
        const jx = (hash(p.id) - 0.5) * 0.012;
        const jy = (hash(p.id + "y") - 0.5) * 0.012;
        return {
          ...p,
          x: Math.min(1, Math.max(0, h / 360 + jx)),
          y: Math.min(1, Math.max(0, 1 - l + jy)),
        };
      }),
    [points],
  );

  const schedule = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      drawRef.current();
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { k, tx, ty } = viewRef.current;
    const iw = w - PAD * 2;
    const ih = h - PAD * 2;
    const sx = (p: Placed) => PAD + p.x * iw * k + tx;
    const sy = (p: Placed) => PAD + p.y * ih * k + ty;

    ctx.strokeStyle = "rgba(0,0,0,0.07)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const gx = PAD + (i / 6) * iw * k + tx;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }

    const size = Math.max(3, 7 * Math.sqrt(k));
    const showImages = k >= IMAGE_ZOOM;
    let drawn = 0;

    for (const p of placed) {
      const px = sx(p);
      const py = sy(p);
      if (px < -40 || px > w + 40 || py < -60 || py > h + 60) continue;

      if (showImages && drawn < MAX_IMAGES) {
        drawn++;
        const cached = imagesRef.current.get(p.id);
        if (cached === undefined) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            imagesRef.current.set(p.id, img);
            schedule();
          };
          img.onerror = () => imagesRef.current.set(p.id, null);
          imagesRef.current.set(p.id, null);
          img.src = p.image_url;
        } else if (cached) {
          const ch = size * 3.2;
          const cw = ch * 0.66;
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.28)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.drawImage(cached, px - cw / 2, py - ch / 2, cw, ch);
          ctx.restore();
          continue;
        }
      }

      ctx.fillStyle = p.hex;
      ctx.beginPath();
      ctx.arc(px, py, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const hovered = hoverRef.current;
    if (hovered) {
      const px = sx(hovered);
      const py = sy(hovered);
      ctx.strokeStyle = "rgba(0,0,0,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, size / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [placed, schedule]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const v = viewRef.current;
    if (Math.abs(v.k - zoom) < 0.005) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const ratio = zoom / v.k;
    v.tx = cx - PAD - (cx - PAD - v.tx) * ratio;
    v.ty = cy - PAD - (cy - PAD - v.ty) * ratio;
    v.k = zoom;
    schedule();
  }, [zoom, schedule]);

  const pick = useCallback(
    (cx: number, cy: number): Placed | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const { k, tx, ty } = viewRef.current;
      const iw = canvas.clientWidth - PAD * 2;
      const ih = canvas.clientHeight - PAD * 2;
      const r = Math.max(6, 7 * Math.sqrt(k));
      let best: Placed | null = null;
      let bestD = r * r;
      for (const p of placed) {
        const dx = PAD + p.x * iw * k + tx - cx;
        const dy = PAD + p.y * ih * k + ty - cy;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      return best;
    },
    [placed],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(schedule);
    observer.observe(canvas);
    schedule();

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
        viewRef.current.tx += dx;
        viewRef.current.ty += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        schedule();
        return;
      }
      const found = pick(e.clientX - rect.left, e.clientY - rect.top);
      if (found !== hoverRef.current) {
        hoverRef.current = found;
        setHover(found);
        schedule();
      }
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      if (moved) return;
      const rect = canvas.getBoundingClientRect();
      const found = pick(e.clientX - rect.left, e.clientY - rect.top);
      if (found) onOpenRef.current(found.id);
    };
    const onLeave = () => {
      hoverRef.current = null;
      setHover(null);
      schedule();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const v = viewRef.current;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const next = Math.min(14, Math.max(0.6, v.k * factor));
      const ratio = next / v.k;
      v.tx = cx - PAD - (cx - PAD - v.tx) * ratio;
      v.ty = cy - PAD - (cy - PAD - v.ty) * ratio;
      v.k = next;
      onZoomRef.current(next);
      schedule();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [pick, router, schedule]);

  const reset = () => {
    viewRef.current = { k: 1, tx: 0, ty: 0 };
    onZoom(1);
    schedule();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex justify-end">
        <button
          onClick={reset}
          className="rounded-[0.5rem] border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Reset view
        </button>
      </div>

      <div className="relative h-[min(72dvh,720px)] overflow-hidden rounded-[1rem] border bg-card">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
        />
        {hover && (
          <div className="pointer-events-none absolute bottom-4 left-5 max-w-xs rounded-[0.75rem] border border-border/70 bg-card/90 px-3 py-2 shadow-xl backdrop-blur-xl">
            <p className="truncate text-xs font-medium">{hover.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {[hover.author, hover.year].filter(Boolean).join(" · ")}
            </p>
            <span className="mt-1 flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ background: hover.hex }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {hover.hex}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
