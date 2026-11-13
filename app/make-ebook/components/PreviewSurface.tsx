"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Chapter } from "../types";
import styles from "../styles/studio.module.css";
import { htmlToText } from "../model/text";
import { useBook } from "../providers/BookProvider";
import { shallowEqual } from "../providers/store";
import { renderBook } from "../export/render";
import { applyPreviewView, previewDocument } from "../export/preview";
import TypographyPicker from "./TypographyPicker";
import Segmented from "./Segmented";
import { tween } from "../utils/motion";
import { morph } from "../utils/surfaceMorph";

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

const READING_MODES = [
  { value: "page", label: "Pages" },
  { value: "scroll", label: "Scroll" },
] as const;

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
    htmlToText(ch.content).length + (ch.title || "").length;
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
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const meta = useBook(
    (s) => ({
      title: s.title,
      author: s.author,
      language: s.language,
      typography: s.typography,
      endnotes: s.endnotes,
      endnoteReferences: s.endnoteReferences,
    }),
    shallowEqual,
  );

  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const colour = PAGE_COLOURS.find((c) => c.id === colourId) ?? PAGE_COLOURS[0];

  const book = useMemo(
    () =>
      renderBook({
        title: meta.title,
        author: meta.author,
        blurb: "",
        publisher: "",
        pubDate: "",
        isbn: "",
        language: meta.language,
        genre: "",
        tags: [],
        coverFile: null,
        chapters,
        endnotes: meta.endnotes,
        endnoteReferences: meta.endnoteReferences,
        typography: meta.typography,
      }),
    [chapters, meta],
  );

  const view = useMemo(
    () => ({
      fontPx: device.size,
      page: colour.page,
      ink: colour.ink,
      muted: colour.muted,
      paged: mode === "page",
    }),
    [device.size, colour, mode],
  );
  const viewRef = useRef(view);
  useLayoutEffect(() => {
    viewRef.current = view;
  });

  const [docFor, setDocFor] = useState({ book, selectedChapter, view });
  if (docFor.book !== book || docFor.selectedChapter !== selectedChapter) {
    setDocFor({ book, selectedChapter, view });
  }

  const srcDoc = useMemo(
    () => previewDocument(docFor.book, docFor.selectedChapter, docFor.view),
    [docFor],
  );

  const scroller = () => frameRef.current?.contentDocument?.body ?? null;

  const measure = useCallback(() => {
    const body = scroller();
    if (!body || mode !== "page") return;
    const width = body.clientWidth || 1;
    const total = Math.max(1, Math.round(body.scrollWidth / width));
    setPages(total);
    setPage((p) => Math.min(p, total - 1));
  }, [mode]);

  useEffect(() => {
    const root = frameRef.current?.contentDocument?.documentElement;
    if (!root) return;
    applyPreviewView(root, view);
    measure();
  }, [view, measure]);

  useEffect(() => {
    setPage(0);
  }, [selectedChapter, deviceId, mode, srcDoc]);

  useEffect(() => {
    const body = scroller();
    if (!body || mode !== "page") return;
    const from = body.scrollLeft;
    const to = page * body.clientWidth;
    if (from === to) return;
    return tween(400, (t) => {
      body.scrollLeft = from + (to - from) * t;
    });
  }, [page, mode]);

  const loaded = () => {
    const root = frameRef.current?.contentDocument?.documentElement;
    if (root) applyPreviewView(root, viewRef.current);
    measure();
    setReady(true);
  };

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [measure]);

  const { loc, percent } = readingPosition(chapters, selectedChapter);

  return (
    <div
      className={styles.previewStage}
      data-tour="preview"
      data-preview-ready={ready ? "" : undefined}
    >
      <div
        className={styles.device}
        data-vt="page"
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
          <iframe
            ref={frameRef}
            className={styles.pageFrame}
            title={`Preview of ${book.chapters[selectedChapter]?.title ?? "this chapter"}`}
            sandbox="allow-same-origin"
            srcDoc={srcDoc}
            onLoad={loaded}
          />
          {mode === "page" && (
            <>
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

      <div className={styles.previewControls} data-vt="controls">
        <Segmented
          label="Preview device"
          options={DEVICES.map((d) => ({ value: d.id, label: d.label }))}
          value={deviceId}
          onChange={(id) => morph("device", () => setDeviceId(id))}
        />

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

        <Segmented
          label="Reading mode"
          options={READING_MODES}
          value={mode}
          onChange={setMode}
        />

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

        <TypographyPicker />
      </div>
    </div>
  );
}
