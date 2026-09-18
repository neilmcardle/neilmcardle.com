"use client";

import React, { useEffect } from "react";
import ChapterRow from "../ChapterRow";
import ChapterSelectBar from "../ChapterSelectBar";
import { useChapterSelection } from "../../hooks/useChapterSelection";
import styles from "../../styles/studio.module.css";

interface SheetChapter {
  id: string;
  title: string;
  type: "frontmatter" | "content" | "backmatter";
  completed?: boolean;
}

interface ChaptersSheetProps {
  open: boolean;
  onClose: () => void;
  chapters: SheetChapter[];
  selectedChapter: number;
  wordCounts?: number[];
  totalWords: number;
  onSelectChapter: (index: number) => void;
  onToggleComplete?: (index: number) => void;
  onAddChapter: () => void;
  onBulkComplete: (ids: Set<string>, completed: boolean) => void;
  onBulkDelete: (ids: Set<string>, done: () => void) => void;
}

function numberLabels(chapters: SheetChapter[]) {
  let n = 0;
  return chapters.map((c) => {
    if (c.type === "frontmatter") return "FM";
    if (c.type === "backmatter") return "BM";
    n += 1;
    return String(n);
  });
}

export default function ChaptersSheet({
  open,
  onClose,
  chapters,
  selectedChapter,
  wordCounts,
  totalWords,
  onSelectChapter,
  onToggleComplete,
  onAddChapter,
  onBulkComplete,
  onBulkDelete,
}: ChaptersSheetProps) {
  const selection = useChapterSelection(chapters.map((c) => c.id));
  const { stop } = selection;

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, stop]);

  const completed = chapters.filter((c) => c.completed).length;
  const labels = numberLabels(chapters);

  return (
    <div
      className="fixed inset-0 z-[120]"
      style={{ visibility: open ? "visible" : "hidden" }}
      role="dialog"
      aria-modal="true"
      aria-label="Chapters"
    >
      <button
        aria-label="Close chapters"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 w-full bg-black/55 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute left-0 right-0 bottom-0 max-h-[80vh] flex flex-col rounded-t-[20px] bg-[var(--ink-panel)] border-t border-[var(--rule)] shadow-[0_-12px_32px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chapters"
          className="flex justify-center py-3 flex-shrink-0"
        >
          <span className="w-9 h-1 rounded-full bg-[var(--ink-hover)]" />
        </button>

        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <div className="min-w-0">
            <div className={styles.panelTitle}>Chapters</div>
            <div className="font-mono text-[11px] text-[var(--clay-muted)] mt-1">
              {completed} of {chapters.length} complete &middot;{" "}
              {totalWords.toLocaleString()} words
            </div>
          </div>
          <div className={styles.panelActions}>
            {chapters.length > 1 && (
              <button
                type="button"
                className={styles.textButton}
                onClick={selection.active ? selection.stop : selection.start}
              >
                {selection.active ? "Done" : "Select"}
              </button>
            )}
            {!selection.active && (
              <button
                type="button"
                onClick={onAddChapter}
                aria-label="Add chapter"
                className={styles.mobileIconBtn}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-3 flex-shrink-0">
          {selection.active && (
            <ChapterSelectBar
              selection={selection}
              onComplete={onBulkComplete}
              onDelete={onBulkDelete}
            />
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-4">
          {chapters.map((chapter, i) => (
            <ChapterRow
              key={chapter.id}
              numberLabel={labels[i]}
              title={chapter.title?.trim() || "Untitled"}
              words={wordCounts?.[i]}
              current={i === selectedChapter}
              completed={!!chapter.completed}
              selecting={selection.active}
              checked={selection.selected.has(chapter.id)}
              onOpen={() => onSelectChapter(i)}
              onToggleSelect={() => selection.toggle(chapter.id)}
              onToggleComplete={
                onToggleComplete ? () => onToggleComplete(i) : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
