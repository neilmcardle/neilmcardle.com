"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  GripVertical,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useHydrated } from "@/lib/coverly/use-hydrated";
import type { Tuner, TunerField } from "@/lib/coverly/tuner";

const EDGE = 8;

type Pos = { x: number; y: number };

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), Math.max(lo, hi));

function readPos(key: string): Pos | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Pos>;
    if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") {
      return null;
    }
    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
}

export function TunerPanel<T extends Record<string, number>>({
  tuner,
  title,
  fields,
  pill,
  offset = 20,
  action,
}: {
  tuner: Tuner<T>;
  title: string;
  fields: TunerField<T>[];
  pill: string;
  offset?: number;
  action?: { label: string; run: () => void };
}) {
  const config = tuner.use();
  const hydrated = useHydrated();
  const posKey = `${tuner.storageKey}:pos`;

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<Pos | null>(() =>
    typeof window === "undefined" ? null : readPos(posKey),
  );
  const [dragging, setDragging] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<Pos | null>(pos);
  const movedRef = useRef(false);

  const applyPos = useCallback((next: Pos) => {
    posRef.current = next;
    setPos(next);
  }, []);

  const clampToView = useCallback((p: Pos): Pos => {
    const el = boxRef.current;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    return {
      x: clamp(p.x, EDGE, window.innerWidth - w - EDGE),
      y: clamp(p.y, EDGE, window.innerHeight - h - EDGE),
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (posRef.current) applyPos(clampToView(posRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyPos, clampToView]);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const el = boxRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;
      const origin = { x: e.clientX, y: e.clientY };

      movedRef.current = false;
      setDragging(true);
      applyPos({ x: rect.left, y: rect.top });

      const move = (ev: PointerEvent) => {
        if (
          Math.abs(ev.clientX - origin.x) > 3 ||
          Math.abs(ev.clientY - origin.y) > 3
        ) {
          movedRef.current = true;
        }
        applyPos(clampToView({ x: ev.clientX - offX, y: ev.clientY - offY }));
      };

      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        setDragging(false);
        try {
          if (posRef.current) {
            localStorage.setItem(posKey, JSON.stringify(posRef.current));
          }
        } catch {}
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
      e.preventDefault();
    },
    [applyPos, clampToView, posKey],
  );

  if (!hydrated) return null;

  const changed = fields.some((f) => config[f.key] !== tuner.defaults[f.key]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const place = pos
    ? { left: pos.x, top: pos.y }
    : { left: 20, bottom: offset };
  const grab = dragging ? "cursor-grabbing" : "cursor-grab";

  return (
    <div
      ref={boxRef}
      style={place}
      className={`fixed z-50 ${dragging ? "select-none" : ""}`}
    >
      {open ? (
        <div className="flex max-h-[calc(100dvh-2.5rem)] w-64 flex-col rounded-2xl border border-white/12 bg-neutral-900/90 p-3.5 text-white shadow-2xl backdrop-blur-xl">
          <div
            onPointerDown={startDrag}
            className={`-m-1 mb-2 flex touch-none items-center justify-between rounded-lg p-1 ${grab} hover:bg-white/5`}
          >
            <span className="flex items-center gap-1 text-xs font-semibold tracking-wide">
              <GripVertical
                className="h-3.5 w-3.5 text-white/40"
                strokeWidth={2.5}
              />
              {title}
            </span>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
            {fields.map((field) => (
              <label key={field.key} className="block">
                <span className="flex items-baseline justify-between text-[11px]">
                  <span className="font-medium text-white/85">
                    {field.label}
                  </span>
                  <span className="font-mono tabular-nums text-white/55">
                    {config[field.key]}
                    {field.unit ?? ""}
                  </span>
                </span>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={config[field.key]}
                  onChange={(e) => tuner.set(field.key, Number(e.target.value))}
                  className="dock-range mt-1.5 w-full"
                />
                <span className="mt-0.5 block text-[10px] leading-tight text-white/40">
                  {field.hint}
                </span>
              </label>
            ))}
          </div>

          {action && (
            <button
              onClick={action.run}
              className="mt-3.5 flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-[11px] font-semibold text-white hover:bg-white/20"
            >
              <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2.5} />
              {action.label}
            </button>
          )}

          <div className="mt-2.5 flex shrink-0 gap-2 border-t border-white/10 pt-3">
            <button
              onClick={copy}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[11px] font-semibold text-neutral-900 hover:bg-white/90"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
              {copied ? "Copied" : "Copy values"}
            </button>
            <button
              onClick={tuner.reset}
              disabled={!changed}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-medium text-white/80 hover:bg-white/10 disabled:cursor-default disabled:opacity-35"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
              Reset
            </button>
          </div>
        </div>
      ) : (
        <button
          onPointerDown={startDrag}
          onClick={() => {
            if (!movedRef.current) setOpen(true);
          }}
          className={`flex touch-none items-center gap-2 rounded-full border border-white/15 bg-neutral-900/80 px-3.5 py-2 text-xs font-medium text-white shadow-lg backdrop-blur hover:bg-neutral-900 ${grab}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.5} />
          {pill}
          {changed && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
      )}
    </div>
  );
}
