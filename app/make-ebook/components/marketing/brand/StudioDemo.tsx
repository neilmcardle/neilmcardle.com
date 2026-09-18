"use client";

import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Arrow, Stage, Window, useInView, useReducedMotion } from "./AppWindow";
import { ACTIVE_CHAPTER, BOOK, CHAPTERS, countWords } from "./sampleBook";
import BookMindMark from "../../bookmind/BookMindMark";
import styles from "./landing.module.css";

type Part = string | { cite: number };
type Conversation = { q: string; steps: string[]; answer: Part[] };

const OPENING: Conversation = {
  q: "Does Chapter Forty earn its ending?",
  steps: [
    "Read Chapter Forty",
    "Read Chapter Thirty-Six",
    "Read Chapter Thirty-Nine",
  ],
  answer: [
    "Mostly, yes. The letter she lets go of was set up in ",
    { cite: 36 },
    ", so the ending reads as a decision rather than a surprise. The weaker passage is the pier. The pewter water and the silent iron columns already appear in ",
    { cite: 39 },
    " almost word for word. Cut one, or let the second time mean something new.",
  ],
};

const FOLLOW_UPS: Conversation[] = [
  {
    q: "Is the pacing even?",
    steps: [
      "Read Chapters Thirty-Six to Forty-One",
      "Compared chapter lengths",
    ],
    answer: [
      "Not quite. ",
      { cite: 38 },
      " is the shortest chapter in this stretch by a wide margin, and it sits between two long ones. That can work as a breath, but at the moment it reads as unfinished rather than deliberate.",
    ],
  },
  {
    q: "Where does Elena change?",
    steps: ["Read Chapter Forty", "Read Chapter Forty-One"],
    answer: [
      "The turn is in ",
      { cite: 40 },
      ", when she lets the wind take the letter. Everything before it circles the decision. ",
      { cite: 41 },
      " confirms it quietly: twelve hundred words, and none of them about the rain.",
    ],
  },
];

const THEMES = [
  {
    id: "white",
    label: "White page",
    swatch: "#f2efe7",
    page: "#f2efe7",
    ink: "#2a2a28",
    muted: "#77746b",
  },
  {
    id: "sepia",
    label: "Sepia page",
    swatch: "#ead9bd",
    page: "#ead9bd",
    ink: "#4a3a25",
    muted: "#8a7656",
  },
  {
    id: "dark",
    label: "Dark page",
    swatch: "#1e1e1c",
    page: "#1e1e1c",
    ink: "#d8d4c9",
    muted: "#8e8b82",
  },
] as const;

const TYPE_MS = 32;
const STEP_MS = 620;
const WORD_MS = 42;
const GAP = 40;

