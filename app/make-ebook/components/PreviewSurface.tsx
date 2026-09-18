"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Chapter } from "../types";
import styles from "../styles/studio.module.css";

type DeviceId = "kindle" | "ipad" | "phone";
type ReadingMode = "page" | "scroll";

const DEVICES: Array<{
  id: DeviceId;
  label: string;
  width: number;
  height: number;
  size: number;
}> = [
  { id: "kindle", label: "Kindle", width: 420, height: 568, size: 14 },
  { id: "ipad", label: "iPad", width: 480, height: 660, size: 15 },
  { id: "phone", label: "Phone", width: 330, height: 660, size: 13.5 },
];

const PAGE_COLOURS = [
  {
    id: "white",
    label: "White page",
    page: "#f2efe7",
    ink: "#2a2a28",
    muted: "#77746b",
  },
  {
    id: "sepia",
    label: "Sepia page",
    page: "#ead9bd",
    ink: "#4a3a25",
    muted: "#8a7656",
  },
  {
    id: "dark",
    label: "Dark page",
    page: "#1e1e1c",
    ink: "#d8d4c9",
    muted: "#8e8b82",
  },
] as const;

const COLUMN_GAP = 40;

function Arrow({ direction = "right" }: { direction?: "right" | "left" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function readingPosition(chapters: Chapter[], selectedChapter: number) {
  const stripped = (ch: Chapter) =>
    (ch.content || "").replace(/<[^>]+>/g, "").length + (ch.title || "").length;
  const total = chapters.reduce((sum, ch) => sum + stripped(ch), 0);
  const before = chapters
    .slice(0, selectedChapter)
    .reduce((sum, ch) => sum + stripped(ch), 0);
  return {
    loc: Math.max(1, Math.round(before / 128)),
    percent: total > 0 ? Math.max(1, Math.round((before / total) * 100)) : 1,
  };
}

interface PreviewSurfaceProps {
  chapters: Chapter[];
  selectedChapter: number;
}

export default function PreviewSurface({
  chapters,
  selectedChapter,
}: PreviewSurfaceProps) {
  const [deviceId, setDeviceId] = useState<DeviceId>("kindle");
  const [colourId, setColourId] =
    useState<(typeof PAGE_COLOURS)[number]["id"]>("white");
  const [mode, setMode] = useState<ReadingMode>("page");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const colour = PAGE_COLOURS.find((c) => c.id === colourId) ?? PAGE_COLOURS[0];
  const chapter = chapters[selectedChapter];

  useEffect(() => {
    setPage(0);
  }, [selectedChapter, deviceId, mode]);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const columns = columnsRef.current;
    if (!viewport || !columns) return;
    const width = viewport.clientWidth;
    columns.style.columnWidth = `${width}px`;
    const total = Math.max(
      1,
      Math.round((columns.scrollWidth + COLUMN_GAP) / (width + COLUMN_GAP)),
    );
    setPageWidth(width);
    setPages(total);
    setPage((p) => Math.min(p, total - 1));
  }, []);

  useLayoutEffect(() => {
    if (mode !== "page") return;
    measure();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [mode, measure, deviceId, selectedChapter, chapters]);

  const { loc, percent } = readingPosition(chapters, selectedChapter);

  const body = chapter?.content?.trim() ? (
    <div
      className={styles.pageBody}
      dangerouslySetInnerHTML={{ __html: chapter.content }}
    />
  ) : (
    <p className={styles.previewEmpty}>Nothing in this chapter yet.</p>
  );

  const heading = (
    <>
      <p className={styles.pageChapter}>
        {chapter?.type === "frontmatter"
          ? "Front matter"
          : chapter?.type === "backmatter"
            ? "Back matter"
            : `Chapter ${selectedChapter + 1}`}
      </p>
      <p className={styles.pageTitle}>{chapter?.title || "Untitled"}</p>
    </>
  );

  return (
    <div className={styles.previewStage} data-tour="preview">
      <div
        className={styles.device}
        style={
          {
            "--device-w": `${device.width}px`,
            "--device-h": `${device.height}px`,
            "--device-ratio": `${device.width} / ${device.height}`,
            "--page-size": `${device.size}px`,
            "--page": colour.page,
            "--page-ink": colour.ink,
            "--page-muted": colour.muted,
          } as React.CSSProperties
        }
      >
        <div className={styles.screen}>
          {mode === "page" ? (
            <>
              <div ref={viewportRef} className={styles.pageViewport}>
                <div
                  ref={columnsRef}
                  className={styles.pageColumns}
                  style={{
                    transform: `translateX(${-page * (pageWidth + COLUMN_GAP)}px)`,
                  }}
                >
                  {heading}
                  {body}
                </div>
              </div>
              <button
                type="button"
                className={`${styles.turn} ${styles.turnPrev}`}
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              />
              <button
                type="button"
                className={`${styles.turn} ${styles.turnNext}`}
                aria-label="Next page"
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              />
            </>
          ) : (
            <div className={styles.pageScroll}>
              {heading}
              {body}
            </div>
          )}
          <div className={styles.pageFoot}>
            <span>{device.label}</span>
            <span>
              {mode === "page"
                ? `Page ${page + 1} of ${pages}`
                : `Loc ${loc} · ${percent}%`}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.previewControls}>
        <div className={styles.seg} role="group" aria-label="Preview device">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={deviceId === d.id}
              className={`${styles.segItem} ${deviceId === d.id ? styles.segActive : ""}`}
              onClick={() => setDeviceId(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className={styles.swatches} role="group" aria-label="Page colour">
          {PAGE_COLOURS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.label}
              aria-pressed={colourId === c.id}
              className={`${styles.swatch} ${colourId === c.id ? styles.swatchActive : ""}`}
              style={{ background: c.page }}
              onClick={() => setColourId(c.id)}
            />
          ))}
        </div>

        <div className={styles.seg} role="group" aria-label="Reading mode">
          {(["page", "scroll"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              className={`${styles.segItem} ${mode === m ? styles.segActive : ""}`}
              onClick={() => setMode(m)}
            >
              {m === "page" ? "Pages" : "Scroll"}
            </button>
          ))}
        </div>

        {mode === "page" && (
          <div className={styles.pageNav}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <Arrow direction="left" />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Next page"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            >
              <Arrow />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
