"use client";

import React, { useEffect } from "react";

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
  getContentChapterNumber: (chapters: SheetChapter[], index: number) => number;
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
  getContentChapterNumber,
}: ChaptersSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const completed = chapters.filter((c) => c.completed).length;

  return (
    <div
      className={`lg:hidden fixed inset-0 z-[95] transition-[visibility] duration-300 ${
        open ? "visible" : "invisible"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Chapters"
    >
      <button
        aria-label="Close chapters"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-x-0 top-0 w-full bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 68px)" }}
      />

      <div
        className={`absolute left-0 right-0 max-h-[72vh] flex flex-col rounded-t-[20px] bg-white dark:bg-[#252525] border-t border-gray-200 dark:border-[#2f2f2f] shadow-[0_-12px_32px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-[120%]"
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 68px)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chapters"
          className="flex justify-center py-3 flex-shrink-0"
        >
          <span className="w-9 h-1 rounded-full bg-gray-300 dark:bg-[#4a4a4a]" />
        </button>

        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <div className="min-w-0">
            <div className="text-125 font-semibold text-gray-900 dark:text-[#f5f5f5]">
              Chapters
            </div>
            <div className="text-11 text-gray-500 dark:text-[#737373] mt-0.5 tabular-nums">
              {completed} of {chapters.length} complete &middot;{" "}
              {totalWords.toLocaleString()} words
            </div>
          </div>
          <button
            type="button"
            onClick={onAddChapter}
            aria-label="Add chapter"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2f2f2f] text-gray-700 dark:text-[#d4d4d4] flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          {chapters.map((chapter, i) => {
            const isSelected = i === selectedChapter;
            const label =
              chapter.type === "frontmatter"
                ? "Front"
                : chapter.type === "backmatter"
                  ? "Back"
                  : String(getContentChapterNumber(chapters, i));
            return (
              <div
                key={chapter.id}
                className={`flex items-center gap-3 rounded-[10px] px-3 ${
                  isSelected ? "bg-gray-900 dark:bg-white" : ""
                }`}
              >
                {onToggleComplete && (
                  <button
                    type="button"
                    onClick={() => onToggleComplete(i)}
                    aria-pressed={!!chapter.completed}
                    aria-label={
                      chapter.completed
                        ? "Mark as still in progress"
                        : "Mark chapter complete"
                    }
                    className={`flex items-center justify-center w-11 h-11 -ml-2 flex-shrink-0`}
                  >
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full border ${
                        chapter.completed
                          ? isSelected
                            ? "bg-white dark:bg-gray-900 border-transparent text-gray-900 dark:text-white"
                            : "bg-gray-900 dark:bg-white border-transparent text-white dark:text-gray-900"
                          : isSelected
                            ? "border-white/40 dark:border-gray-400 text-transparent"
                            : "border-gray-300 dark:border-[#4a4a4a] text-transparent"
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="4 12 9 17 20 6" />
                      </svg>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSelectChapter(i);
                    onClose();
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 h-12 text-left"
                >
                  <span
                    className={`w-6 text-11 tabular-nums flex-shrink-0 ${
                      isSelected
                        ? "text-white/60 dark:text-gray-500"
                        : "text-gray-400 dark:text-[#737373]"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`flex-1 min-w-0 truncate text-sm ${
                      isSelected
                        ? "font-semibold text-white dark:text-gray-900"
                        : "text-gray-800 dark:text-[#d4d4d4]"
                    }`}
                  >
                    {chapter.title?.trim() || "Untitled"}
                  </span>
                  {wordCounts?.[i] !== undefined && (
                    <span
                      className={`text-11 tabular-nums flex-shrink-0 ${
                        isSelected
                          ? "text-white/60 dark:text-gray-500"
                          : "text-gray-400 dark:text-[#5c5c5c]"
                      }`}
                    >
                      {wordCounts[i].toLocaleString()}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
