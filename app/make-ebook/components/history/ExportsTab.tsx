"use client";

import { Spinner } from "../Spinner";
import { EPUBExportMeta } from "../../hooks/useExportHistory";
import { formatFileSize, formatTimestamp } from "./format";
import { Chevron, EmptyState, LatestPill, TrashIcon } from "./HistoryParts";

export default function ExportsTab({
  exports,
  isLoading,
  expandedId,
  setExpandedId,
  onPreview,
  onDownload,
  onDelete,
}: {
  exports: EPUBExportMeta[];
  isLoading: boolean;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onPreview: (exportId: string) => void;
  onDownload: (exportId: string) => void;
  onDelete: (exportId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center gap-2">
        <Spinner
          size="lg"
          className="text-gray-400 dark:text-[var(--clay-muted)]"
        />
        <p className="text-11 text-gray-500 dark:text-[var(--clay-muted)]">
          Loading export history
        </p>
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <EmptyState
        title="No exports yet"
        description="Export your book to EPUB to see it here."
      />
    );
  }

  return (
    <div>
      {exports.map((exp, index) => {
        const isExpanded = expandedId === exp.id;
        const isLatest = index === 0;

        return (
          <div
            key={exp.id}
            className={`border-b border-gray-100 dark:border-[var(--rule)] ${isExpanded ? "bg-gray-50 dark:bg-[var(--ink-panel)]" : ""}`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : exp.id)}
              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-[var(--ink-panel)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-[var(--paper)]">
                      {formatTimestamp(exp.timestamp)}
                    </span>
                    {isLatest && <LatestPill />}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-[var(--clay)] truncate mt-1">
                    {exp.title}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-[var(--clay-muted)]">
                    <span>{exp.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{exp.chapterCount} chapters</span>
                    <span>•</span>
                    <span>{formatFileSize(exp.fileSize)}</span>
                  </div>
                </div>
                <Chevron expanded={isExpanded} />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onPreview(exp.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Preview
                  </button>
                  <button
                    onClick={() => onDownload(exp.id)}
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-[var(--rule)] text-xs font-medium hover:bg-gray-50 dark:hover:bg-[var(--rule)] transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-[var(--clay)]"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-[var(--rule)] text-gray-500 dark:text-[var(--clay-muted)] hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                    title="Delete this export"
                    aria-label="Delete this export"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
