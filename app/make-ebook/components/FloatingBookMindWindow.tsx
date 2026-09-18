"use client";

import React, { useEffect, useState } from "react";
import { useBookMind, type ChatSession } from "../hooks/useBookMind";
import BookMindMark from "./bookmind/BookMindMark";
import BookMindChat from "./bookmind/BookMindChat";
import type { Chapter as BookChapter } from "../types";
import { loadBookById } from "../utils/bookLibrary";
import { addRule, getMemory, removeRule } from "../utils/bookmindMemory";
import styles from "../styles/studio.module.css";

interface FloatingBookMindWindowProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "window" | "sheet";

  chapters: BookChapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;

  bookId?: string;
  userId?: string;
  title: string;
  selectedText?: string;
  onPreflight?: () => void;
  isPro?: boolean;
  onUpgrade?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}

const EXPANDED_KEY = "bookmind_expanded";

const PATHS = {
  chats: "M4 6h16M4 12h10M4 18h7",
  compose: "M12 20h8M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",
  expand: "M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7",
  collapse: "M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7",
  close: "M6 6l12 12M18 6L6 18",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
};

function BarButton({
  label,
  d,
  onClick,
  pressed,
}: {
  label: string;
  d: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      className={styles.bmIconBtn}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
    >
      <svg
        width="16"
        height="16"
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
    </button>
  );
}

function groupOf(ts: number) {
  const day = 86400000;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t = start.getTime();
  if (ts >= t) return "Today";
  if (ts >= t - day) return "Yesterday";
  if (ts >= t - 7 * day) return "Previous 7 days";
  return "Older";
}

