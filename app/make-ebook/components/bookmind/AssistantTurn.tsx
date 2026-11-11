"use client";

import { useState } from "react";
import type { BookMindMessage } from "../../hooks/useBookMind";
import type { Chapter } from "../../types";
import MessageBody from "./MessageBody";
import CardRenderer, { tryParseAnalyticalResponse } from "./CardRenderer";
import { ICON, Icon, chapterLabel } from "./chatShared";
import styles from "../../styles/studio.module.css";

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

export default function AssistantTurn({
  message,
  chapters,
  streaming,
  isLast,
  busy,
  isPro,
  canRemember,
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
  canRemember: boolean;
  onNavigate: (index: number) => void;
  onRetry: () => void;
  onRead: () => void;
  onRemember: (note: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const saveNote = () => {
    const text = note.trim();
    if (!text) return;
    onRemember(text);
    setNote("");
    setNoteOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
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
          {isPro && canRemember && !failed && (
            <ActionButton
              label={saved ? "Remembered" : "Remember something"}
              d={saved ? ICON.check : ICON.remember}
              onClick={() => setNoteOpen((o) => !o)}
            />
          )}
        </div>
      )}
      {noteOpen && (
        <form
          className={styles.bmNote}
          onSubmit={(e) => {
            e.preventDefault();
            saveNote();
          }}
        >
          <label className={styles.bmNoteLabel} htmlFor={`note-${message.id}`}>
            Book Mind will keep this in mind for every answer on this book.
          </label>
          <div className={styles.bmNoteRow}>
            <input
              id={`note-${message.id}`}
              className={styles.bmNoteInput}
              value={note}
              autoFocus
              placeholder="e.g. Mara never swears. The book is set in 1953."
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setNoteOpen(false);
              }}
            />
            <button
              type="button"
              className={styles.bmNoteCancel}
              onClick={() => setNoteOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.bmNoteSave}
              disabled={!note.trim()}
            >
              Remember
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
