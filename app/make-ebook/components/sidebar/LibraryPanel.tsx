"use client";

import React, { useState, useLayoutEffect, useRef } from "react";
import { TrashIcon } from "../icons";
import EmptyStateHint from "../EmptyStateHint";

interface Book {
  id: string;
  title: string;
  author: string;
  savedAt: number;
  coverUrl?: string;
}

interface LibraryPanelProps {
  libraryBooks: Book[];
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  handleLoadBook: (id: string) => void;
  handleDeleteBook: (id: string) => void;
  showNewBookConfirmation: () => void;
  showImportDialog: () => void;

  multiSelectMode: boolean;
  setMultiSelectMode: (value: boolean) => void;
  selectedBookIds: Set<string>;
  toggleBookSelection: (id: string) => void;
  toggleSelectAll: () => void;
  handleDeleteSelectedBooks: () => void;
}

export default function LibraryPanel({
  libraryBooks,
  selectedBookId,
  setSelectedBookId,
  handleLoadBook,
  handleDeleteBook,
  showNewBookConfirmation,
  showImportDialog,
  multiSelectMode,
  setMultiSelectMode,
  selectedBookIds,
  toggleBookSelection,
  toggleSelectAll,
  handleDeleteSelectedBooks,
}: LibraryPanelProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    const container = containerRef.current;
    const target = hovered ? itemRefs.current[hovered] : null;
    if (!container || !target) {
      setBox(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setBox({
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
    });
  }, [hovered]);

  return (
    <div className="border-b border-gray-200 dark:border-[#2f2f2f] pb-3">
      <div className="flex items-center justify-between py-3 px-3">
        <div className="flex items-center gap-2.5">
          <svg
            className="w-4 h-4 text-gray-600 dark:text-[#a3a3a3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="3" height="16" rx="0.5" />
            <rect x="10" y="7" width="3" height="13" rx="0.5" />
            <rect x="16" y="5" width="3" height="15" rx="0.5" />
            <path d="M3 20h18" />
          </svg>
          <span className="text-125 font-semibold text-gray-900 dark:text-[#e5e5e5]">
            Library
          </span>
          <span className="text-11 text-gray-500 dark:text-[#a3a3a3]">
            ({libraryBooks.length})
          </span>
        </div>

        <div className="flex items-center gap-3 -mr-3">
          {libraryBooks.length > 0 && (
            <button
              onClick={() => setMultiSelectMode(!multiSelectMode)}
              className={`flex items-center justify-center h-8 w-8 rounded-chip transition-all duration-150 ${
                multiSelectMode
                  ? "bg-[#008ff0]/10 dark:bg-[#008ff0]/15 text-[#008ff0]"
                  : "text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#2d2d2d] hover:text-gray-700 dark:hover:text-[#d4d4d4]"
              }`}
              title={multiSelectMode ? "Cancel selection" : "Select multiple"}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 12l2.5 2.5 4.5-4.5" />
              </svg>
            </button>
          )}
          <button
            onClick={showNewBookConfirmation}
            className="flex items-center justify-center h-8 w-8 rounded-chip text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#2d2d2d] hover:text-gray-700 dark:hover:text-[#d4d4d4] transition-all duration-150"
            title="New book"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M9 14h6M12 11v6" />
            </svg>
          </button>
          <button
            onClick={showImportDialog}
            className="flex items-center justify-center h-8 w-8 rounded-chip text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#2d2d2d] hover:text-gray-700 dark:hover:text-[#d4d4d4] transition-all duration-150 pr-3"
            title="Import document"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12M7.5 10l4.5 5 4.5-5" />
              <path d="M4 19h16" />
            </svg>
          </button>
        </div>
      </div>

      {multiSelectMode && libraryBooks.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#2d2d2d] rounded-card gap-2 mx-2 mb-2">
          <button
            onClick={toggleSelectAll}
            className="text-11 font-medium text-[#008ff0] hover:underline"
          >
            {selectedBookIds.size === libraryBooks.length
              ? "Deselect All"
              : "Select All"}
          </button>
          <span className="text-11 text-gray-500 dark:text-[#a3a3a3]">
            {selectedBookIds.size} selected
          </span>
          <button
            onClick={handleDeleteSelectedBooks}
            disabled={selectedBookIds.size === 0}
            className="text-11 font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      )}

      <div
        className={`${libraryBooks.length > 4 ? "max-h-[400px] overflow-y-auto" : ""}`}
      >
        {libraryBooks.length === 0 ? (
          <div className="px-2 pt-1">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title="No saved books yet"
              description="Your books will appear here once saved. Click Save to preserve your current work."
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            onMouseLeave={() => setHovered(null)}
            className="relative flex flex-col gap-2 px-2"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1 rounded-[7px] bg-gray-100 dark:bg-[#2d2d2d]"
              style={{
                top: box?.top ?? 0,
                height: box?.height ?? 0,
                opacity: box ? 1 : 0,
                transition:
                  "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
              }}
            />

            {libraryBooks.map((book) => {
              const isSelected = selectedBookId === book.id;
              const isChecked = selectedBookIds.has(book.id);

              return (
                <div
                  key={book.id}
                  ref={(el) => {
                    itemRefs.current[book.id] = el;
                  }}
                  onMouseEnter={() => setHovered(book.id)}
                  className="group relative z-10 flex items-center gap-2.5 py-2.5 px-2 text-left transition-[color] duration-150 rounded-[7px]"
                >
                  <button
                    type="button"
                    onFocus={() => setHovered(book.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() =>
                      multiSelectMode
                        ? toggleBookSelection(book.id)
                        : setSelectedBookId(isSelected ? null : book.id)
                    }
                    aria-pressed={multiSelectMode ? isChecked : isSelected}
                    aria-label={book.title || "Untitled"}
                    className="absolute inset-0 z-0 rounded-[7px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008ff0]/40"
                  />

                  {multiSelectMode && (
                    <label
                      className="relative z-10 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBookSelection(book.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-[#3a3a3a] text-[#008ff0] focus:ring-[#008ff0] dark:focus:ring-[#008ff0] cursor-pointer"
                      />
                    </label>
                  )}

                  <div className="relative z-10 flex-1 min-w-0 pointer-events-none">
                    <div
                      className={`text-125 font-medium truncate ${
                        isSelected || isChecked
                          ? "text-gray-900 dark:text-[#f5f5f5]"
                          : "text-gray-700 dark:text-[#d4d4d4]"
                      }`}
                    >
                      {book.title || "Untitled"}
                    </div>
                    <div className="text-11 text-gray-500 dark:text-[#a3a3a3] truncate">
                      {book.author || "Unknown author"}
                    </div>
                  </div>

                  {!multiSelectMode && isSelected && (
                    <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadBook(book.id);
                          setSelectedBookId(null);
                        }}
                        className="px-3 py-2 text-11 font-medium rounded-chip bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-85 transition-opacity active:scale-[0.96]"
                      >
                        Open
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBook(book.id);
                        }}
                        className="p-2 rounded-chip text-gray-400 dark:text-[#737373] hover:bg-gray-200 dark:hover:bg-[#2d2d2d] hover:text-gray-600 dark:hover:text-[#a3a3a3] transition-colors"
                        title="Delete book"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
