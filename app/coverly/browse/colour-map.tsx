"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hexToHsl } from "@/lib/coverly/color";
import type { MapPoint } from "./actions";

type Placed = MapPoint & { x: number; y: number };

const HUE_BANDS: { label: string; from: number; to: number }[] = [
  { label: "Red", from: 345, to: 375 },
  { label: "Orange", from: 15, to: 45 },
  { label: "Yellow", from: 45, to: 70 },
  { label: "Green", from: 70, to: 160 },
  { label: "Teal", from: 160, to: 195 },
  { label: "Blue", from: 195, to: 255 },
  { label: "Purple", from: 255, to: 290 },
  { label: "Pink", from: 290, to: 345 },
];

const IMAGE_ZOOM = 2.4;
const MAX_IMAGES = 600;
const PAD = 14;
const AXIS = 26;

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 40;

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
  selectedId,
}: {
  points: MapPoint[];
  zoom: number;
  onZoom: (z: number) => void;
  onOpen: (id: string) => void;
  selectedId: string | null;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef({ k: 1, tx: 0, ty: 0 });
  const imagesRef = useRef(new Map<string, HTMLImageElement | null>());
  const hoverRef = useRef<Placed | null>(null);
  const frameRef = useRef(0);
  const drawRef = useRef<() => void>(() => {});

  const [hover, setHover] = useState<Placed | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [atDefault, setAtDefault] = useState(true);
  const cappedRef = useRef(0);
  const [capped, setCapped] = useState(0);
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
  const tipMax = {
    w: Math.max(8, frameSize.w - 232),
    h: Math.max(8, frameSize.h - 96),
  };
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
    const ih = h - PAD - AXIS;
    const sx = (p: Placed) => PAD + p.x * iw * k + tx;
    const sy = (p: Placed) => PAD + p.y * ih * k + ty;

    const styles = getComputedStyle(canvas);
    const borderColor = styles.getPropertyValue("--coverly-border").trim();
    const inkColor = styles.getPropertyValue("--coverly-foreground").trim();
    const mutedColor = styles
      .getPropertyValue("--coverly-muted-foreground")
      .trim();
    const bgColor = styles.getPropertyValue("--coverly-card").trim();

    const hueX = (deg: number) => PAD + (deg / 360) * iw * k + tx;

    ctx.save();
    ctx.strokeStyle = borderColor || "#ddd";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (const band of HUE_BANDS) {
      const gx = Math.round(hueX(band.from)) + 0.5;
      if (gx < -1 || gx > w + 1) continue;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h - 18);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = mutedColor || "#888";
    ctx.font =
      '500 10px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textBaseline = "alphabetic";
    for (const band of HUE_BANDS) {
      const centre = hueX((band.from + band.to) / 2);
      const label = band.label;
      const half = ctx.measureText(label).width / 2;
      if (centre - half < 2 || centre + half > w - 2) continue;
      ctx.textAlign = "center";
      ctx.fillText(label, centre, h - 5);
    }
    ctx.textAlign = "left";
    ctx.fillText("Light", 4, 12);
    ctx.fillText("Dark", 4, h - 22);
    ctx.restore();

    const size = Math.max(3, 7 * Math.sqrt(k));
    const dotAlpha = Math.min(1, 0.45 + 0.22 * (k - 1));
    const showImages = k >= IMAGE_ZOOM;
    let drawn = 0;
    let skipped = 0;

    for (const p of placed) {
      const px = sx(p);
      const py = sy(p);
      if (px < -40 || px > w + 40 || py < -60 || py > h + 60) continue;

      if (showImages && drawn >= MAX_IMAGES) skipped++;
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
          ctx.shadowColor = "rgba(0,0,0,0.32)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.drawImage(cached, px - cw / 2, py - ch / 2, cw, ch);
          ctx.restore();
          continue;
        }
      }

      ctx.globalAlpha = dotAlpha;
      ctx.fillStyle = p.hex;
      ctx.beginPath();
      ctx.arc(px, py, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (cappedRef.current !== skipped) {
      cappedRef.current = skipped;
      setCapped(skipped);
    }

    const chosen = selectedId
      ? placed.find((p) => p.id === selectedId)
      : undefined;
    if (chosen) {
      const px = sx(chosen);
      const py = sy(chosen);
      const r = size / 2 + 7;
      ctx.save();
      ctx.strokeStyle = bgColor || "#fff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = inkColor || "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const hovered = hoverRef.current;
    if (hovered) {
      const px = sx(hovered);
      const py = sy(hovered);
      ctx.strokeStyle = inkColor || "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, size / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [placed, schedule, selectedId]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [schedule]);

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
      const ih = canvas.clientHeight - PAD - AXIS;
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

    const observer = new ResizeObserver(() => {
      setFrameSize({ w: canvas.clientWidth, h: canvas.clientHeight });
      schedule();
    });
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
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
        viewRef.current.tx += dx;
        viewRef.current.ty += dy;
        setAtDefault(false);
        lastX = e.clientX;
        lastY = e.clientY;
        schedule();
        return;
      }
      const found = pick(e.clientX - rect.left, e.clientY - rect.top);
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (found !== hoverRef.current) {
        hoverRef.current = found;
        setHover(found);
        schedule();
      }
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      if (moved) return;
      const rect = canvas.getBoundingClientRect();
      const found = pick(e.clientX - rect.left, e.clientY - rect.top);
      if (found) onOpenRef.current(found.id);
    };
    const onLeave = () => {
      hoverRef.current = null;
      setHover(null);
      setCursor(null);
      schedule();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const v = viewRef.current;
      const intensity = e.ctrlKey ? 0.014 : 0.0032;
      const factor = Math.exp(-e.deltaY * intensity);
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.k * factor));
      const ratio = next / v.k;
      v.tx = cx - PAD - (cx - PAD - v.tx) * ratio;
      v.ty = cy - PAD - (cy - PAD - v.ty) * ratio;
      v.k = next;
      setAtDefault(false);
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
    setAtDefault(true);
    onZoom(1);
    schedule();
  };

  if (!points.length) {
    return (
      <div className="flex h-[min(52dvh,420px)] flex-col items-center justify-center gap-1 rounded-[1rem] border border-dashed bg-card/40 text-center">
        <p className="text-sm font-medium">No covers to plot</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Nothing matches these filters. Clear one to see the colour spread
          again.
        </p>
      </div>
    );
  }

  const tip =
    hover && cursor
      ? {
          left: Math.min(Math.max(cursor.x + 16, 8), tipMax.w),
          top: Math.min(Math.max(cursor.y + 16, 8), tipMax.h),
        }
      : null;

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-end gap-3">
        {capped > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {capped.toLocaleString()} more covers here — zoom in to see them
          </span>
        )}
        <button
          onClick={reset}
          disabled={atDefault}
          className="rounded-[0.5rem] border px-2.5 py-1 text-xs text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          Reset view
        </button>
      </div>

      <div className="relative h-[min(72dvh,720px)] overflow-hidden rounded-[1rem] border bg-card">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
        />
        {hover && tip && (
          <div
            style={{ left: tip.left, top: tip.top }}
            className="pointer-events-none absolute z-10 w-56 rounded-[0.75rem] border border-border/70 bg-card/90 px-3 py-2 shadow-xl backdrop-blur-xl"
          >
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
