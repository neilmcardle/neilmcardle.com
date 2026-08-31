"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./home.module.css";
import {
  CANVAS,
  buildDrawing,
  dayFromParts,
  dayNumberFor,
  daysInMonth,
  drawingToSvg,
  formatDrawingDate,
  isoForDay,
  partsForDay,
} from "./drawingEngine";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SPREAD_MS = 620;

export default function DailyDrawing() {
  const [today, setToday] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    setToday(dayNumberFor(new Date()));
  }, []);

  const day = picked ?? today;
  const isToday = picked === null;

  const drawing = useMemo(
    () => (day === null ? null : buildDrawing(day, variant)),
    [day, variant],
  );

  const total = drawing?.layers.reduce((n, l) => n + l.strokes.length, 0) ?? 1;

  const download = useCallback(() => {
    if (!drawing) return;
    const blob = new Blob([drawingToSvg(drawing)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neil-mcardle-drawing-${isoForDay(drawing.dayNumber)}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [drawing]);

  const pick = useCallback((next: number) => {
    setPicked(next);
    setVariant(0);
  }, []);

  let seen = 0;

  return (
    <section className={styles.daily}>
      <div
        className={styles.drawingFrame}
        role="button"
        tabIndex={0}
        aria-label="Redraw this drawing with a different seed"
        onClick={() => setVariant((v) => v + 1)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setVariant((v) => v + 1);
          }
        }}
      >
        {drawing ? (
          <svg
            key={`${drawing.dayNumber}-${variant}`}
            className={styles.drawingSvg}
            viewBox={`0 0 ${CANVAS} ${CANVAS}`}
            aria-hidden="true"
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
                      strokeWidth={s.stroke ? 1.4 : 0}
                      strokeLinecap="round"
                      opacity={s.opacity ?? 1}
                      pathLength={s.stroke ? 1 : undefined}
                      className={s.fill ? styles.blockMark : styles.stroke}
                      style={{
                        animationDelay: `${((before + i) / total) * SPREAD_MS}ms`,
                      }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>

      <div className={styles.drawingMeta}>
        <div className={styles.sectionHead}>
          <span className={styles.plus} aria-hidden="true">
            +
          </span>
          <span className={styles.sectionLabel}>
            {isToday ? "Today's drawing" : "That day's drawing"}
          </span>
          <span className={styles.rule} />
        </div>

        <p className={styles.metaIndex}>
          {drawing ? String(drawing.index).padStart(3, "0") : "000"}
        </p>
        <p className={styles.metaLine}>
          {drawing ? (
            <>
              {drawing.system}, {formatDrawingDate(drawing.dayNumber)}
            </>
          ) : (
            <>&nbsp;</>
          )}
        </p>

        <div className={styles.pickRow}>
          <label className={styles.pickLabel} htmlFor="drawing-date">
            See your birthday
          </label>
          <div className={styles.pickControls}>
            <DateParts day={day} onPick={pick} />
            <button
              type="button"
              className={styles.pickBtn}
              onClick={download}
              disabled={!drawing}
            >
              Download SVG
            </button>
            {!isToday && (
              <button
                type="button"
                className={styles.pickReset}
                onClick={() => {
                  setPicked(null);
                  setVariant(0);
                }}
              >
                Back to today
              </button>
            )}
          </div>
        </div>

        <p className={styles.metaHint}>
          Click the drawing to reseed ·{" "}
          <Link href="/daily" className={styles.alsoLink}>
            See the last 30
          </Link>
        </p>
      </div>
    </section>
  );
}

function DateParts({
  day,
  onPick,
}: {
  day: number | null;
  onPick: (day: number) => void;
}) {
  if (day === null) return null;
  const { day: d, month: m, year: y } = partsForDay(day);
  const thisYear = new Date().getUTCFullYear();

  return (
    <span className={styles.dateParts}>
      <select
        aria-label="Day"
        className={styles.dateSelect}
        value={d}
        onChange={(e) => onPick(dayFromParts(y, m, Number(e.target.value)))}
      >
        {Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <select
        aria-label="Month"
        className={styles.dateSelect}
        value={m}
        onChange={(e) => onPick(dayFromParts(y, Number(e.target.value), d))}
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        className={styles.dateSelect}
        value={y}
        onChange={(e) => onPick(dayFromParts(Number(e.target.value), m, d))}
      >
        {Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i).map(
          (n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ),
        )}
      </select>
    </span>
  );
}
