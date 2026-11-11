"use client";

import React, { useEffect, useState } from "react";
import EmptyStateHint from "../EmptyStateHint";
import ChapterRow from "../ChapterRow";
import ChapterSelectBar from "../ChapterSelectBar";
import { useChapterSelection } from "../../hooks/useChapterSelection";
import styles from "../../styles/studio.module.css";
import AddChapterMenu from "./AddChapterMenu";
import ChapterRowActions from "./ChapterRowActions";
import { useBook, useBookActions } from "../../providers/BookProvider";
import { useEditor } from "../../providers/EditorProvider";
import { shallowEqual } from "../../providers/store";

interface ChaptersPanelProps {
  compact?: boolean;
  onNavigate?: () => void;
}

function HandleDragIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={`relative w-4 h-5 shrink-0 flex items-center justify-center ${
        isSelected
          ? "text-white/45 dark:text-[var(--clay-muted)]"
          : "text-gray-400 dark:text-[var(--clay-muted)]"
      }`}
      aria-hidden="true"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="14" x2="21" y2="14" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="15.4 5 12 1.5 8.6 5" />
        <polyline points="8.6 19 12 22.4 15.4 19" />
      </svg>
    </span>
  );
}

export default function ChaptersPanel({
  compact = false,
  onNavigate,
}: ChaptersPanelProps) {
  const {
    chapters,
    selectedChapter,
    dragOverIndex,
    dragItemIndex,
    ghostPillPosition,
  } = useBook(
    (s) => ({
      chapters: s.chapters,
      selectedChapter: s.selectedChapter,
      dragOverIndex: s.dragOverIndex,
      dragItemIndex: s.dragItemIndex,
      ghostPillPosition: s.ghostPillPosition,
    }),
    shallowEqual,
  );
  const chapterStats = useEditor((s) => s.bookStats.chapterStats);
  const chapterWordCounts = chapterStats.map((c) => c.wordCount);
  const actions = useBookActions();
  const {
    handleAddChapter,
    handleRemoveChapter,
    confirmChapterDelete,
    handleToggleChapterLock,
    handleToggleChapterComplete,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getContentChapterNumber,
    handleBulkComplete: onBulkComplete,
    handleBulkDelete: onBulkDelete,
  } = actions;
  const handleSelectChapter = (index: number) => {
    actions.handleSelectChapter(index);
    onNavigate?.();
  };
  const selection = useChapterSelection(chapters.map((c) => c.id));
  const canSelect = chapters.length > 1;
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (pendingDeleteIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingDeleteIndex(null);
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-chapter-delete-confirm]")) return;
      setPendingDeleteIndex(null);
    };
    const timer = window.setTimeout(() => setPendingDeleteIndex(null), 5000);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [pendingDeleteIndex]);

  return (
    <div data-tour="chapters" className="pb-3">
      <div className={styles.panelHead}>
        {compact ? (
          <span />
        ) : (
          <span className={styles.panelTitle}>
            Chapters
            <span className={styles.panelCount}>{chapters.length}</span>
          </span>
        )}
        <div className={styles.panelActions}>
          {canSelect && (
            <button
              type="button"
              className={styles.textButton}
              onClick={selection.active ? selection.stop : selection.start}
            >
              {selection.active ? "Done" : "Select"}
            </button>
          )}
          <AddChapterMenu handleAddChapter={handleAddChapter} />
        </div>
      </div>

      <div className="space-y-2 px-2" data-testid="chapter-list">
        {chapters.length === 0 ? (
          <EmptyStateHint
            compact
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            }
            title="No chapters yet"
            description="Click the + button above to add your first chapter."
          />
        ) : (
          <>
            {selection.active ? (
              <ChapterSelectBar
                selection={selection}
                onComplete={onBulkComplete}
                onDelete={onBulkDelete}
              />
            ) : (
              <p className="text-[11px] text-[var(--clay-muted)] px-2 pb-2">
                Drag to reorder. Tap the ring to mark a chapter complete.
              </p>
            )}
            {chapters.map((ch, i) => {
              const isSelected = selectedChapter === i;
              const titleText = ch.title?.trim() || "Title";
              const wordCount = chapterWordCounts?.[i];

              const numberLabel =
                ch.type === "frontmatter"
                  ? "FM"
                  : ch.type === "backmatter"
                    ? "BM"
                    : String(getContentChapterNumber(chapters, i));
              const chapterTitle =
                titleText && titleText !== "Title" ? titleText : "Title";

              return (
                <ChapterRow
                  key={ch.id}
                  data-testid="chapter-row"
                  numberLabel={numberLabel}
                  title={chapterTitle}
                  words={wordCount}
                  current={isSelected}
                  completed={!!ch.completed}
                  selecting={selection.active}
                  checked={selection.selected.has(ch.id)}
                  dropTarget={dragOverIndex === i}
                  onOpen={() => handleSelectChapter(i)}
                  onToggleSelect={() => selection.toggle(ch.id)}
                  onToggleComplete={() => handleToggleChapterComplete(i)}
                  style={{
                    opacity:
                      dragItemIndex === i && ghostPillPosition.visible
                        ? 0.3
                        : 1,
                  }}
                  draggable={!selection.active}
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onTouchStart={(e) =>
                    !selection.active && handleTouchStart(i, e)
                  }
                  onTouchMove={(e) =>
                    !selection.active && handleTouchMove(i, e)
                  }
                  onTouchEnd={() => !selection.active && handleTouchEnd()}
                  leading={<HandleDragIcon isSelected={isSelected} />}
                  trailing={
                    <ChapterRowActions
                      ch={ch}
                      i={i}
                      isSelected={isSelected}
                      chaptersCount={chapters.length}
                      pendingDeleteIndex={pendingDeleteIndex}
                      setPendingDeleteIndex={setPendingDeleteIndex}
                      handleToggleChapterLock={handleToggleChapterLock}
                      confirmChapterDelete={confirmChapterDelete}
                      handleRemoveChapter={handleRemoveChapter}
                    />
                  }
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
