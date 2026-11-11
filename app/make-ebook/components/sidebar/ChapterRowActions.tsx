"use client";

import React from "react";
import BinIcon from "../icons/BinIcon";

interface ChapterRowActionsProps {
  ch: { locked?: boolean };
  i: number;
  isSelected: boolean;
  chaptersCount: number;
  pendingDeleteIndex: number | null;
  setPendingDeleteIndex: (index: number | null) => void;
  handleToggleChapterLock?: (index: number) => void;
  confirmChapterDelete?: (index: number) => void;
  handleRemoveChapter: (index: number) => void;
}

export default function ChapterRowActions({
  ch,
  i,
  isSelected,
  chaptersCount,
  pendingDeleteIndex,
  setPendingDeleteIndex,
  handleToggleChapterLock,
  confirmChapterDelete,
  handleRemoveChapter,
}: ChapterRowActionsProps) {
  return (
    <>
      {handleToggleChapterLock && (
        <button
          className={`transition-all p-2 rounded-chip flex-shrink-0 ${
            isSelected
              ? "text-white/70 dark:text-[var(--clay-muted)] hover:bg-white/15 dark:hover:bg-black/10"
              : ch.locked
                ? "text-gray-600 dark:text-[var(--clay)] hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
                : "text-gray-300 dark:text-[var(--clay-muted)] hover:text-gray-600 dark:hover:text-[var(--clay)] hover:bg-gray-200 dark:hover:bg-[var(--rule)]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleChapterLock(i);
          }}
          aria-label={ch.locked ? "Unlock chapter" : "Lock chapter"}
          title={ch.locked ? "Unlock chapter" : "Mark complete and lock"}
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0" />
            </svg>
          )}
        </button>
      )}
      {chaptersCount > 1 &&
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
              className="p-2 rounded-chip text-[var(--clay-muted)] hover:bg-gray-200 dark:hover:bg-[var(--rule)] transition-colors flex-shrink-0"
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
                ? "text-[var(--clay-muted)] hover:text-red-400 hover:bg-[var(--rule)]"
                : "text-[var(--clay-muted)] hover:text-red-400 hover:bg-[var(--rule)]"
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
    </>
  );
}
