"use client";

import React, { useState } from "react";

const BACKDROP =
  "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50";
const PANEL =
  "bg-white dark:bg-[var(--ink)] rounded-lg shadow-xl w-full max-w-md mx-4";
const HEAD = "px-6 py-4 border-b border-gray-200 dark:border-[var(--rule)]";
const TITLE = "text-lg font-semibold text-gray-900 dark:text-white";
const LABEL =
  "block text-sm font-medium text-gray-700 dark:text-[var(--clay)] mb-2";
const FIELD =
  "w-full px-3 py-2 border border-gray-300 dark:border-[var(--ink-hover)] rounded-lg bg-white dark:bg-[var(--ink)] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--ink-hover)]";
const FOOT =
  "px-6 py-4 border-t border-gray-200 dark:border-[var(--rule)] flex justify-end gap-2";
const CANCEL =
  "px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--clay)] hover:bg-gray-100 dark:hover:bg-[var(--rule)] rounded-lg transition-colors";
const CONFIRM =
  "px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-[var(--ink-deep)] hover:opacity-90 rounded-lg transition-opacity";

export function EndnoteDialog({
  hasEndnotes,
  onAdd,
  onClose,
}: {
  hasEndnotes: boolean;
  onAdd: (content: string) => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const add = () => {
    if (content.trim()) onAdd(content.trim());
  };
  return (
    <div className={BACKDROP} onClick={onClose}>
      <div
        className={PANEL}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rte-endnote-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={HEAD}>
          <h3 id="rte-endnote-title" className={TITLE}>
            Add endnote
          </h3>
        </div>
        <div className="px-6 py-4">
          <label htmlFor="rte-endnote-content" className={LABEL}>
            Endnote content
          </label>
          <textarea
            id="rte-endnote-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                add();
              }
              if (e.key === "Escape") onClose();
            }}
            placeholder="Enter your endnote text here..."
            autoFocus
            rows={4}
            className={`${FIELD} resize-none`}
          />
          {!hasEndnotes && (
            <p className="mt-2 text-xs text-blue-600 dark:text-[var(--paper)] flex items-start gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>
                Your first endnote will automatically create an Endnotes chapter
                at the end of your book.
              </span>
            </p>
          )}
        </div>
        <div className={FOOT}>
          <button onClick={onClose} className={CANCEL}>
            Cancel
          </button>
          <button
            onClick={add}
            disabled={!content.trim()}
            className={`${CONFIRM} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Add endnote
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImageCaptionDialog({
  onAdd,
  onClose,
}: {
  onAdd: (caption: string) => void;
  onClose: () => void;
}) {
  const [caption, setCaption] = useState("");
  return (
    <div className={BACKDROP} onClick={onClose}>
      <div
        className={PANEL}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rte-caption-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={HEAD}>
          <h3 id="rte-caption-title" className={TITLE}>
            Add image caption
          </h3>
        </div>
        <div className="px-6 py-4">
          <label htmlFor="rte-caption" className={LABEL}>
            Caption (optional)
          </label>
          <input
            id="rte-caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd(caption.trim());
              }
              if (e.key === "Escape") onClose();
            }}
            placeholder="E.g., Figure 1: Market trends in 2024"
            autoFocus
            className={FIELD}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-[var(--clay-muted)]">
            Press Enter to add image, or Esc to cancel
          </p>
        </div>
        <div className={FOOT}>
          <button onClick={onClose} className={CANCEL}>
            Cancel
          </button>
          <button onClick={() => onAdd(caption.trim())} className={CONFIRM}>
            Add image
          </button>
        </div>
      </div>
    </div>
  );
}