function MemoryList({ userId, bookId }: { userId: string; bookId: string }) {
  const read = () => getMemory(loadBookById(userId, bookId)).rules;
  const [notes, setNotes] = useState<string[]>(read);
  const [draft, setDraft] = useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    addRule(userId, bookId, text);
    setDraft("");
    setNotes(read());
  };

  return (
    <div className={styles.bmListGroup}>
      <p className={styles.bmListLabel}>Memory</p>
      <p className={styles.bmMemoryHint}>
        Book Mind keeps these in mind for every answer on this book.
      </p>
      {notes.map((note) => (
        <div key={note} className={styles.bmListRow}>
          <p className={styles.bmMemoryNote}>{note}</p>
          <button
            type="button"
            className={styles.bmListDelete}
            aria-label={`Forget: ${note}`}
            onClick={() => {
              removeRule(userId, bookId, note);
              setNotes(read());
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={PATHS.close} />
            </svg>
          </button>
        </div>
      ))}
      <form
        className={styles.bmMemoryAdd}
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          className={styles.bmNoteInput}
          value={draft}
          placeholder="Add a note"
          aria-label="Add a note for Book Mind"
          onChange={(e) => setDraft(e.target.value)}
        />
      </form>
    </div>
  );
}

function ChatList({
  sessions,
  currentId,
  onPick,
  onNew,
  onDelete,
  userId,
  bookId,
}: {
  sessions: ChatSession[];
  currentId: string | null;
  onPick: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  userId?: string;
  bookId?: string;
}) {
  const sorted = [...sessions]
    .filter((s) => s.messages.length > 0 || s.id === currentId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const groups: { name: string; items: ChatSession[] }[] = [];
  for (const s of sorted) {
    const name = groupOf(s.updatedAt);
    const group = groups.find((g) => g.name === name);
    if (group) group.items.push(s);
    else groups.push({ name, items: [s] });
  }

  return (
    <div className={styles.bmList}>
      <button type="button" className={styles.bmListNew} onClick={onNew}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={PATHS.compose} />
        </svg>
        New chat
      </button>
      {groups.length === 0 ? (
        <p className={styles.bmListEmpty}>
          Conversations about this book will appear here.
        </p>
      ) : (
        groups.map((g) => (
          <div key={g.name} className={styles.bmListGroup}>
            <p className={styles.bmListLabel}>{g.name}</p>
            {g.items.map((s) => (
              <div
                key={s.id}
                className={`${styles.bmListRow} ${s.id === currentId ? styles.bmListRowCurrent : ""}`}
              >
                <button
                  type="button"
                  className={styles.bmListPick}
                  onClick={() => onPick(s.id)}
                >
                  {/^Chat \d+$/.test(s.name) ? "New chat" : s.name}
                </button>
                <button
                  type="button"
                  className={styles.bmListDelete}
                  aria-label={`Delete ${s.name}`}
                  onClick={() => onDelete(s.id)}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={PATHS.trash} />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ))
      )}
      {userId && bookId && <MemoryList userId={userId} bookId={bookId} />}
    </div>
  );
}

export default function FloatingBookMindWindow({
  isOpen,
  onClose,
  variant = "window",
  chapters,
  selectedChapter,
  onChapterSelect,
  bookId,
  userId,
  title,
  selectedText,
  onPreflight,
  isPro = false,
  onUpgrade,
  onExpandedChange,
  onBusyChange,
}: FloatingBookMindWindowProps) {
  const mind = useBookMind({ bookId, userId });
  const [listOpen, setListOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const busy = mind.isLoading || mind.isStreaming;
  const sheet = variant === "sheet";
  const docked = expanded && !sheet;

  useEffect(() => {
    try {
      setExpanded(localStorage.getItem(EXPANDED_KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (sheet) return;
    onExpandedChange?.(isOpen && expanded);
  }, [isOpen, expanded, sheet, onExpandedChange]);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (listOpen) setListOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, listOpen]);

  if (!isOpen) return null;

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(EXPANDED_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const newChat = () => {
    if (busy) mind.stop();
    mind.createSession();
    setListOpen(false);
  };

  const current = mind.chatSessions.find((s) => s.id === mind.currentSessionId);
  const heading =
    current && current.messages.length > 0 && !/^Chat \d+$/.test(current.name)
      ? current.name
      : "Book Mind";

  const frame = sheet
    ? styles.bmSheet
    : docked
      ? `${styles.bmWindow} ${styles.bmDocked}`
      : styles.bmWindow;

  return (
    <section className={frame} aria-label="Book Mind" role="dialog">
      <header className={styles.bmBar}>
        <BarButton
          label={listOpen ? "Hide chats" : "Chats"}
          d={PATHS.chats}
          pressed={listOpen}
          onClick={() => setListOpen((o) => !o)}
        />
        <div className={styles.bmBarTitle}>
          <BookMindMark className={styles.bmBarMark} thinking={busy} />
          <span>{heading}</span>
        </div>
        <div className={styles.bmBarRight}>
          <BarButton label="New chat" d={PATHS.compose} onClick={newChat} />
          {!sheet && (
            <BarButton
              label={docked ? "Float" : "Expand"}
              d={docked ? PATHS.collapse : PATHS.expand}
              onClick={toggleExpanded}
            />
          )}
          <BarButton label="Close" d={PATHS.close} onClick={onClose} />
        </div>
      </header>

      <div className={styles.bmBody}>
        <BookMindChat
          mind={mind}
          bookId={bookId}
          userId={userId}
          title={title}
          chapters={chapters}
          selectedChapterIndex={selectedChapter}
          selectedText={selectedText}
          onNavigateToChapter={onChapterSelect}
          onPreflight={onPreflight}
          isPro={isPro}
          onUpgrade={onUpgrade}
        />
        {listOpen && (
          <>
            <button
              type="button"
              className={styles.bmListScrim}
              aria-label="Close chats"
              onClick={() => setListOpen(false)}
            />
            <ChatList
              sessions={mind.chatSessions}
              currentId={mind.currentSessionId}
              onPick={(id) => {
                mind.loadSession(id);
                setListOpen(false);
              }}
              onNew={newChat}
              onDelete={mind.deleteSession}
              userId={isPro ? userId : undefined}
              bookId={bookId}
            />
          </>
        )}
      </div>
    </section>
  );
}
