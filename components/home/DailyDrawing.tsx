"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DialRoot, useDialKit } from "dialkit";

const DIAL_DEFAULTS = { sharpness: 1.4, height: 0.78, peakX: 0.32, rings: 13 };
import Link from "next/link";
import styles from "./home.module.css";
import {
  CANVAS,
  buildDrawing,
  dayFromYearIndex,
  dayNumberFor,
  daysInYear,
  drawingToSvg,
  isoForDay,
  partsForDay,
  type Tweaks,
} from "./drawingEngine";

const SPREAD_MS = 620;

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DailyDrawing({ index }: { index: string }) {
  const [today, setToday] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const [draft, setDraft] = useState<string | null>(null);
  const [dialsOpen, setDialsOpen] = useState(false);

  const [variant, setVariant] = useState(0);
  const VARIANTS = 4;

  useEffect(() => {
    setToday(dayNumberFor(new Date()));
  }, []);

  const day = picked ?? today;
  const year = day === null ? null : partsForDay(day).year;

  const dial = useDialKit("Have a play", {
    sharpness: [1.4, 0.8, 2.4],
    height: [0.78, 0.35, 1],
    peakX: [0.32, 0.05, 0.95],
    rings: [13, 0, 26],
    rain: false,
  });

  const tweaks = useMemo(() => {
    const t: Tweaks = {};
    if (dial.sharpness !== DIAL_DEFAULTS.sharpness)
      t.sharpness = dial.sharpness as number;
    if (dial.height !== DIAL_DEFAULTS.height) t.height = dial.height as number;
    if (dial.peakX !== DIAL_DEFAULTS.peakX) t.peakX = dial.peakX as number;
    if (dial.rings !== DIAL_DEFAULTS.rings) t.rings = dial.rings as number;
    if (dial.rain) t.rain = true;
    return Object.keys(t).length ? t : undefined;
  }, [dial.sharpness, dial.height, dial.peakX, dial.rings, dial.rain]);

  const drawing = useMemo(
    () => (day === null ? null : buildDrawing(day, variant, tweaks)),
    [day, variant, tweaks],
  );

  const total = drawing?.layers.reduce((n, l) => n + l.strokes.length, 0) ?? 1;

  const download = useCallback(async () => {
    if (!drawing) return;
    const svg = drawingToSvg(drawing);
    const stem = `neil-mcardle-landscape-${isoForDay(drawing.dayNumber)}`;

    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("render failed"));
        img.src = url;
      });
      const size = 1600;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, size, size);
      await new Promise<void>((resolve) =>
        canvas.toBlob((png) => {
          if (png) saveBlob(png, `${stem}.png`);
          resolve();
        }, "image/png"),
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [drawing]);

  let seen = 0;

  return (
    <section className={styles.daily}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionNum} aria-hidden="true">
          {index}
        </span>
        <span className={styles.sectionLabel}>Click generate, I dare ya</span>
        <span className={styles.rule} />
      </div>

      <div className={styles.dailyGrid}>
        <div className={styles.drawingFrame}>
          {drawing ? (
            <svg
              key={`${drawing.dayNumber}-${variant}`}
              className={styles.drawingSvg}
              viewBox={`0 0 ${CANVAS} ${CANVAS}`}
              aria-label={`${drawing.system} landscape for ${isoForDay(drawing.dayNumber)}`}
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

        <div className={styles.drawingSide}>
          <div className={styles.dialSlot}>
            <button
              type="button"
              className={styles.dialToggle}
              onClick={() => setDialsOpen((o) => !o)}
              aria-expanded={dialsOpen}
              aria-label={dialsOpen ? "Hide the controls" : "Have a play"}
              title="Have a play"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
                <circle cx="16" cy="8" r="2.2" />
                <circle cx="10" cy="16" r="2.2" />
              </svg>
            </button>

            <div className={styles.dialPanel} hidden={!dialsOpen}>
              <DialRoot mode="inline" productionEnabled />
            </div>
          </div>

          <div className={styles.drawingMeta}>
            <p className={styles.metaMood}>{drawing ? drawing.system : " "}</p>
            <p className={styles.metaEyebrow}>
              {drawing && year !== null ? (
                <>
                  {year}, day{" "}
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={3}
                    className={styles.dayInput}
                    aria-label={`Day of ${year}`}
                    value={draft ?? String(drawing.index)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setDraft(raw);
                      const n = Number(raw);
                      if (raw === "" || !Number.isFinite(n) || n < 1) return;
                      setPicked(dayFromYearIndex(year, n));
                    }}
                    onBlur={() => setDraft(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setDraft(null);
                        e.currentTarget.blur();
                      }
                    }}
                  />
                  {picked !== null && (
                    <button
                      type="button"
                      className={styles.dayReset}
                      onClick={() => {
                        setPicked(null);
                        setDraft(null);
                      }}
                    >
                      today
                    </button>
                  )}
                </>
              ) : (
                "\u00a0"
              )}
            </p>

            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.iconOnlyBtn}
                onClick={() => setVariant((v) => (v + 1) % VARIANTS)}
                aria-label="Generate a variation"
                title="Generate a variation"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />
                </svg>
              </button>

              <button
                type="button"
                className={styles.iconOnlyBtn}
                onClick={download}
                disabled={!drawing}
                aria-label="Download PNG"
                title="Download PNG"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 18v2h16v-2" />
                </svg>
              </button>
            </div>

            <Link href="/daily" className={styles.tertiaryLink}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
              Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
