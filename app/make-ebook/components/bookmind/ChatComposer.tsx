"use client";

import React from "react";
import type { BookMindAction } from "../../hooks/useBookMind";
import type { Chapter } from "../../types";
import { COMMANDS, ICON, Icon, chapterLabel } from "./chatShared";
import styles from "../../styles/studio.module.css";

type Command = (typeof COMMANDS)[number];

interface ChatComposerProps {
  chapters: Chapter[];
  selectedChapterIndex: number;
  selection: string;
  selectedText?: string;
  attached: string[];
  setAttached: React.Dispatch<React.SetStateAction<string[]>>;
  setDismissedSelection: (value: string | null) => void;
  input: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  slashMatches: Command[];
  slashIndex: number;
  setSlashIndex: (index: number) => void;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPro: boolean;
  deep: boolean;
  setDeep: React.Dispatch<React.SetStateAction<boolean>>;
  busy: boolean;
  canSend: boolean;
  onSend: () => void;
  onStop: () => void;
  onRunAction: (action: BookMindAction, label: string) => void;
}

export default function ChatComposer({
  chapters,
  selectedChapterIndex,
  selection,
  selectedText,
  attached,
  setAttached,
  setDismissedSelection,
  input,
  inputRef,
  menuRef,
  onInputChange,
  onKeyDown,
  slashMatches,
  slashIndex,
  setSlashIndex,
  menuOpen,
  setMenuOpen,
  isPro,
  deep,
  setDeep,
  busy,
  canSend,
  onSend,
  onStop,
  onRunAction,
}: ChatComposerProps) {
  return (
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
              onClick={() => onRunAction(c.action, c.label)}
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
                  onClick={() => setDismissedSelection(selectedText ?? null)}
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
          onChange={(e) => onInputChange(e.target.value)}
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
                          {(on || current) && <Icon d={ICON.check} size={12} />}
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
                {COMMANDS.filter((c) => isPro || c.action !== "word-frequency")
                  .slice(0, 5)
                  .map((c) => (
                    <button
                      key={c.cmd}
                      type="button"
                      className={styles.bmMenuItem}
                      onClick={() => onRunAction(c.action, c.label)}
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
              onClick={onStop}
            >
              <span />
            </button>
          ) : (
            <button
              type="button"
              className={styles.bmSend}
              aria-label="Send"
              disabled={!canSend}
              onClick={onSend}
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
  );
}
