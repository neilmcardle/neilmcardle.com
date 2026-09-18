"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { COVERLY_COVERS, COVERLY_PALETTE } from "./coverlyCovers";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "@/app/coverly/logomark";
import { motionEnabled, subscribeMotion } from "./motion";
import styles from "./home.module.css";

const COLUMNS = [
  { dir: "up", duration: 150 },
  { dir: "down", duration: 128 },
  { dir: "up", duration: 172 },
  { dir: "down", duration: 140 },
  { dir: "up", duration: 160 },
  { dir: "down", duration: 134 },
  { dir: "up", duration: 182 },
  { dir: "down", duration: 146 },
] as const;

const FAN = [
  { rotate: -20, x: -124, y: 12 },
  { rotate: -10, x: -63, y: -1 },
  { rotate: 0, x: 0, y: -10 },
  { rotate: 10, x: 63, y: -1 },
  { rotate: 20, x: 124, y: 12 },
];

function hsl(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, l };
  const d = max - min;
  let hue = 0;
  if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return { h: hue * 60, l };
}

const subscribeToNothing = () => () => {};

export default function CoverlyMocks() {
  const moving = useSyncExternalStore(
    subscribeMotion,
    motionEnabled,
    () => true,
  );

  return (
    <div className={styles.cvStack}>
      <Wall moving={moving} />
      <Ribbon />
      <Fan moving={moving} />
      <Views />
    </div>
  );
}

function Wall({ moving }: { moving: boolean }) {
  const columns = useMemo(() => {
    const cols: (typeof COVERLY_COVERS)[] = COLUMNS.map(() => []);
    COVERLY_COVERS.slice(0, 32).forEach((cover, i) => {
      cols[i % COLUMNS.length].push(cover);
    });
    return cols;
  }, []);

  return (
    <div className={styles.cvWall}>
      <div className={styles.cvField} data-still={moving ? undefined : "true"}>
        {columns.map((column, i) => (
          <div
            key={i}
            className={`${styles.cvColumn} ${COLUMNS[i].dir === "up" ? styles.cvUp : styles.cvDown}`}
            style={{ animationDuration: `${COLUMNS[i].duration}s` }}
          >
            {[...column, ...column, ...column].map((cover, j) => (
              <span
                key={`${i}-${j}`}
                className={styles.cvWallCover}
                style={{
                  backgroundImage: `url(${cover.src})`,
                  backgroundColor: cover.color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <span className={styles.cvVignette} aria-hidden="true" />
      <span className={styles.cvLockup}>
        <svg viewBox={LOGOMARK_VIEWBOX} aria-hidden="true">
          <path d={LOGOMARK_PATH} fill="currentColor" />
        </svg>
        <span>coverly</span>
      </span>
    </div>
  );
}

function Ribbon() {
  const [hover, setHover] = useState(Math.floor(COVERLY_PALETTE.length * 0.42));

  const stripes = useMemo(
    () =>
      COVERLY_PALETTE.map((color) => ({ color, hue: hsl(color).h })).sort(
        (a, b) => a.hue - b.hue,
      ),
    [],
  );
  const covers = useMemo(
    () =>
      COVERLY_COVERS.map((cover) => ({ cover, hue: hsl(cover.color).h })).sort(
        (a, b) => a.hue - b.hue,
      ),
    [],
  );

  const active = covers.reduce((best, item) =>
    Math.abs(item.hue - stripes[hover].hue) <
    Math.abs(best.hue - stripes[hover].hue)
      ? item
      : best,
  );
  const left = ((hover + 0.5) / stripes.length) * 100;

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const next = Math.min(
      stripes.length - 1,
      Math.max(0, Math.floor(ratio * stripes.length)),
    );
    if (next !== hover) setHover(next);
  };

  return (
    <div className={styles.cvRibbonTile}>
      <div className={styles.cvShelf}>
        <span
          key={active.cover.src}
          className={styles.cvPulled}
          style={{
            left: `${left}%`,
            backgroundImage: `url(${active.cover.src})`,
            backgroundColor: active.cover.color,
          }}
          role="img"
          aria-label={`${active.cover.title} by ${active.cover.author}`}
        />
      </div>
      <div
        className={styles.cvRibbon}
        role="img"
        aria-label="Book covers ordered by hue"
        onPointerDown={pick}
        onPointerMove={pick}
      >
        {stripes.map((stripe, i) => (
          <span
            key={`${stripe.color}-${i}`}
            className={`${styles.cvStripe} ${hover === i ? styles.cvStripeUp : ""}`}
            style={{ background: stripe.color }}
          />
        ))}
      </div>
      <p className={styles.cvCaption} aria-live="polite">
        <span className={styles.cvCaptionTitle}>{active.cover.title}</span>
        <span>
          {active.cover.author}
          {active.cover.year ? ` · ${active.cover.year}` : ""}
        </span>
      </p>
    </div>
  );
}

function Fan({ moving }: { moving: boolean }) {
  const dealt = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const fan = useMemo(() => {
    const step = Math.floor(COVERLY_COVERS.length / 5);
    return [0, 1, 2, 3, 4].map((i) => COVERLY_COVERS[i * step]);
  }, []);

  return (
    <div className={styles.cvFan}>
      {fan.map((cover, i) => (
        <span
          key={cover.src}
          className={`${styles.cvFanCover} ${dealt && moving ? styles.cvDeal : ""}`}
          role="img"
          aria-label={`${cover.title} by ${cover.author}`}
          style={{
            backgroundImage: `url(${cover.src})`,
            backgroundColor: cover.color,
            transform: `translate(calc(-50% + ${FAN[i].x}%), calc(-50% + ${FAN[i].y}%)) rotate(${FAN[i].rotate}deg)`,
            zIndex: i === 2 ? 3 : i === 1 || i === 3 ? 2 : 1,
            animationDelay: `${Math.abs(i - 2) * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}

function Views() {
  const [view, setView] = useState<"grid" | "shelf">("shelf");
  const grid = COVERLY_COVERS.slice(8, 20);
  const shelves = [COVERLY_COVERS.slice(20, 26), COVERLY_COVERS.slice(26, 32)];

  return (
    <div className={styles.cvViews}>
      <div className={styles.cvSeg} role="group" aria-label="View">
        {(["grid", "shelf"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            className={`${styles.cvSegItem} ${view === option ? styles.cvSegOn : ""}`}
            onClick={() => setView(option)}
          >
            {option === "grid" ? "Grid" : "Bookshelf"}
          </button>
        ))}
      </div>
      <div className={styles.cvViewsBody}>
        {view === "grid" ? (
          <div className={styles.cvGrid}>
            {grid.map((cover) => (
              <span
                key={cover.src}
                className={styles.cvViewCover}
                style={{
                  backgroundImage: `url(${cover.src})`,
                  backgroundColor: cover.color,
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.cvShelves}>
            {shelves.map((row, r) => (
              <div key={r} className={styles.cvShelfRow}>
                {row.map((cover, i) => (
                  <span
                    key={cover.src}
                    className={styles.cvViewCover}
                    style={{
                      width: `${12 + ((i * 5 + r * 3) % 5)}%`,
                      backgroundImage: `url(${cover.src})`,
                      backgroundColor: cover.color,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
