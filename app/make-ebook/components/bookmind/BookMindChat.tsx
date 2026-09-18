"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  BookMindAction,
  BookMindActivity,
  BookMindMessage,
  useBookMind,
} from "../../hooks/useBookMind";
import type { Chapter } from "../../types";
import BookMindMark from "./BookMindMark";
import MessageBody from "./MessageBody";
import CardRenderer, { tryParseAnalyticalResponse } from "./CardRenderer";
import ReadingView from "./ReadingView";
import { addRule } from "../../utils/bookmindMemory";
import { hasUsedTrial, markTrialUsed } from "../../utils/bookMindTrial";
import { toast } from "sonner";
import styles from "../../styles/studio.module.css";

type Mind = ReturnType<typeof useBookMind>;

interface BookMindChatProps {
  mind: Mind;
  bookId?: string;
  userId?: string;
  title?: string;
  chapters: Chapter[];
  selectedChapterIndex: number;
  selectedText?: string;
  onNavigateToChapter?: (chapterIndex: number) => void;
  onPreflight?: () => void;
  isPro: boolean;
  onUpgrade?: () => void;
}

interface Suggestion {
  label: string;
  hint: string;
  action?: BookMindAction;
  run?: () => void;
}

const COMMANDS: { cmd: string; label: string; action: BookMindAction }[] = [
  {
    cmd: "/summarise",
    label: "Summarise the book",
    action: "summarize-book",
  },
  {
    cmd: "/chapter",
    label: "Walk me through this chapter",
    action: "summarize-chapter",
  },
  {
    cmd: "/characters",
    label: "Who appears where",
    action: "list-characters",
  },
  {
    cmd: "/issues",
    label: "Find inconsistencies and plot holes",
    action: "find-inconsistencies",
  },
  { cmd: "/themes", label: "The big ideas", action: "analyze-themes" },
  {
    cmd: "/timeline",
    label: "Check the chronology",
    action: "timeline-review",
  },
  {
    cmd: "/grammar",
    label: "Check grammar in this chapter",
    action: "check-grammar",
  },
  {
    cmd: "/words",
    label: "Overused words and phrases",
    action: "word-frequency",
  },
];

const ICON = {
  plus: "M12 5v14M5 12h14",
  up: "M12 19V5M5 12l7-7 7 7",
  copy: "M9 9h11v11H9zM5 15V4h11",
  check: "M5 12.5l4.5 4.5L19 7",
  retry: "M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5",
  read: "M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z M12 6v13.5",
  remember: "M7 4h10v16l-5-3.5L7 20z",
  chevron: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  deep: "M4 12h3l2-6 3 12 3-9 2 3h3",
  chapter: "M6 4h9l3 3v13H6zM9 11h6M9 15h6",
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function chapterLabel(chapters: Chapter[], index: number) {
  const title = chapters[index]?.title?.trim();
  return title || `Chapter ${index + 1}`;
}

function describeRead(read: string[], deep: boolean) {
  if (deep && read.length > 3) return "Reading the whole book closely";
  if (read.length === 0) return "Thinking";
  if (read.length === 1) return `Reading ${read[0]}`;
  if (read.length === 2) return `Reading ${read[0]} and ${read[1]}`;
  return `Reading ${read[0]} and ${read.length - 1} more`;
}

function PendingRow({ read, deep, startedAt }: BookMindActivity) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seconds = Math.max(0, Math.round((now - startedAt) / 1000));
  return (
    <div className={styles.bmPending} role="status">
      <BookMindMark className={styles.bmPendingMark} thinking />
      <span className={styles.bmShimmer}>{describeRead(read, deep)}</span>
      {seconds > 1 && <span className={styles.bmPendingTime}>{seconds}s</span>}
    </div>
  );
}

