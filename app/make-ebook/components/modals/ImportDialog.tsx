"use client";
import React from "react";
import { useBook, useBookActions } from "../../providers/BookProvider";
import { shallowEqual } from "../../providers/store";

export default function ImportDialog() {
  const { open, importing, importError, inputRef } = useBook(
    (s) => ({
      open: s.importDialogOpen,
      importing: s.importing,
      importError: s.importError,
      inputRef: s.importFileInputRef,
    }),
    shallowEqual,
  );
  const actions = useBookActions();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[var(--ink)] rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--paper)]">
            Import Document
          </h2>
          <button
            onClick={() => actions.setImportDialogOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] rounded transition-colors"
          >
            <svg
              className="w-5 h-5 text-[var(--clay-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 dark:text-[var(--clay)] mb-4">
          Upload a document to automatically parse chapters and create a new
          book.
        </p>

        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-[var(--ink-hover)] rounded-lg text-center">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.doc,.docx,.pdf"
            onChange={actions.handleImportFileSelect}
            className="hidden"
          />

          <div className="mb-3">
            <svg
              className="w-10 h-10 mx-auto text-gray-400 dark:text-[var(--clay-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {importing ? "Importing..." : "Choose File"}
          </button>

          <p className="text-xs text-gray-500 dark:text-[var(--clay-muted)] mt-2">
            Supported: .txt, .doc, .docx, .pdf
          </p>
        </div>

        {importError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              {importError}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-[var(--clay-muted)] space-y-1">
          <p>
            • Chapters are detected by headings like "Chapter 1", "Prologue",
            etc.
          </p>
          <p>• The document title will be extracted if possible</p>
          <p>• You can edit all details after import</p>
        </div>
      </div>
    </div>
  );
}
