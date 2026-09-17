"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { KindlePreview } from "./KindlePreview";
import {
  Stage,
  Window,
  useInView,
  useReducedMotion,
  useTimeline,
} from "./AppWindow";
import { BOOK, CHAPTERS } from "./sampleBook";
import styles from "./landing.module.css";

const IMPORTED = [
  ["1", "The pier in winter", "2,412"],
  ["2", "Letters", "1,980"],
  ["3", "Elena, twice", "2,655"],
  ["4", "What the tide keeps", "3,021"],
  ["5", "Small hours", "1,744"],
  ["6", "The spare room", "2,208"],
];

export function ImportDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [run, setRun] = useState(0);
  const step = useTimeline(
    inView,
    [500, 650, 1500, 260, 170, 170, 170, 170, 170, 220, 260],
    run,
  );
  const rowsShown = Math.max(0, Math.min(IMPORTED.length, step - 3));

  return (
    <Stage
      image="/make-ebook/brand/stages/stage-arch.jpg"
      className={styles.cardStage}
    >
      <div ref={ref} className={styles.pane}>
        <Window title="Import manuscript" className={styles.paneTall}>
          <div className={styles.paneBody}>
            <div
              className={`${styles.dropZone} ${step >= 1 ? styles.dropZoneActive : ""}`}
            >
              {step >= 1 ? (
                <span className={styles.fileChip}>
                  <span className={styles.fileIcon}>DOCX</span>
                  <span>
                    the-rainy-city.docx
                    <span className={styles.fileMeta}>
                      412 KB &middot; Word document
                    </span>
                  </span>
                </span>
              ) : (
                <span>
                  Drop a .docx, .txt or .md file, or paste your manuscript
                </span>
              )}
            </div>
            <div className={styles.progress} key={run}>
              <div
                className={styles.progressBar}
                style={{ width: step >= 2 ? "100%" : "0%" }}
              />
            </div>
            <div className={styles.progressLabel}>
              <span>
                {step >= 3
                  ? "Chapters found"
                  : step >= 2
                    ? "Reading headings"
                    : "Waiting for a file"}
              </span>
              <span>{step >= 3 ? "100%" : ""}</span>
            </div>
            {step >= 3 && (
              <p className={styles.found}>
                {BOOK.chapterCount} chapters &middot; {BOOK.wordCount} words
              </p>
            )}
            <div>
              {IMPORTED.slice(0, rowsShown).map(([n, title, words]) => (
                <div key={n} className={styles.importRow}>
                  <span className={styles.rowNum}>{n}</span>
                  <span>{title}</span>
                  <span className={styles.importWords}>{words}w</span>
                </div>
              ))}
              {step >= 10 && (
                <div className={styles.importRow}>
                  <span />
                  <span className={styles.fileMeta}>and 38 more</span>
                  <span />
                </div>
              )}
            </div>
          </div>
          <div className={styles.paneFoot}>
            <span>
              {step >= 11
                ? "Split into chapters by heading"
                : "Headings become chapters"}
            </span>
            <button
              type="button"
              className={styles.btn}
              onClick={() => setRun((r) => r + 1)}
            >
              Replay
            </button>
          </div>
        </Window>
      </div>
    </Stage>
  );
}

const TARGET =
  "The water below was the colour of pewter, and the old iron columns went down into it without a sound.";

const TAKES = [
  {
    id: "tighter",
    label: "Tighter",
    text: "Below, the pewter water took the iron columns without a sound.",
  },
  {
    id: "plainer",
    label: "Plainer",
    text: "The water under the pier was grey, and the iron columns stood in it silently.",
  },
  {
    id: "warmer",
    label: "Warmer",
    text: "Below her the water had gone the soft grey of old pewter, and the iron columns slipped into it as quietly as a held breath.",
  },
] as const;

