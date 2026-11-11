"use client";

import { BookVersion } from "../../hooks/useVersionHistory";
import { Chapter } from "../../types";
import { formatTimestamp } from "./format";
import { Chevron, EmptyState, LatestPill, TrashIcon } from "./HistoryParts";

export default function VersionsTab({
  versions,
  currentWordCount,
  expandedId,
  setExpandedId,
  onRestore,
  onDelete,
}: {
  versions: BookVersion[];
  currentWordCount: number;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onRestore: (chapters: Chapter[], metadata: BookVersion["metadata"]) => void;
  onDelete: (versionId: string) => void;
}) {
  if (versions.length === 0) {
    return (
      <EmptyState
        title="No version history yet"
        description="Versions are saved automatically when you save your book."
      />
    );
  }

  return (
    <div>
      {versions.map((version, index) => {
        const isExpanded = expandedId === version.id;
        const wordDiff = version.wordCount - currentWordCount;
        const isLatest = index === 0;

        return (
          <div
            key={version.id}
            className={`border-b border-gray-100 dark:border-[var(--rule)] ${isExpanded ? "bg-gray-50 dark:bg-[var(--ink-panel)]" : ""}`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : version.id)}
              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-[var(--ink-panel)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-[var(--paper)]">
                      {formatTimestamp(version.timestamp)}
                    </span>
                    {isLatest && <LatestPill />}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-[var(--clay-muted)]">
                    <span>{version.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{version.chapterCount} chapters</span>
                  </div>
                </div>
                <Chevron expanded={isExpanded} />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3">
                {wordDiff !== 0 && (
                  <div
                    className={`text-xs mb-2 ${
                      wordDiff > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {wordDiff > 0
                      ? `${wordDiff.toLocaleString()} fewer words than current`
                      : `${Math.abs(wordDiff).toLocaleString()} more words than current`}
                  </div>
                )}

                <div className="bg-white dark:bg-[var(--ink)] rounded-lg border border-gray-200 dark:border-[var(--rule)] p-2 mb-3">
                  <div className="text-xs text-gray-500 dark:text-[var(--clay-muted)] mb-1">
                    Chapters:
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {version.chapters.slice(0, 5).map((ch, i) => (
                      <div
                        key={ch.id}
                        className="text-xs text-gray-700 dark:text-[var(--clay)] truncate"
                      >
                        {i + 1}. {ch.title || "Untitled Chapter"}
                      </div>
                    ))}
                    {version.chapters.length > 5 && (
                      <div className="text-xs text-[var(--clay-muted)]">
                        +{version.chapters.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onRestore(version.chapters, version.metadata)
                    }
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Restore This Version
                  </button>
                  <button
                    onClick={() => onDelete(version.id)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-[var(--rule)] text-gray-500 dark:text-[var(--clay-muted)] hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                    title="Delete this version"
                    aria-label="Delete this version"
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
