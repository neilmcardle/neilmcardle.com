"use client";

import { useEffect, useRef } from "react";
import type { CoverCard } from "@/lib/coverly/queries";
import { playTick, primeTick } from "@/lib/coverly/tick";
import {
  getDockConfig,
  subscribeDock,
  useDockConfig,
} from "@/lib/coverly/dock-config";

const TWIST_EASE = 2.4;

export function rowMetrics(peak: number, height: number, anchor: number) {
  const growth = Math.max(0, height * (peak - 1));
  const top = Math.ceil(growth * anchor) + 2;
  const bottom = Math.ceil(growth * (1 - anchor)) + 4;
  return { top, bottom, total: top + height + bottom };
}

export function SimilarCovers({
  covers,
  onOpen,
  onLoad,
}: {
  covers: CoverCard[];
  onOpen: (id: string) => void;
  onLoad: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const config = useDockConfig();
  const metrics = rowMetrics(config.peak, config.height, config.anchor);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(
      row.querySelectorAll<HTMLElement>("[data-sim-item]"),
    );
    if (!items.length) return;

    let centres: number[] = [];
    let widths: number[] = [];
    let focused = -1;
    let lastX: number | null = null;

    const measure = () => {
      const rowLeft = row.getBoundingClientRect().left;
      centres = [];
      widths = [];
      for (const el of items) {
        const box = el.getBoundingClientRect();
        widths.push(box.width);
        centres.push(box.left - rowLeft + row.scrollLeft + box.width / 2);
      }
    };
    measure();

    const apply = (cursorX: number | null) => {
      if (!centres.length) return;
      const { peak, reach, curve, tilt } = getDockConfig();
      const origin =
        cursorX === null
          ? null
          : cursorX - row.getBoundingClientRect().left + row.scrollLeft;
      items.forEach((item, i) => {
        let scale = 1;
        if (origin !== null && widths[i] > 0) {
          const gap = Math.max(
            0,
            Math.abs(origin - centres[i]) - widths[i] / 2,
          );
          const away = Math.min(gap / (widths[i] * reach), 1);
          scale = 1 + (peak - 1) * Math.cos((away * Math.PI) / 2) ** curve;
        }
        const lift = peak > 1 ? (scale - 1) / (peak - 1) : 0;
        const spin = (tilt * lift ** TWIST_EASE).toFixed(2);
        item.style.transform = `scale(${scale.toFixed(3)}) rotate(${spin}deg)`;
        item.style.zIndex = String(Math.round(scale * 1000));
      });
    };

    const nearest = (cursorX: number) => {
      const origin =
        cursorX - row.getBoundingClientRect().left + row.scrollLeft;
      let best = -1;
      let bestGap = Infinity;
      for (let i = 0; i < centres.length; i++) {
        if (widths[i] <= 0) continue;
        const gap = Math.abs(origin - centres[i]) - widths[i] / 2;
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      }
      return bestGap <= 0 ? best : -1;
    };

    const move = (e: MouseEvent) => {
      lastX = e.clientX;
      apply(e.clientX);
      const over = nearest(e.clientX);
      if (over !== focused) {
        focused = over;
        if (over !== -1) playTick(getDockConfig().volume);
      }
    };
    const leave = () => {
      focused = -1;
      lastX = null;
      apply(null);
    };

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    if (observer) {
      observer.observe(row);
      for (const item of items) observer.observe(item);
    }

    const retune = () => {
      measure();
      apply(lastX);
    };
    const unsubscribe = subscribeDock(retune);

    primeTick();
    row.addEventListener("mousemove", move);
    row.addEventListener("mouseleave", leave);
    row.addEventListener("load", measure, true);
    return () => {
      unsubscribe();
      observer?.disconnect();
      row.removeEventListener("mousemove", move);
      row.removeEventListener("mouseleave", leave);
      row.removeEventListener("load", measure, true);
    };
  }, [covers]);

  return (
    <div
      ref={rowRef}
      style={{
        paddingTop: metrics.top,
        paddingBottom: metrics.bottom,
        minHeight: metrics.total,
        gap: config.gap,
      }}
      className="isolate -mx-5 flex items-end overflow-x-auto overflow-y-hidden px-5"
    >
      {covers.map((cover, i) => (
        <button
          key={cover.id}
          data-sim-item
          onClick={() => onOpen(cover.id)}
          aria-label={`Open ${cover.title}`}
          style={{
            transformOrigin: `${
              i === 0 ? "left" : i === covers.length - 1 ? "right" : "center"
            } ${(config.anchor * 100).toFixed(1)}%`,
            transitionDuration: `${config.ease}ms`,
          }}
          className="group/sim relative shrink-0 rounded transition-transform ease-out will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.image_url}
            alt={cover.title}
            loading="lazy"
            onLoad={onLoad}
            style={{ height: config.height }}
            className="w-auto rounded shadow-sm"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden truncate rounded-b bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-4 text-[10px] font-medium text-white group-hover/sim:block">
            {cover.title}
          </span>
        </button>
      ))}
    </div>
  );
}
