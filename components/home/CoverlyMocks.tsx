"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { COVERLY_COVERS } from "./coverlyCovers";
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
      <Fan moving={moving} />
      <Views />
    </div>
  );
}

export function Wall({ moving }: { moving: boolean }) {
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
