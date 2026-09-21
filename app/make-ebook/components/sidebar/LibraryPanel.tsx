"use client";

import React from "react";
import EmptyStateHint from "../EmptyStateHint";
import styles from "../../styles/studio.module.css";
import { displayTitle } from "../../utils/bookLibrary";

interface Book {
  id: string;
  title: string;
  author: string;
  savedAt: number;
  coverUrl?: string;
  chapters?: { title?: string }[];
}

interface LibraryPanelProps {
  libraryBooks: Book[];
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  currentBookId?: string;
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
  compact?: boolean;
}

function Icon({ d }: { d: string }) {
  return (
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
  );
}

const NEW_BOOK =
  "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 14h6M12 11v6";
const IMPORT = "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12";
const TRASH =
  "M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3";

export default function LibraryPanel({
  libraryBooks,
  selectedBookId,
  currentBookId,
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
  compact = false,
}: LibraryPanelProps) {
  const current = currentBookId ?? selectedBookId;
  const allSelected =
    libraryBooks.length > 0 && selectedBookIds.size === libraryBooks.length;
  const none = selectedBookIds.size === 0;

  return (
    <div className="pb-3">
      <div className={styles.panelHead}>
        {compact ? (
          <span />
        ) : (
          <span className={styles.panelTitle}>
            Library
            <span className={styles.panelCount}>{libraryBooks.length}</span>
          </span>
        )}
        <div className={styles.panelActions}>
          {libraryBooks.length > 1 && (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => setMultiSelectMode(!multiSelectMode)}
            >
              {multiSelectMode ? "Done" : "Select"}
            </button>
          )}
          {!multiSelectMode && (
            <>
              <button
                type="button"
                className={styles.panelIconBtn}
                onClick={showNewBookConfirmation}
                title="New book"
                aria-label="New book"
              >
                <Icon d={NEW_BOOK} />
              </button>
              <button
                type="button"
                className={styles.panelIconBtn}
                onClick={showImportDialog}
                title="Import a file"
                aria-label="Import a file"
              >
                <Icon d={IMPORT} />
              </button>
            </>
          )}
        </div>
      </div>

      {multiSelectMode && (
        <div
          className={styles.selectBar}
          role="toolbar"
          aria-label="Selected books"
        >
          <div className={styles.selectBarTop}>
            <button
              type="button"
              className={styles.textButton}
              onClick={toggleSelectAll}
            >
              {allSelected ? "Clear" : "Select all"}
            </button>
            <span aria-live="polite">
              {none
                ? "Tap books to select"
                : `${selectedBookIds.size} selected`}
            </span>
          </div>
          <div className={styles.selectBarActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={none}
              onClick={handleDeleteSelectedBooks}
            >
              Delete
            </button>
          </div>
        </div>
      )}

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
                  d="M4 4v16M10 7v13M16 5v15M3 20h18"
                />
              </svg>
            }
            title="No saved books yet"
            description="Books you save appear here, on this device."
          />
        </div>
      ) : (
        <div className={styles.bookList}>
          {[...libraryBooks]
            .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
            .map((book) => {
              const isCurrent = current === book.id;
              const isChecked = selectedBookIds.has(book.id);
              const state = multiSelectMode
                ? isChecked
                  ? styles.chapterRowChecked
                  : ""
                : isCurrent
                  ? styles.chapterRowActive
                  : "";
              return (
                <div
                  key={book.id}
                  className={`group ${styles.bookRow} ${state}`}
                >
                  <button
                    type="button"
                    className={styles.chapterRowMain}
                    onClick={() =>
                      multiSelectMode
                        ? toggleBookSelection(book.id)
                        : handleLoadBook(book.id)
                    }
                    role={multiSelectMode ? "checkbox" : undefined}
                    aria-checked={multiSelectMode ? isChecked : undefined}
                    aria-current={
                      !multiSelectMode && isCurrent ? "true" : undefined
                    }
                  >
                    {multiSelectMode && (
                      <span
                        className={`${styles.checkbox} ${isChecked ? styles.checkboxOn : ""}`}
                        aria-hidden="true"
                      >
                        {isChecked && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="4 12 9 17 20 6" />
                          </svg>
                        )}
                      </span>
                    )}
                    <span className={styles.bookText}>
                      <span className={styles.bookName}>
                        {displayTitle(book)}
                      </span>
                      <span className={styles.bookAuthor}>
                        {book.author || "No author yet"}
                      </span>
                    </span>
                  </button>
                  {!multiSelectMode && (
                    <button
                      type="button"
                      className={styles.rowIconBtn}
                      onClick={() => handleDeleteBook(book.id)}
                      title="Delete book"
                      aria-label={`Delete ${displayTitle(book)}`}
                    >
                      <Icon d={TRASH} />
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
