"use client";

import { memo, useEffect, useRef } from "react";
import {
  pageSize,
  PAPER,
  strokePath,
  type Stroke,
} from "@/lib/vector-paint/drawing";
import type { VectorPaintOrientation } from "@/lib/vector-paint/products";
import styles from "../vector-paint.module.css";

const MIN_STEP = 1.5;
const MAX_POINTS = 9000;
const PEN_GRACE_MS = 1500;
const OVERDRAW = 120;

export const StrokePath = memo(function StrokePath({
  stroke,
}: {
  stroke: Stroke;
}) {
  return (
    <path
      d={strokePath(stroke.p)}
      stroke={stroke.c}
      strokeWidth={stroke.w}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
});

export function Strokes({ strokes }: { strokes: Stroke[] }) {
  return (
    <>
      {strokes.map((s, i) => (
        <StrokePath key={i} stroke={s} />
      ))}
    </>
  );
}

interface EaselProps {
  pageKey: string;
  orientation: VectorPaintOrientation;
  strokes: Stroke[];
  color: string;
  width: number;
  erasing: boolean;
  onCommit: (stroke: Stroke) => void;
  onBegin?: () => void;
  label: string;
}

export default function Easel({
  pageKey,
  orientation,
  strokes,
  color,
  width,
  erasing,
  onCommit,
  onBegin,
  label,
}: EaselProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const liveRef = useRef<SVGPathElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const points = useRef<number[]>([]);
  const lastPenAt = useRef(0);
  const touchCount = useRef(0);
  const settings = useRef({ color, width, erasing, onCommit, onBegin });
  useEffect(() => {
    settings.current = { color, width, erasing, onCommit, onBegin };
  }, [color, width, erasing, onCommit, onBegin]);

  const page = pageSize(orientation);

  useEffect(() => {
    const svg = svgRef.current;
    const live = liveRef.current;
    const cursor = cursorRef.current;
    if (!svg || !live || !cursor) return;

    const paint = () =>
      settings.current.erasing ? PAPER : settings.current.color;

    const toPage = (e: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      return [
        ((e.clientX - rect.left) / rect.width) * page.w,
        ((e.clientY - rect.top) / rect.height) * page.h,
      ];
    };

    const moveCursor = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        cursor.style.opacity = "0";
        return;
      }
      const rect = svg.getBoundingClientRect();
      const size = Math.max(6, (settings.current.width / page.w) * rect.width);
      cursor.style.width = `${size}px`;
      cursor.style.height = `${size}px`;
      cursor.style.background = settings.current.erasing
        ? "#fff"
        : settings.current.color;
      cursor.classList.toggle(styles.cursorEraser, settings.current.erasing);
      cursor.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`;
      cursor.style.opacity = "1";
    };

    const render = () => {
      live.setAttribute("d", strokePath(points.current));
    };

    const push = (e: PointerEvent) => {
      const [rx, ry] = toPage(e);
      const x = Math.min(page.w + OVERDRAW, Math.max(-OVERDRAW, rx));
      const y = Math.min(page.h + OVERDRAW, Math.max(-OVERDRAW, ry));
      const p = points.current;
      const n = p.length;
      if (n >= 2) {
        const dx = x - p[n - 2];
        const dy = y - p[n - 1];
        if (dx * dx + dy * dy < MIN_STEP * MIN_STEP) return;
      }
      p.push(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
    };

    const commit = () => {
      if (points.current.length >= 2) {
        settings.current.onCommit({
          c: paint(),
          w: settings.current.width,
          p: points.current,
        });
      }
      points.current = [];
      live.setAttribute("d", "");
    };

    const cancel = () => {
      points.current = [];
      live.setAttribute("d", "");
      activePointer.current = null;
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        touchCount.current++;
        if (touchCount.current > 1) {
          cancel();
          return;
        }
        if (Date.now() - lastPenAt.current < PEN_GRACE_MS) return;
      }
      if (e.pointerType === "pen") lastPenAt.current = Date.now();
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (activePointer.current !== null) return;
      e.preventDefault();
      activePointer.current = e.pointerId;
      svg.setPointerCapture(e.pointerId);
      settings.current.onBegin?.();
      live.setAttribute("stroke", paint());
      live.setAttribute("stroke-width", String(settings.current.width));
      points.current = [];
      push(e);
      render();
      moveCursor(e);
    };

    const move = (e: PointerEvent) => {
      moveCursor(e);
      if (e.pointerId !== activePointer.current) return;
      if (e.pointerType === "pen") lastPenAt.current = Date.now();
      const events =
        typeof e.getCoalescedEvents === "function"
          ? e.getCoalescedEvents()
          : [];
      if (events.length > 0) events.forEach(push);
      else push(e);
      if (points.current.length > MAX_POINTS) {
        const last = points.current.slice(-2);
        commit();
        points.current = last;
      }
      render();
    };

    const up = (e: PointerEvent) => {
      if (e.pointerType === "touch")
        touchCount.current = Math.max(0, touchCount.current - 1);
      if (e.pointerId !== activePointer.current) return;
      if (e.type === "pointercancel") {
        cancel();
        return;
      }
      activePointer.current = null;
      commit();
    };

    const leave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") cursor.style.opacity = "0";
    };

    svg.addEventListener("pointerdown", down);
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    svg.addEventListener("pointerleave", leave);
    return () => {
      svg.removeEventListener("pointerdown", down);
      svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerup", up);
      svg.removeEventListener("pointercancel", up);
      svg.removeEventListener("pointerleave", leave);
    };
  }, [page.w, page.h, pageKey]);

  return (
    <div className={styles.pageWrap}>
      <div
        key={pageKey}
        className={`${styles.page} ${orientation === "landscape" ? styles.landscape : ""}`}
      >
        <span className={`${styles.tape} ${styles.tapeLeft}`} />
        <span className={`${styles.tape} ${styles.tapeRight}`} />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${page.w} ${page.h}`}
          role="img"
          aria-label={label}
          style={{ cursor: "none" }}
        >
          <rect width={page.w} height={page.h} fill={PAPER} />
          <Strokes strokes={strokes} />
          <path
            ref={liveRef}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div ref={cursorRef} className={styles.cursor} aria-hidden />
    </div>
  );
}
