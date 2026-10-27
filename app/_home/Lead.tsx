"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import styles from "./home.module.css";

type Tile = { c: number; r: number; d: number; x: number; y: number };

type Grid = {
  cols: number;
  rows: number;
  h: number;
  img: string;
  tiles: Tile[];
};

const SPREAD = 360;
const LENGTH = 560;

export default function Lead({
  src,
  action,
  label,
  kind = "play",
  corner = "right",
  children,
}: {
  src: string;
  action: string;
  label: string;
  kind?: "play" | "look";
  corner?: "left" | "right";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const from = useRef(0);
  const keyed = useRef(false);
  const [state, setState] = useState<"shut" | "going" | "open">("shut");
  const [grid, setGrid] = useState<Grid>();

  const reveal = (event: MouseEvent<HTMLButtonElement>) => {
    const wrap = ref.current;
    if (!wrap) return;
    const box = wrap.getBoundingClientRect();
    from.current = box.height;
    keyed.current = event.detail === 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("open");
      return;
    }
    const fx = keyed.current ? 0.5 : (event.clientX - box.left) / box.width;
    const fy = keyed.current ? 0.5 : (event.clientY - box.top) / box.height;
    const cols = box.width < 480 ? 6 : 8;
    const rows = Math.max(3, Math.round((cols * box.height) / box.width));
    const ratio = box.height / box.width;
    const raw = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = (c + 0.5) / cols - fx;
        const dy = ((r + 0.5) / rows - fy) * ratio;
        const len = Math.hypot(dx, dy) || 1;
        raw.push({ c, r, len, x: dx / len, y: dy / len });
      }
    }
    const far = Math.max(...raw.map((tile) => tile.len));
    const img = event.currentTarget.querySelector("img");
    setGrid({
      cols,
      rows,
      h: box.height,
      img: img?.currentSrc || src,
      tiles: raw.map(({ c, r, len, x, y }) => ({ c, r, d: len / far, x, y })),
    });
    setState("going");
  };

  useLayoutEffect(() => {
    if (state === "shut") return;
    const wrap = ref.current;
    const inner = body.current;
    if (!wrap || !inner || !from.current) return;
    const start = from.current;
    from.current = 0;
    const video = inner.querySelector("video");
    if (video?.controls) {
      document.querySelectorAll("video").forEach((other) => {
        if (other !== video && !other.muted && !other.paused) other.pause();
      });
      video.play().catch(() => {});
    }
    if (keyed.current) {
      inner
        .querySelector<HTMLElement>("video[controls], a[href], button")
        ?.focus({ preventScroll: true });
    }
    const end = wrap.offsetHeight;
    if (state === "open" || Math.abs(end - start) < 2) return;
    wrap.animate([{ height: `${start}px` }, { height: `${end}px` }], {
      duration: 520,
      delay: 160,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fill: "backwards",
    });
  }, [state]);

  useEffect(() => {
    if (state !== "going") return;
    const timer = window.setTimeout(
      () => setState("open"),
      SPREAD + LENGTH + 40,
    );
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <div ref={ref} className={styles.lead} data-state={state}>
      {state === "shut" ? (
        <button
          type="button"
          className={styles.leadCover}
          aria-label={label}
          onClick={reveal}
        >
          <Image
            className={styles.leadImage}
            src={src}
            alt=""
            fill
            sizes="(max-width: 648px) 100vw, 600px"
          />
          <span className={styles.leadAction} data-corner={corner}>
            {kind === "play" ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L5.9 3.1a.6.6 0 0 0-.9.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2" y="2" width="5" height="5" rx="1.4" />
                <rect x="9" y="2" width="5" height="5" rx="1.4" />
                <rect x="2" y="9" width="5" height="5" rx="1.4" />
                <rect x="9" y="9" width="5" height="5" rx="1.4" />
              </svg>
            )}
            {action}
          </span>
        </button>
      ) : null}
      {state === "going" && grid ? (
        <div
          className={styles.leadTiles}
          aria-hidden="true"
          style={
            {
              height: grid.h,
              "--cols": grid.cols,
              "--rows": grid.rows,
              "--spread": `${SPREAD}ms`,
              "--length": `${LENGTH}ms`,
            } as CSSProperties
          }
        >
          {grid.tiles.map((tile) => (
            <span
              key={`${tile.c}-${tile.r}`}
              className={styles.leadTile}
              style={
                {
                  "--c": tile.c,
                  "--r": tile.r,
                  "--d": tile.d,
                  "--x": tile.x,
                  "--y": tile.y,
                } as CSSProperties
              }
            >
              <img src={grid.img} alt="" decoding="sync" />
            </span>
          ))}
        </div>
      ) : null}
      <div ref={body} className={styles.leadBody} hidden={state === "shut"}>
        {children}
      </div>
    </div>
  );
}
