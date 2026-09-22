"use client";

import type React from "react";
import { useLayoutEffect, useRef } from "react";

export function RunMarker({
  rows,
  active,
  left = 6,
}: {
  rows: React.RefObject<Array<HTMLElement | null>>;
  active: number | null;
  left?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const marker = ref.current;
    if (!marker) return;
    const row = active === null ? null : (rows.current?.[active] ?? null);
    if (!row) {
      marker.style.opacity = "0";
      return;
    }
    const y = row.offsetTop + row.offsetHeight / 2 - 5;
    if (marker.style.opacity !== "1") {
      marker.style.transition = "none";
      marker.style.transform = `translateY(${y}px)`;
      void marker.offsetHeight;
      marker.style.transition = "";
    }
    marker.style.opacity = "1";
    marker.style.transform = `translateY(${y}px)`;
  }, [active, rows]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="spark-run-marker"
      style={{ left }}
    >
      <svg width="8" height="10" viewBox="0 0 8 10">
        <path d="M0.5 0.8v8.4a0.6 0.6 0 0 0 0.9 0.5l6.1-4.2a0.6 0.6 0 0 0 0-1L1.4 0.3a0.6 0.6 0 0 0-0.9 0.5Z" />
      </svg>
    </span>
  );
}
