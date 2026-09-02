"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./home.module.css";
import SiteMenu from "./SiteMenu";
import {
  CANVAS,
  buildDrawing,
  dayNumberFor,
  formatDrawingDate,
} from "./drawingEngine";

const DAYS = 30;
const SPREAD_MS = 620;

export default function DailyArchive() {
  const [today, setToday] = useState<number | null>(null);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setToday(dayNumberFor(new Date()));
  }, []);

  const days =
    today === null ? [] : Array.from({ length: DAYS }, (_, i) => today - i);

  const close = useCallback(() => {
    setOpenAt(null);
    returnFocus.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) =>
      setOpenAt((n) =>
        n === null ? n : Math.min(DAYS - 1, Math.max(0, n + delta)),
      ),
    [],
  );

  useEffect(() => {
    if (openAt === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openAt, close, step]);

  return (
    <div className={styles.page}>
      <SiteMenu />

      <Link href="/" className={styles.backMark} aria-label="Back to home">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </Link>
      <div className={styles.shell}>
        <div className={styles.sectionHead}>
          <span className={styles.plus} aria-hidden="true">
            +
          </span>
          <span className={styles.sectionLabel}>The last 30 landscapes</span>
          <span className={styles.rule} />
        </div>

        <p className={styles.archiveIntro}>
          Each landscape is a pure function of its date.
        </p>

        <div className={styles.archiveGrid}>
          {days.map((d, i) => {
            const drawing = buildDrawing(d, 0);
            return (
              <button
                key={d}
                type="button"
                className={styles.archiveButton}
                aria-label={`Enlarge drawing ${drawing.index}, ${drawing.system}, ${formatDrawingDate(d)}`}
                onClick={(e) => {
                  returnFocus.current = e.currentTarget;
                  setOpenAt(i);
                }}
              >
                <div className={styles.archiveCell}>
                  <Plate day={d} className={styles.archiveStatic} static />
                  <span className={styles.archiveZoom} aria-hidden="true">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 4h6v6M10 20H4v-6M20 4l-7.5 7.5M4 20l7.5-7.5" />
                    </svg>
                  </span>
                </div>
                <p className={styles.archiveCap}>
                  {String(drawing.index).padStart(3, "0")} ·{" "}
                  {formatDrawingDate(d)}
                </p>
              </button>
            );
          })}
        </div>

        <footer className={styles.foot}>
          <span>&copy; 2026 Neil McArdle</span>
        </footer>
      </div>

      {openAt !== null && days[openAt] !== undefined ? (
        <Lightbox
          day={days[openAt]}
          atStart={openAt === 0}
          atEnd={openAt === days.length - 1}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onClose={close}
        />
      ) : null}
    </div>
  );
}

function Plate({
  day,
  className,
  static: isStatic,
}: {
  day: number;
  className: string;
  static?: boolean;
}) {
  const drawing = buildDrawing(day, 0);
  const total = drawing.layers.reduce((n, l) => n + l.strokes.length, 0) || 1;
  let seen = 0;

  return (
    <svg
      className={styles.drawingSvg}
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      aria-label={`Drawing ${drawing.index}, ${drawing.system}`}
    >
      {drawing.layers.map((layer, li) => {
        const before = seen;
        seen += layer.strokes.length;
        return (
          <g key={li} transform={layer.transform}>
            {layer.strokes.map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill={s.fill ?? "none"}
                stroke={s.stroke ?? "none"}
                strokeWidth={s.stroke ? (s.strokeWidth ?? 1.4) : 0}
                strokeLinecap="round"
                strokeLinejoin="round"
                fillOpacity={s.opacity ?? 1}
                strokeOpacity={s.strokeOpacity ?? s.opacity ?? 1}
                pathLength={isStatic || !s.stroke ? undefined : 1}
                className={
                  isStatic
                    ? undefined
                    : s.fill
                      ? styles.blockMark
                      : styles.stroke
                }
                style={
                  isStatic
                    ? undefined
                    : {
                        animationDelay: `${((before + i) / total) * SPREAD_MS}ms`,
                      }
                }
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function Lightbox({
  day,
  atStart,
  atEnd,
  onPrev,
  onNext,
  onClose,
}: {
  day: number;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawing = buildDrawing(day, 0);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`Drawing ${drawing.index}`}
      onClick={onClose}
    >
      <div
        className={styles.lightboxFrame}
        onClick={(e) => e.stopPropagation()}
      >
        <Plate key={day} day={day} className={styles.stroke} />
      </div>

      <p className={styles.lightboxCap} onClick={(e) => e.stopPropagation()}>
        <span className={styles.lightboxNum}>
          {String(drawing.index).padStart(3, "0")}
        </span>
        <span>
          {drawing.system} · {formatDrawingDate(day)}
        </span>
      </p>

      <div className={styles.lightboxBar} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.lightboxBtn}
          onClick={onPrev}
          disabled={atStart}
          aria-label="Newer landscape"
        >
          <Chevron dir="left" />
        </button>
        <button
          ref={closeRef}
          type="button"
          className={styles.lightboxBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.lightboxBtn}
          onClick={onNext}
          disabled={atEnd}
          aria-label="Older landscape"
        >
          <Chevron dir="right" />
        </button>
      </div>

      <p className={styles.lightboxHint}>Arrow keys to move · Esc to close</p>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
      style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
