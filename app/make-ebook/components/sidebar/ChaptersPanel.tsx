"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon } from "../icons";
import BinIcon from "../icons/BinIcon";
import EmptyStateHint from "../EmptyStateHint";
import ChapterCompleteToggle from "../ChapterCompleteToggle";
import styles from "../../styles/studio.module.css";

interface Chapter {
  id: string;
  type: "frontmatter" | "content" | "backmatter";
  title: string;
  content: string;
  locked?: boolean;
  completed?: boolean;
  synopsis?: string;
}

interface ChaptersPanelProps {
  chapters: Chapter[];
  selectedChapter: number;
  handleSelectChapter: (index: number) => void;
  handleAddChapter: (
    type: "frontmatter" | "content" | "backmatter",
    title?: string,
  ) => void;
  handleRemoveChapter: (index: number) => void;

  confirmChapterDelete?: (index: number) => void;
  handleToggleChapterLock?: (index: number) => void;
  handleToggleChapterComplete?: (index: number) => void;
  handleDragStart: (index: number) => void;
  handleDragEnter: (index: number) => void;
  handleDragEnd: () => void;
  handleTouchStart: (index: number, e: React.TouchEvent) => void;
  handleTouchMove: (index: number, e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  dragOverIndex: number | null;
  dragItemIndex: number | null;
  ghostPillPosition: { visible: boolean; x: number; y: number };
  getContentChapterNumber: (chapters: Chapter[], index: number) => number;
  chapterWordCounts?: number[];
}

const CHAPTER_TEMPLATES = {
  frontmatter: [
    { title: "Title Page" },
    { title: "Copyright" },
    { title: "Dedication" },
    { title: "Foreword" },
    { title: "Preface" },
    { title: "Acknowledgements" },
    { title: "Introduction" },
    { title: "Prologue" },
    { title: "Custom Front Matter" },
  ],
  content: [
    { title: "Chapter" },
    { title: "Part" },
    { title: "Section" },
    { title: "Custom Chapter" },
  ],
  backmatter: [
    { title: "Epilogue" },
    { title: "Afterword" },
    { title: "Appendix" },
    { title: "Notes" },
    { title: "Glossary" },
    { title: "Bibliography" },
    { title: "Index" },
    { title: "About the Author" },
    { title: "Custom Back Matter" },
  ],
};

function HandleDragIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={`relative w-4 h-5 shrink-0 flex items-center justify-center ${
        isSelected
          ? "text-white/45 dark:text-gray-400"
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
  chapters,
  selectedChapter,
  handleSelectChapter,
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
  dragOverIndex,
  dragItemIndex,
  ghostPillPosition,
  getContentChapterNumber,
  chapterWordCounts,
}: ChaptersPanelProps) {
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
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
    <div
      data-tour="chapters"
      className="border-b border-gray-200 dark:border-[var(--rule)] pb-3"
    >
      <div className="flex items-center justify-between py-3 px-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-600 dark:text-[var(--clay-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8M16 17H8M10 9H8" />
          </svg>
          <span className="text-125 font-semibold text-gray-900 dark:text-[var(--paper)]">
            Chapters
          </span>
          <span className="text-11 text-gray-500 dark:text-[var(--clay-muted)]">
            ({chapters.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() =>
                setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)
              }
              className="flex items-center justify-center h-8 w-8 rounded-chip text-gray-500 dark:text-[var(--clay-muted)] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] hover:text-gray-700 dark:hover:text-[var(--clay)] transition-all duration-150"
              title="Add chapter"
            >
              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-[var(--clay)]" />
            </button>

            {chapterTypeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[var(--ink-panel)] rounded-card shadow-lg border border-gray-200 dark:border-[var(--rule)] z-50 py-1 max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  <div>
                    <div className="px-3 py-2 text-10 font-semibold text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-[0.08em]">
                      Front Matter
                    </div>
                    {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter(
                            "frontmatter",
                            template.title === "Custom Front Matter"
                              ? ""
                              : template.title,
                          );
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] text-125 text-gray-900 dark:text-[var(--paper)] transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="px-3 py-2 text-10 font-semibold text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-[0.08em]">
                      Main Content
                    </div>
                    {CHAPTER_TEMPLATES.content.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter(
                            "content",
                            template.title === "Custom Chapter"
                              ? ""
                              : template.title,
                          );
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] text-125 text-gray-900 dark:text-[var(--paper)] transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="px-3 py-2 text-10 font-semibold text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-[0.08em]">
                      Back Matter
                    </div>
                    {CHAPTER_TEMPLATES.backmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter(
                            "backmatter",
                            template.title === "Custom Back Matter"
                              ? ""
                              : template.title,
                          );
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] text-125 text-gray-900 dark:text-[var(--paper)] transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 px-2">
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
            <p className="text-10 text-gray-500 dark:text-[var(--clay-muted)] px-2 py-2 mb-2">
              Drag to reorder
            </p>
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
                <div
                  key={ch.id}
                  className={`group ${styles.chapterRow} ${
                    dragOverIndex === i
                      ? styles.chapterRowDrop
                      : isSelected
                        ? styles.chapterRowActive
                        : ""
                  }`}
                  style={{
                    opacity:
                      dragItemIndex === i && ghostPillPosition.visible
                        ? 0.3
                        : 1,
                  }}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onTouchStart={(e) => handleTouchStart(i, e)}
                  onTouchMove={(e) => handleTouchMove(i, e)}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => handleSelectChapter(i)}
                >
                  <HandleDragIcon isSelected={isSelected} />
                  {handleToggleChapterComplete && (
                    <ChapterCompleteToggle
                      completed={!!ch.completed}
                      selected={isSelected}
                      onToggle={() => handleToggleChapterComplete(i)}
                    />
                  )}
                  <span className={styles.chapterNum}>{numberLabel}</span>
                  <span className={styles.chapterName} title={chapterTitle}>
                    {chapterTitle}
                  </span>
                  {wordCount !== undefined && (
                    <span className={styles.chapterWords}>
                      {wordCount.toLocaleString()}
                    </span>
                  )}
                  {handleToggleChapterLock && (
                    <button
                      className={`transition-all p-2 rounded-chip flex-shrink-0 ${
                        isSelected
                          ? "text-white/70 dark:text-gray-600 hover:bg-white/15 dark:hover:bg-black/10"
                          : ch.locked
                            ? "text-gray-600 dark:text-[var(--clay)] hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
                            : "text-gray-300 dark:text-[var(--clay-muted)] hover:text-gray-600 dark:hover:text-[var(--clay)] hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleChapterLock(i);
                      }}
                      aria-label={ch.locked ? "Unlock chapter" : "Lock chapter"}
                      title={
                        ch.locked ? "Unlock chapter" : "Mark complete and lock"
                      }
                    >
                      {ch.locked ? (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0" />
                        </svg>
                      )}
                    </button>
                  )}
                  {chapters.length > 1 &&
                    !ch.locked &&
                    (pendingDeleteIndex === i ? (
                      <div
                        data-chapter-delete-confirm
                        role="group"
                        aria-label="Confirm chapter deletion"
                        className="flex items-center gap-1 animate-in fade-in zoom-in-95 slide-in-from-right-1 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="px-2 text-10 font-medium text-gray-500 dark:text-[var(--clay-muted)]">
                          Delete?
                        </span>
                        <button
                          autoFocus
                          onClick={(e) => {
                            e.stopPropagation();
                            (confirmChapterDelete ?? handleRemoveChapter)(i);
                            setPendingDeleteIndex(null);
                          }}
                          className="p-2 rounded-chip bg-red-600 hover:bg-red-700 text-white transition-colors flex-shrink-0 active:scale-[0.96]"
                          aria-label="Confirm delete"
                          title="Delete (Enter)"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeleteIndex(null);
                          }}
                          className="p-2 rounded-chip text-gray-500 hover:bg-gray-200 dark:hover:bg-[var(--rule)] transition-colors flex-shrink-0"
                          aria-label="Cancel"
                          title="Cancel (Esc)"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`transition-colors p-2 rounded-chip flex-shrink-0 ${
                          isSelected
                            ? "text-white/70 dark:text-gray-600 hover:bg-white/15 dark:hover:bg-black/10"
                            : "text-gray-300 dark:text-[var(--clay-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteIndex(i);
                        }}
                        aria-label="Delete chapter"
                      >
                        <BinIcon className="w-4 h-4" />
                      </button>
                    ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