function Steps({
  read,
  deep,
  chapters,
  onNavigate,
}: {
  read: string[];
  deep?: boolean;
  chapters: Chapter[];
  onNavigate: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  if (read.length === 0) return null;
  const label = `Read ${read.length} ${read.length === 1 ? "chapter" : "chapters"}${deep ? ", closely" : ""}`;
  return (
    <div className={styles.bmSteps}>
      <button
        type="button"
        className={styles.bmStepsBtn}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <span className={styles.bmChevron} data-open={open || undefined}>
          <Icon d={ICON.chevron} size={12} />
        </span>
      </button>
      {open && (
        <ul className={styles.bmStepsList}>
          {read.map((name, i) => {
            const index = chapters.findIndex(
              (c, j) => chapterLabel(chapters, j) === name || c.title === name,
            );
            return (
              <li key={`${name}-${i}`}>
                <span className={styles.bmStepDot} aria-hidden="true" />
                {index >= 0 ? (
                  <button type="button" onClick={() => onNavigate(index)}>
                    {name}
                  </button>
                ) : (
                  <span>{name}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActionButton({
  label,
  d,
  onClick,
}: {
  label: string;
  d: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.bmActionBtn}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon d={d} size={14} />
    </button>
  );
}

function AssistantTurn({
  message,
  chapters,
  streaming,
  isLast,
  busy,
  isPro,
  onNavigate,
  onRetry,
  onRead,
  onRemember,
}: {
  message: BookMindMessage;
  chapters: Chapter[];
  streaming: boolean;
  isLast: boolean;
  busy: boolean;
  isPro: boolean;
  onNavigate: (index: number) => void;
  onRetry: () => void;
  onRead: () => void;
  onRemember: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const structured = streaming
    ? null
    : tryParseAnalyticalResponse(message.content);
  const failed = message.content.startsWith("Something went wrong:");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className={styles.bmTurn} data-last={isLast || undefined}>
      <Steps
        read={message.meta?.read ?? []}
        deep={message.meta?.deep}
        chapters={chapters}
        onNavigate={onNavigate}
      />
      {failed ? (
        <p className={styles.bmError}>
          {message.content.replace("Something went wrong: ", "")}
        </p>
      ) : structured ? (
        <CardRenderer
          response={structured}
          chapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
          onNavigate={onNavigate}
        />
      ) : (
        <MessageBody
          content={message.content}
          chapters={chapters}
          streaming={streaming}
          onNavigate={onNavigate}
        />
      )}
      {!streaming && (
        <div className={styles.bmActions}>
          {!failed && (
            <ActionButton
              label={copied ? "Copied" : "Copy"}
              d={copied ? ICON.check : ICON.copy}
              onClick={copy}
            />
          )}
          {!busy && (
            <ActionButton label="Try again" d={ICON.retry} onClick={onRetry} />
          )}
          {isPro && !failed && (
            <ActionButton label="Open to read" d={ICON.read} onClick={onRead} />
          )}
          {isPro && !failed && (
            <ActionButton
              label="Remember this"
              d={ICON.remember}
              onClick={onRemember}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function BookMindChat({
  mind,
  bookId,
  userId,
  title,
  chapters,
  selectedChapterIndex,
  selectedText,
  onNavigateToChapter,
  onPreflight,
  isPro,
  onUpgrade,
}: BookMindChatProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    activity,
    sendMessage,
    createSession,
    currentSessionId,
    stop,
  } = mind;

  const [input, setInput] = useState("");
  const [deep, setDeep] = useState(false);
  const [attached, setAttached] = useState<string[]>([]);
  const [dismissedSelection, setDismissedSelection] = useState<string | null>(
    null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [reading, setReading] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(() =>
    hasUsedTrial(userId, bookId),
  );

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  const busy = isLoading || isStreaming;
  const trialMode = !isPro;
  const locked = trialMode && trialUsed;
  const selection =
    selectedText && selectedText !== dismissedSelection
      ? selectedText.trim()
      : "";

  useEffect(() => {
    setTrialUsed(hasUsedTrial(userId, bookId));
  }, [userId, bookId]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    const el = threadRef.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [messages, activity]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const resize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const opts = () => ({
    selectedChapterIndex,
    selectedText: selection || undefined,
    deep: deep || undefined,
    chapterIds: attached.length ? attached : undefined,
  });

  const afterSend = () => {
    pinned.current = true;
    setAttached([]);
    if (selection) setDismissedSelection(selectedText ?? null);
    if (trialMode) {
      markTrialUsed(userId, bookId);
      setTrialUsed(true);
    }
  };

  const ensureSession = () => {
    if (!currentSessionId) createSession();
  };

  const guard = () => {
    if (locked) {
      onUpgrade?.();
      return false;
    }
    return !busy && chapters.length > 0;
  };

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg || !guard()) return;
    setInput("");
    requestAnimationFrame(resize);
    ensureSession();
    const o = opts();
    afterSend();
    void sendMessage(msg, { ...o, action: "ask-question" });
  };

  const runAction = (action: BookMindAction, label: string) => {
    if (!guard()) return;
    setInput("");
    setMenuOpen(false);
    requestAnimationFrame(resize);
    ensureSession();
    const o = opts();
    afterSend();
    void sendMessage(label, { ...o, action });
  };

  const retry = (assistantId: string) => {
    if (busy) return;
    const idx = messages.findIndex((m) => m.id === assistantId);
    const user = [...messages.slice(0, idx)]
      .reverse()
      .find((m) => m.role === "user");
    if (!user) return;
    void sendMessage(user.content, {
      selectedChapterIndex,
      action: user.action ?? "ask-question",
      replaceFrom: user.id,
    });
  };

  const remember = (content: string) => {
    if (!bookId || !userId) return;
    const first =
      content.match(/^[^.!?]+[.!?]/)?.[0]?.trim() ?? content.slice(0, 80);
    const rule = window.prompt("What should Book Mind remember?", first);
    if (rule?.trim()) {
      addRule(userId, bookId, rule.trim());
      toast.success("Book Mind will remember that");
    }
  };

  const navigate = (index: number) => {
    if (index >= 0) onNavigateToChapter?.(index);
  };

  const slashQuery = input.startsWith("/")
    ? input.slice(1).toLowerCase()
    : null;
  const slashMatches =
    slashQuery === null || slashQuery.includes(" ")
      ? []
      : COMMANDS.filter(
          (c) =>
            c.cmd.slice(1).startsWith(slashQuery) ||
            (slashQuery.length > 2 &&
              c.label.toLowerCase().includes(slashQuery)),
        ).filter((c) => isPro || c.action !== "word-frequency");

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMatches.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setSlashIndex(
          (i) => (i + delta + slashMatches.length) % slashMatches.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick =
          slashMatches[Math.min(slashIndex, slashMatches.length - 1)];
        runAction(pick.action, pick.label);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setInput("");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const suggestions: Suggestion[] = isPro
    ? [
        {
          label: "Walk me through this chapter",
          hint: chapterLabel(chapters, selectedChapterIndex),
          action: "summarize-chapter",
        },
        {
          label: "Summarise the book",
          hint: "The story, themes and arcs",
          action: "summarize-book",
        },
        {
          label: "Find inconsistencies",
          hint: "Plot holes, timeline, facts",
          action: "find-inconsistencies",
        },
        {
          label: "Who is in this book",
          hint: "Who appears where",
          action: "list-characters",
        },
        ...(onPreflight
          ? [
              {
                label: "Is it ready to publish?",
                hint: "Run the Amazon pre-flight",
                run: onPreflight,
              },
            ]
          : []),
      ]
    : [
        {
          label: "Summarise the book",
          hint: "The story, themes and arcs",
          action: "summarize-book",
        },
        {
          label: "Walk me through this chapter",
          hint: chapterLabel(chapters, selectedChapterIndex),
          action: "summarize-chapter",
        },
      ];

  const visible = messages.filter(
    (m) => m.role !== "system" && (m.role === "user" || m.content.trim()),
  );
  const lastAssistantId = [...visible]
    .reverse()
    .find((m) => m.role === "assistant")?.id;
  const empty = visible.length === 0 && !activity;
  const canSend = input.trim().length > 0 && chapters.length > 0 && !busy;

  return (
    <div className={styles.bmChat}>
      <div
        ref={threadRef}
        className={styles.bmThread}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinned.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
      >
        {empty ? (
          <div className={styles.bmEmpty}>
            <BookMindMark className={styles.bmEmptyMark} />
            <h2 className={styles.bmEmptyTitle}>
              {chapters.length > 0
                ? "What shall we look at?"
                : "Open a book to begin"}
            </h2>
            {chapters.length > 0 && (
              <p className={styles.bmEmptySub}>
                {title?.trim() ? (
                  <>
                    Book Mind has read <em>{title.trim()}</em>. Ask anything, or
                    start here.
                  </>
                ) : (
                  "Book Mind has read your book. Ask anything, or start here."
                )}
                {trialMode &&
                  !locked &&
                  " You have one free question on this book."}
              </p>
            )}
            {chapters.length > 0 && !locked && (
              <ul className={styles.bmSuggest}>
                {suggestions.map((s) => (
                  <li key={s.label}>
                    <button
                      type="button"
                      onClick={() =>
                        s.run
                          ? s.run()
                          : s.action && runAction(s.action, s.label)
                      }
                    >
                      <span>{s.label}</span>
                      <span className={styles.bmSuggestHint}>{s.hint}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className={styles.bmThreadInner} aria-live="polite">
            {visible.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className={styles.bmUser}>
                  <p>{m.content}</p>
                </div>
              ) : (
                <AssistantTurn
                  key={m.id}
                  message={m}
                  chapters={chapters}
                  streaming={isStreaming && m.id === lastAssistantId}
                  isLast={m.id === lastAssistantId}
                  busy={busy}
                  isPro={isPro}
                  onNavigate={navigate}
                  onRetry={() => retry(m.id)}
                  onRead={() => setReading(m.content)}
                  onRemember={() => remember(m.content)}
                />
              ),
            )}
            {activity && <PendingRow {...activity} />}
          </div>
        )}
      </div>

      {locked ? (
        <div className={styles.bmTrial}>
          <p>You have used the free question on this book.</p>
          <button type="button" onClick={onUpgrade}>
            See Pro
          </button>
        </div>
      ) : (
        <div className={styles.bmComposerWrap}>
          {slashMatches.length > 0 && (
            <div className={styles.bmMenu} role="listbox" aria-label="Commands">
              {slashMatches.map((c, i) => (
                <button
                  key={c.cmd}
                  type="button"
                  role="option"
                  aria-selected={i === slashIndex}
                  className={styles.bmMenuItem}
                  onMouseEnter={() => setSlashIndex(i)}
                  onClick={() => runAction(c.action, c.label)}
                >
                  <span className={styles.bmMenuCmd}>{c.cmd}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}

          <div
            className={styles.bmComposer}
            onClick={(e) => {
              if (e.target === e.currentTarget) inputRef.current?.focus();
            }}
          >
            {(selection || attached.length > 0 || chapters.length > 0) && (
              <div className={styles.bmChips}>
                {chapters.length > 0 && (
                  <span
                    className={styles.bmChip}
                    title="Book Mind reads the open chapter"
                  >
                    <Icon d={ICON.chapter} size={12} />
                    {chapterLabel(chapters, selectedChapterIndex)}
                  </span>
                )}
                {attached.map((id) => {
                  const index = chapters.findIndex((c) => c.id === id);
                  if (index < 0) return null;
                  return (
                    <span key={id} className={styles.bmChip}>
                      <Icon d={ICON.chapter} size={12} />
                      {chapterLabel(chapters, index)}
                      <button
                        type="button"
                        className={styles.bmChipX}
                        aria-label="Remove"
                        onClick={() =>
                          setAttached((a) => a.filter((x) => x !== id))
                        }
                      >
                        <Icon d={ICON.close} size={10} />
                      </button>
                    </span>
                  );
                })}
                {selection && (
                  <span className={`${styles.bmChip} ${styles.bmChipQuote}`}>
                    <span className={styles.bmChipText}>“{selection}”</span>
                    <button
                      type="button"
                      className={styles.bmChipX}
                      aria-label="Remove selection"
                      onClick={() =>
                        setDismissedSelection(selectedText ?? null)
                      }
                    >
                      <Icon d={ICON.close} size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}

            <textarea
              ref={inputRef}
              className={styles.bmInput}
              rows={1}
              value={input}
              disabled={chapters.length === 0}
              placeholder={
                chapters.length > 0
                  ? "Ask about your book, or type / for commands"
                  : "Open a book first"
              }
              aria-label="Ask Book Mind"
              onChange={(e) => {
                setInput(e.target.value);
                setSlashIndex(0);
                resize();
              }}
              onKeyDown={onKeyDown}
            />

            <div className={styles.bmTools}>
              <div ref={menuRef} className={styles.bmPlusWrap}>
                <button
                  type="button"
                  className={styles.bmToolBtn}
                  aria-label="Add context"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                  disabled={chapters.length === 0}
                >
                  <Icon d={ICON.plus} />
                </button>
                {menuOpen && (
                  <div className={`${styles.bmMenu} ${styles.bmPlusMenu}`}>
                    <p className={styles.bmMenuLabel}>Add a chapter</p>
                    <div className={styles.bmMenuScroll}>
                      {chapters.map((c, i) => {
                        const on = attached.includes(c.id);
                        const current = i === selectedChapterIndex;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className={styles.bmMenuItem}
                            disabled={current}
                            aria-pressed={on}
                            onClick={() =>
                              setAttached((a) =>
                                on ? a.filter((x) => x !== c.id) : [...a, c.id],
                              )
                            }
                          >
                            <span className={styles.bmMenuCheck}>
                              {(on || current) && (
                                <Icon d={ICON.check} size={12} />
                              )}
                            </span>
                            <span className={styles.bmMenuText}>
                              {chapterLabel(chapters, i)}
                            </span>
                            {current && (
                              <span className={styles.bmMenuHint}>Open</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className={styles.bmMenuLabel}>Ask for</p>
                    {COMMANDS.filter(
                      (c) => isPro || c.action !== "word-frequency",
                    )
                      .slice(0, 5)
                      .map((c) => (
                        <button
                          key={c.cmd}
                          type="button"
                          className={styles.bmMenuItem}
                          onClick={() => runAction(c.action, c.label)}
                        >
                          <span className={styles.bmMenuCheck} />
                          <span className={styles.bmMenuText}>{c.label}</span>
                          <span className={styles.bmMenuHint}>{c.cmd}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {isPro && (
                <button
                  type="button"
                  className={`${styles.bmToolPill} ${deep ? styles.bmToolOn : ""}`}
                  aria-pressed={deep}
                  title="Slower, reads more of the book before answering"
                  onClick={() => setDeep((d) => !d)}
                >
                  <Icon d={ICON.deep} size={14} />
                  Deep read
                </button>
              )}

              <span className={styles.bmToolsSpacer} />

              {busy ? (
                <button
                  type="button"
                  className={styles.bmStop}
                  aria-label="Stop"
                  onClick={stop}
                >
                  <span />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.bmSend}
                  aria-label="Send"
                  disabled={!canSend}
                  onClick={() => send(input)}
                >
                  <Icon d={ICON.up} />
                </button>
              )}
            </div>
          </div>
          <p className={styles.bmFine}>
            Book Mind can be wrong. Check anything you change.
          </p>
        </div>
      )}

      <ReadingView
        open={reading !== null}
        onOpenChange={(open) => !open && setReading(null)}
        content={reading ?? ""}
        bookTitle={title}
        chapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
        onNavigate={navigate}
      />
    </div>
  );
}