function tokens(parts: Part[]): Part[] {
  return parts.flatMap<Part>((part) =>
    typeof part === "string" ? part.split(/(?<=\s)/) : [part],
  );
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function freeTextReply(q: string): Conversation {
  return {
    q,
    steps: ["Read your question"],
    answer: [
      "In the editor I read your whole manuscript before answering something like that. Here I only know six chapters of The Rainy City, so try one of the questions below, or open ",
      { cite: 40 },
      " and change a line to see how the preview follows.",
    ],
  };
}

export function StudioDemo() {
  const reduced = useReducedMotion();
  const [stageRef, inView] = useInView<HTMLDivElement>(0.3);
  const [active, setActive] = useState(ACTIVE_CHAPTER);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [texts, setTexts] = useState(() => CHAPTERS.map((c) => c.body));
  const [titles, setTitles] = useState(() => CHAPTERS.map((c) => c.title));
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);
  const [themeId, setThemeId] =
    useState<(typeof THEMES)[number]["id"]>("white");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [draft, setDraft] = useState("");
  const [asked, setAsked] = useState<string[]>([]);

  const proseRef = useRef<HTMLDivElement>(null);
  const textsRef = useRef(texts);
  const threadRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef(0);
  const flashTimer = useRef(0);

  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  useEffect(() => {
    if (mode !== "edit" || !proseRef.current) return;
    proseRef.current.innerHTML = textsRef.current[active]
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");
  }, [active, mode]);

  useLayoutEffect(() => {
    if (mode !== "preview") return;
    const viewport = viewportRef.current;
    const columns = columnsRef.current;
    if (!viewport || !columns) return;
    const measure = () => {
      const width = viewport.clientWidth;
      columns.style.columnWidth = `${width}px`;
      const total = Math.max(
        1,
        Math.round((columns.scrollWidth + GAP) / (width + GAP)),
      );
      setPageWidth(width);
      setPages(total);
      setPage((p) => Math.min(p, total - 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [mode, active, texts, titles]);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => {
      setConvo(OPENING);
      setStartedAt(performance.now());
    }, 900);
    return () => window.clearTimeout(t);
  }, [inView]);

  const convoTokens = convo ? tokens(convo.answer) : [];
  const elapsed = reduced ? Number.POSITIVE_INFINITY : now - startedAt;
  const typedChars = convo
    ? Math.max(0, Math.min(convo.q.length, Math.floor(elapsed / TYPE_MS)))
    : 0;
  const stepsStart = convo ? convo.q.length * TYPE_MS + 280 : 0;
  const stepsShown = convo
    ? Math.max(
        0,
        Math.min(
          convo.steps.length,
          Math.floor((elapsed - stepsStart) / STEP_MS) + 1,
        ),
      )
    : 0;
  const answerStart = convo
    ? stepsStart + convo.steps.length * STEP_MS + 160
    : 0;
  const tokensShown = convo
    ? Math.max(
        0,
        Math.min(
          convoTokens.length,
          Math.floor((elapsed - answerStart) / WORD_MS),
        ),
      )
    : 0;
  const done = !!convo && tokensShown >= convoTokens.length;

  useEffect(() => {
    if (!convo || reduced || done) return;
    let frame = 0;
    const tick = () => {
      setNow(performance.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [convo, reduced, done]);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [tokensShown, stepsShown]);

  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
      window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const ask = (next: Conversation) => {
    setConvo(next);
    setStartedAt(performance.now());
    setNow(performance.now());
  };

  const onInput = () => {
    const el = proseRef.current;
    if (!el) return;
    const paragraphs = el.innerText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    setTexts((prev) =>
      prev.map((body, i) => (i === active ? paragraphs : body)),
    );
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaving(false), 700);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    document.execCommand(
      "insertText",
      false,
      e.clipboardData.getData("text/plain"),
    );
  };

  const openChapter = (n: number) => {
    const index = CHAPTERS.findIndex((c) => c.n === n);
    if (index < 0) return;
    setActive(index);
    setPage(0);
    setMode("edit");
    setFlash(index);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 1400);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q || !done) return;
    setDraft("");
    const match = FOLLOW_UPS.find((f) => f.q.toLowerCase() === q.toLowerCase());
    const next = match ?? freeTextReply(q);
    setConvo({ ...next, q });
    setStartedAt(performance.now() - q.length * TYPE_MS);
    setNow(performance.now());
  };

  const chapter = CHAPTERS[active];
  const words = countWords(texts[active].join(" "));
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const visibleTokens = convoTokens.slice(0, tokensShown);

  return (
    <Stage
      image="/make-ebook/brand/stages/stage-window.jpg"
      className={styles.heroStage}
    >
      <div ref={stageRef} className={styles.studioWrap}>
        <Window title={`${BOOK.title} · makeebook`} className={styles.studio}>
          <div className={styles.studioBody}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHead}>
                <p className={styles.micro}>Book</p>
                <p className={styles.bookTitle}>{BOOK.title}</p>
                <p className={styles.bookMeta}>{BOOK.author}</p>
              </div>
              <div className={styles.rows} role="list" aria-label="Chapters">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.n}
                    type="button"
                    role="listitem"
                    className={`${styles.row} ${i === active ? styles.rowActive : ""} ${flash === i ? styles.rowFlash : ""}`}
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => {
                      setActive(i);
                      setPage(0);
                    }}
                  >
                    <span className={styles.rowNum}>{c.n}</span>
                    <span className={styles.rowTitle}>
                      {titles[i] || "Untitled"}
                    </span>
                    <span
                      className={`${styles.status} ${c.status === "complete" ? styles.statusDone : ""}`}
                      aria-label={
                        c.status === "complete" ? "Complete" : "Draft"
                      }
                    />
                  </button>
                ))}
              </div>
              <div className={styles.sidebarFoot}>
                {BOOK.chapterCount} chapters &middot; {BOOK.wordCount} words
              </div>
            </aside>

            <div className={styles.editorCol}>
              <div className={styles.toolbar}>
                <div className={styles.seg} role="group" aria-label="View">
                  {(["edit", "preview"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      className={`${styles.segItem} ${mode === m ? styles.segActive : ""}`}
                      onClick={() => setMode(m)}
                    >
                      {m === "edit" ? "Edit" : "Preview"}
                    </button>
                  ))}
                </div>
                <div className={styles.toolbarRight}>
                  <span className={styles.saved} aria-live="polite">
                    <span
                      className={`${styles.savedDot} ${saving ? styles.savingDot : ""}`}
                    />
                    {saving ? "Saving" : "Saved on this device"}
                  </span>
                  <button
                    type="button"
                    className={styles.acid}
                    onClick={() =>
                      document.getElementById("export")?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  >
                    Export
                  </button>
                </div>
              </div>

              <div className={styles.canvas}>
                {mode === "edit" ? (
                  <div
                    className={`${styles.chapterPanel} ${flash === active ? styles.chapterPanelFlash : ""}`}
                  >
                    <p className={styles.chapterEyebrow}>
                      Chapter {chapter.word}
                    </p>
                    <input
                      className={styles.chapterTitle}
                      value={titles[active]}
                      aria-label="Chapter title"
                      onChange={(e) =>
                        setTitles((prev) =>
                          prev.map((t, i) =>
                            i === active ? e.target.value : t,
                          ),
                        )
                      }
                    />
                    <div
                      ref={proseRef}
                      className={styles.prose}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      role="textbox"
                      aria-multiline="true"
                      aria-label={`Chapter ${chapter.word} text`}
                      onFocus={() =>
                        document.execCommand(
                          "defaultParagraphSeparator",
                          false,
                          "p",
                        )
                      }
                      onInput={onInput}
                      onPaste={onPaste}
                    />
                  </div>
                ) : (
                  <div className={styles.previewArea}>
                    <div
                      className={styles.device}
                      style={
                        {
                          "--page": theme.page,
                          "--page-ink": theme.ink,
                          "--page-muted": theme.muted,
                        } as React.CSSProperties
                      }
                    >
                      <div className={styles.screen}>
                        <div ref={viewportRef} className={styles.pageViewport}>
                          <div
                            ref={columnsRef}
                            className={styles.pageColumns}
                            style={{
                              transform: `translateX(${-page * (pageWidth + GAP)}px)`,
                            }}
                          >
                            <p className={styles.pageChapter}>
                              Chapter {chapter.word}
                            </p>
                            <p className={styles.pageTitle}>{titles[active]}</p>
                            {texts[active].map((p, i) => (
                              <p key={`${i}-${p.slice(0, 12)}`}>{p}</p>
                            ))}
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
                          onClick={() =>
                            setPage((p) => Math.min(pages - 1, p + 1))
                          }
                        />
                        <div className={styles.pageFoot}>
                          <span>Kindle</span>
                          <span>
                            Page {page + 1} of {pages}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.previewControls}>
                      <div
                        className={styles.swatches}
                        role="group"
                        aria-label="Page colour"
                      >
                        {THEMES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            aria-label={t.label}
                            aria-pressed={themeId === t.id}
                            className={`${styles.swatch} ${themeId === t.id ? styles.swatchActive : ""}`}
                            style={{ background: t.swatch }}
                            onClick={() => setThemeId(t.id)}
                          />
                        ))}
                      </div>
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
                          onClick={() =>
                            setPage((p) => Math.min(pages - 1, p + 1))
                          }
                        >
                          <Arrow />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.canvasFoot}>
                <span>Chapter {chapter.word}</span>
                <span>{words.toLocaleString("en-GB")} words</span>
              </div>
            </div>
          </div>
        </Window>

        <Window
          title="Book Mind"
          icon={
            <BookMindMark
              className={styles.titleMark}
              thinking={!!convo && !done}
            />
          }
          right={<span className={styles.tag}>Pro</span>}
          className={styles.mind}
        >
          <div className={styles.mindBody}>
            <div ref={threadRef} className={styles.thread} aria-live="polite">
              {convo && (
                <>
                  <p className={styles.prompt}>
                    {convo.q.slice(0, typedChars)}
                    {typedChars < convo.q.length && (
                      <span className={styles.caret} />
                    )}
                  </p>
                  {convo.steps.slice(0, stepsShown).map((s, i) => {
                    const pending =
                      i === stepsShown - 1 && tokensShown === 0 && !reduced;
                    const [verb, ...rest] = s.split(" ");
                    return (
                      <p key={s} className={styles.step}>
                        <span
                          className={`${styles.stepDot} ${pending ? styles.stepPending : ""}`}
                        />
                        <b>{verb}</b> {rest.join(" ")}
                      </p>
                    );
                  })}
                  {tokensShown > 0 && (
                    <p className={styles.answer}>
                      {visibleTokens.map((token, i) =>
                        typeof token === "string" ? (
                          <span key={i}>{token}</span>
                        ) : (
                          <button
                            key={i}
                            type="button"
                            className={styles.cite}
                            onClick={() => openChapter(token.cite)}
                          >
                            Chapter{" "}
                            {CHAPTERS.find((c) => c.n === token.cite)?.word}
                          </button>
                        ),
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className={styles.composer}>
              <div className={styles.chips}>
                {FOLLOW_UPS.map((f) => (
                  <button
                    key={f.q}
                    type="button"
                    className={styles.chip}
                    disabled={!done || asked.includes(f.q)}
                    onClick={() => {
                      setAsked((prev) => [...prev, f.q]);
                      ask(f);
                    }}
                  >
                    {f.q}
                  </button>
                ))}
              </div>
              <form className={styles.inputRow} onSubmit={submit}>
                <input
                  className={styles.input}
                  value={draft}
                  placeholder="Ask about your book"
                  aria-label="Ask Book Mind"
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  className={styles.send}
                  aria-label="Send"
                  disabled={!draft.trim() || !done}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 13V3M3.5 7.5L8 3l4.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </Window>
      </div>
    </Stage>
  );
}