export function RewriteDemo() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(0.45);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TAKES)[number]["id"]>("tighter");
  const [chars, setChars] = useState(0);
  const [kept, setKept] = useState<string | null>(null);
  const take = TAKES.find((t) => t.id === tab) ?? TAKES[0];
  const shown = reduced ? take.text.length : chars;

  const show = (next: boolean) => {
    setChars(0);
    setOpen(next);
  };

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    if (!open || reduced) return;
    const id = window.setInterval(() => {
      setChars((c) => {
        if (c >= take.text.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 2;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [open, tab, reduced, take.text.length]);

  const sentence = kept ? (
    <span key={kept} className={styles.replaced}>
      {kept}
    </span>
  ) : (
    <span className={open ? styles.selection : undefined}>{TARGET}</span>
  );

  return (
    <Stage
      image="/make-ebook/brand/stages/stage-manuscript.jpg"
      className={styles.cardStage}
    >
      <div ref={ref} className={styles.pane}>
        <Window title={`Chapter Forty · ${BOOK.title}`}>
          <div className={styles.rewritePanel}>
            <div className={styles.rewriteProse}>
              <p>{CHAPTERS[4].body[0]}</p>
              <p>
                Elena walked the length of the pier with her collar up and the
                manuscript held flat against her chest, its pages still warm
                from the bag. {sentence}
              </p>
            </div>
            {open ? (
              <div className={styles.takes}>
                <div className={styles.takesHead}>
                  <div
                    className={styles.seg}
                    role="group"
                    aria-label="Rewrite style"
                  >
                    {TAKES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={tab === t.id}
                        className={`${styles.segItem} ${tab === t.id ? styles.segActive : ""}`}
                        onClick={() => {
                          setChars(0);
                          setTab(t.id);
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <span className={styles.tag}>Book Mind</span>
                </div>
                <p className={styles.takeText}>{take.text.slice(0, shown)}</p>
                <div className={styles.takesFoot}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => setOpen(false)}
                  >
                    Keep mine
                  </button>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={shown < take.text.length}
                    onClick={() => {
                      setKept(take.text);
                      setOpen(false);
                    }}
                  >
                    Use this take
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.paneFoot} style={{ padding: "12px 0 0" }}>
                <span>
                  {kept
                    ? "Replaced. Your original is one click away."
                    : "Select a sentence to rewrite it."}
                </span>
                {kept ? (
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => {
                      setKept(null);
                      show(true);
                    }}
                  >
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => show(true)}
                  >
                    Rewrite selection
                  </button>
                )}
              </div>
            )}
          </div>
        </Window>
      </div>
    </Stage>
  );
}

export function PreviewDemo() {
  return (
    <Stage
      image="/make-ebook/brand/stages/stage-library.jpg"
      className={styles.cardStage}
    >
      <div className={styles.zoom}>
        <KindlePreview />
      </div>
    </Stage>
  );
}

const CHECKS = [
  {
    kind: "ok",
    text: "Title and author set",
    sub: `${BOOK.title} by ${BOOK.author}`,
  },
  {
    kind: "ok",
    text: "Cover added",
    sub: "1600 × 2560, the size KDP recommends",
  },
  { kind: "ok", text: "Language set", sub: "English (United Kingdom)" },
  {
    kind: "ok",
    text: `${BOOK.wordCount} words`,
    sub: "A plausible length for literary fiction",
  },
  {
    kind: "warn",
    text: "Chapters 12 to 19 are within 40 words of each other",
    sub: "Very even lengths can read as generated text",
  },
  {
    kind: "ok",
    text: "No placeholder metadata",
    sub: "No Untitled Book or Author Name left behind",
  },
] as const;

const DISCLOSURE = [
  {
    id: "self",
    label: "I wrote it myself",
    kdp: "Answer No. Nothing to disclose.",
  },
  {
    id: "edit",
    label: "AI helped me edit",
    kdp: "Answer No. Amazon treats editing and brainstorming help as AI-assisted, which does not need disclosing.",
  },
  {
    id: "parts",
    label: "AI drafted some passages",
    kdp: "Answer Yes, for text. Some passages were generated with AI tools and then edited by the author.",
  },
  {
    id: "most",
    label: "AI drafted most of it",
    kdp: "Answer Yes, for text. Most of the text was generated with AI tools, then selected, arranged and edited by the author.",
  },
] as const;

export function PreflightDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const step = useTimeline(inView, [450, 300, 300, 300, 300, 300, 450]);
  const [choice, setChoice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const picked = DISCLOSURE.find((d) => d.id === choice);

  const copy = async () => {
    if (!picked) return;
    try {
      await navigator.clipboard.writeText(picked.kdp);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Stage
      image="/make-ebook/brand/stages/stage-lamp.jpg"
      className={styles.cardStage}
    >
      <div ref={ref} className={styles.pane}>
        <Window
          title="Before you export"
          right={<span className={styles.tag}>Pro</span>}
          className={styles.paneTall}
        >
          <div className={styles.paneBody}>
            <ul className={styles.checks}>
              {CHECKS.slice(0, step).map((c) => (
                <li key={c.text} className={styles.check}>
                  <span
                    className={`${styles.checkIcon} ${c.kind === "ok" ? styles.ok : styles.warn}`}
                    aria-hidden="true"
                  >
                    {c.kind === "ok" ? "✓" : "!"}
                  </span>
                  <span>
                    {c.text}
                    <span className={styles.checkSub}>{c.sub}</span>
                  </span>
                </li>
              ))}
            </ul>
            {step >= 7 && (
              <div className={styles.disclosure}>
                <p className={styles.disclosureQ}>
                  Was AI used to write this book?
                </p>
                <div
                  className={styles.options}
                  role="radiogroup"
                  aria-label="AI use"
                >
                  {DISCLOSURE.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      role="radio"
                      aria-checked={choice === d.id}
                      className={`${styles.option} ${choice === d.id ? styles.optionActive : ""}`}
                      onClick={() => setChoice(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {picked && (
                  <div key={picked.id} className={styles.kdp}>
                    <p>{picked.kdp}</p>
                    <button type="button" className={styles.btn} onClick={copy}>
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.paneFoot}>
            <span>
              {step >= 6 ? "5 passed · 1 to review" : "Checking the manuscript"}
            </span>
            <button
              type="button"
              className={styles.acid}
              disabled={!picked}
              onClick={() =>
                document
                  .getElementById("export")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            >
              Continue to export
            </button>
          </div>
        </Window>
      </div>
    </Stage>
  );
}

const FORMATS = [
  {
    id: "epub",
    label: "EPUB",
    desc: "Reflowable EPUB 3, the file Kindle, Apple Books and Kobo ask for.",
    file: "the-rainy-city.epub",
    size: "1.4 MB",
    done: "Ready for Kindle, Apple Books, Kobo and Google Play Books",
  },
  {
    id: "pdf",
    label: "PDF",
    desc: "A fixed layout for proofreading on screen or printing a copy.",
    file: "the-rainy-city.pdf",
    size: "2.8 MB",
    done: "Ready to proof or print",
  },
  {
    id: "docx",
    label: "DOCX",
    desc: "A Word document with chapter headings intact, for editors and agents.",
    file: "the-rainy-city.docx",
    size: "612 KB",
    done: "Ready for your editor",
  },
] as const;

export function ExportDemo() {
  const reduced = useReducedMotion();
  const [formatId, setFormatId] =
    useState<(typeof FORMATS)[number]["id"]>("epub");
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [label, setLabel] = useState(0);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const format = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0];

  useEffect(
    () => () => timers.current.forEach((t) => window.clearTimeout(t)),
    [],
  );

  const start = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setRun((r) => r + 1);
    if (reduced) {
      setPhase("done");
      return;
    }
    setPhase("working");
    setLabel(0);
    timers.current = [
      window.setTimeout(() => setLabel(1), 700),
      window.setTimeout(() => setPhase("done"), 1500),
    ];
  };

  return (
    <Stage
      image="/make-ebook/brand/stages/stage-table.jpg"
      className={styles.cardStage}
    >
      <div className={styles.pane}>
        <Window title="Export">
          <div className={styles.paneBody}>
            <div className={styles.seg} role="group" aria-label="Format">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={formatId === f.id}
                  className={`${styles.segItem} ${formatId === f.id ? styles.segActive : ""}`}
                  onClick={() => {
                    setFormatId(f.id);
                    setPhase("idle");
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className={styles.formatDesc}>{format.desc}</p>
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Title</dt>
                <dd>{BOOK.title}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Author</dt>
                <dd>{BOOK.author}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Chapters</dt>
                <dd>{BOOK.chapterCount}</dd>
              </div>
            </dl>
            {phase === "working" && (
              <>
                <div className={styles.progress} key={run}>
                  <div
                    className={styles.progressBar}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className={styles.progressLabel}>
                  <span>
                    {label === 0
                      ? `Building ${BOOK.chapterCount} chapters`
                      : "Adding the cover and contents"}
                  </span>
                </div>
              </>
            )}
            {phase === "done" && (
              <div className={styles.fileDone}>
                <span className={styles.fileIcon}>{format.label}</span>
                <span className={styles.fileDoneText}>
                  {format.file}
                  <span className={styles.fileMeta}>
                    {format.size} &middot; {format.done}
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className={styles.paneFoot}>
            <span>Open standards, nothing locked in</span>
            <button
              type="button"
              className={styles.acid}
              onClick={start}
              disabled={phase === "working"}
            >
              {phase === "done" ? "Export again" : `Export ${format.label}`}
            </button>
          </div>
        </Window>
      </div>
    </Stage>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SOUNDS = [
  {
    id: "rain",
    label: "Rain",
    path: "M6 12l-1 3M10 12l-1 3M14 12l-1 3M5 10a4 4 0 0 1 1-7.8A5 5 0 0 1 15.5 5 3 3 0 0 1 15 10H5z",
  },
  {
    id: "waves",
    label: "Waves",
    path: "M2 8c2-2 4-2 6 0s4 2 6 0 3-1.5 4-1M2 13c2-2 4-2 6 0s4 2 6 0 3-1.5 4-1",
  },
  {
    id: "fire",
    label: "Fire",
    path: "M10 18c3 0 5-2 5-5 0-3-2-4-3-7-1 2-2 3-3 3 0-2-1-4-2-6-1 3-4 5-4 10 0 3 3 5 7 5z",
  },
] as const;

export function FocusCard() {
  const [sound, setSound] = useState<string>("rain");
  const [typewriter, setTypewriter] = useState(true);
  return (
    <Stage
      image="/make-ebook/brand/stages/stage-desk.jpg"
      className={styles.smallStage}
    >
      <Window title="Focus" className={styles.miniPane}>
        <div className={styles.paneBody}>
          <div className={styles.tiles} role="group" aria-label="Ambient sound">
            {SOUNDS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={sound === s.id}
                className={`${styles.tile} ${sound === s.id ? styles.tileActive : ""}`}
                onClick={() => setSound((cur) => (cur === s.id ? "" : s.id))}
              >
                <Icon path={s.path} />
                {s.label}
              </button>
            ))}
          </div>
          <div className={styles.switchRow}>
            <span>Typewriter mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={typewriter}
              aria-label="Typewriter mode"
              className={`${styles.switch} ${typewriter ? styles.switchOn : ""}`}
              onClick={() => setTypewriter((v) => !v)}
            />
          </div>
        </div>
      </Window>
    </Stage>
  );
}

export function OfflineCard() {
  const [online, setOnline] = useState(true);
  return (
    <Stage
      image="/make-ebook/brand/stages/stage-pencils.jpg"
      className={styles.smallStage}
    >
      <Window title="makeebook" className={styles.miniPane}>
        <div className={styles.paneBody}>
          <div className={styles.switchRow} style={{ marginTop: 0 }}>
            <span>Wi-Fi</span>
            <button
              type="button"
              role="switch"
              aria-checked={online}
              aria-label="Wi-Fi"
              className={`${styles.switch} ${online ? styles.switchOn : ""}`}
              onClick={() => setOnline((v) => !v)}
            />
          </div>
          <div className={styles.switchRow}>
            <span className={styles.saved} style={{ display: "inline-flex" }}>
              <span className={styles.savedDot} />
              Saved on this device
            </span>
            <span className={styles.fileMeta}>just now</span>
          </div>
          {!online && (
            <p className={styles.banner}>
              You are offline. Keep writing, every change is saved on this
              device.
            </p>
          )}
        </div>
      </Window>
    </Stage>
  );
}

const COVERS = [
  { id: "ink", label: "Ink", bg: "#1e1e1e", ink: "#f3efe5" },
  { id: "paper", label: "Paper", bg: "#ead9bd", ink: "#4a3a25" },
  { id: "acid", label: "Acid", bg: "#deea53", ink: "#0b0b0b" },
  { id: "slate", label: "Slate", bg: "#2f3b3a", ink: "#e9efe7" },
] as const;

export function CoverCard() {
  const [coverId, setCoverId] = useState<(typeof COVERS)[number]["id"]>("ink");
  const cover = COVERS.find((c) => c.id === coverId) ?? COVERS[0];
  return (
    <Stage
      image="/make-ebook/brand/stages/stage-lamp.jpg"
      className={styles.smallStage}
    >
      <div className={styles.coverRow}>
        <div
          className={styles.cover}
          style={
            { background: cover.bg, color: cover.ink } as React.CSSProperties
          }
        >
          <span className={styles.coverTitle}>
            The
            <br />
            Rainy
            <br />
            City
          </span>
          <span className={styles.coverAuthor}>{BOOK.author}</span>
        </div>
        <div
          className={styles.coverSwatches}
          role="group"
          aria-label="Cover colour"
        >
          {COVERS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={`${c.label} cover`}
              aria-pressed={coverId === c.id}
              className={`${styles.swatch} ${coverId === c.id ? styles.swatchActive : ""}`}
              style={{ background: c.bg, width: 22, height: 22 }}
              onClick={() => setCoverId(c.id)}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}
