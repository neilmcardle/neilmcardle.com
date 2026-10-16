"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { getImageProps } from "next/image";
import { COVERLY_COVERS } from "./coverlyCovers";
import styles from "./home.module.css";

function thumb(src: string, width: number) {
  return getImageProps({ src, alt: "", width, height: width * 1.5 }).props.src;
}

function useSeen(ref: RefObject<Element | null>) {
  const [state, setState] = useState({ seen: false, visible: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setState((current) => ({
        seen: current.seen || entry.isIntersecting,
        visible: entry.isIntersecting,
      })),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return state;
}

export default function CoverlyMocks() {
  return (
    <div className={styles.cvStack}>
      <Views />
    </div>
  );
}

function Views() {
  const [view, setView] = useState<"grid" | "shelf">("grid");
  const ref = useRef<HTMLDivElement>(null);
  const { seen } = useSeen(ref);
  const grid = COVERLY_COVERS.slice(8, 20);
  const shelves = [COVERLY_COVERS.slice(20, 26), COVERLY_COVERS.slice(26, 32)];

  return (
    <div className={styles.cvViews} ref={ref}>
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
                  backgroundImage: seen
                    ? `url(${thumb(cover.src, 64)})`
                    : undefined,
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
                      backgroundImage: seen
                        ? `url(${thumb(cover.src, 64)})`
                        : undefined,
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
