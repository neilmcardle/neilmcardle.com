"use client";

// InsightsTab — renders pre-computed analytical results: themes,
// characters, pacing, and word frequency. Each section reads from the
// bookmindMemory.analytical cache. If the cache is fresh (manuscript
// hash matches), results appear instantly. Stale entries show a
// "may be out of date" indicator with a Refresh button. Missing
// entries show a "Generating..." placeholder while the background
// analytical cache generator runs.
//
// This tab never makes its own API calls. It's a pure reader of cached
// state. The analytical generator runs in page.tsx on book open.

import React from "react";
import { BookRecord, AnalyticalResponse } from "../../../types";
import { getAnalytical, isAnalyticalFresh, AnalyticalKind } from "../../../utils/bookmindMemory";
import CardRenderer from "../CardRenderer";
import { BookMindIcon as BookIcon } from "../../BookMindShared";

interface InsightsTabProps {
  book: BookRecord | undefined;
  chapters: Array<{ id: string; title: string }>;
  onNavigateToChapter?: (chapterIndex: number) => void;
  onRefresh?: (kind: AnalyticalKind) => void;
}

const SECTIONS: Array<{ kind: AnalyticalKind; label: string; icon: string }> = [
  { kind: "themes",        label: "Themes",         icon: "M9 19V6l12-3v13" },
  { kind: "characters",    label: "Characters",     icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
  { kind: "pacing",        label: "Pacing",         icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8" },
  { kind: "wordFrequency", label: "Word frequency", icon: "M4 7h16M4 12h10M4 17h12" },
];

export default function InsightsTab({
  book,
  chapters,
  onNavigateToChapter,
  onRefresh,
}: InsightsTabProps) {
  if (!book) {
    return (
      <EmptyState message="Open a book to see insights." />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19V6l12-3v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-sm font-medium">Insights</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-6">
        {SECTIONS.map(({ kind, label }) => {
          const entry = getAnalytical(book, kind);
          const fresh = isAnalyticalFresh(book, kind);
          const payload = entry?.payload;

          return (
            <InsightSection
              key={kind}
              kind={kind}
              label={label}
              payload={payload ?? null}
              isFresh={fresh}
              isStale={!!entry && !fresh}
              chapters={chapters}
              onNavigateToChapter={onNavigateToChapter}
              onRefresh={onRefresh ? () => onRefresh(kind) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

function InsightSection({
  kind,
  label,
  payload,
  isFresh,
  isStale,
  chapters,
  onNavigateToChapter,
  onRefresh,
}: {
  kind: AnalyticalKind;
  label: string;
  payload: AnalyticalResponse | null;
  isFresh: boolean;
  isStale: boolean;
  chapters: Array<{ id: string; title: string }>;
  onNavigateToChapter?: (chapterIndex: number) => void;
  onRefresh?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3]">
          {label}
        </h3>
        <div className="flex items-center gap-2">
          {isStale && (
            <span className="text-2xs text-amber-600 dark:text-amber-400">May be out of date</span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-2xs text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-white underline underline-offset-2 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {!payload ? (
        <div className="flex items-center gap-2 py-4 text-xs text-gray-400 dark:text-[#737373]">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Generating {label.toLowerCase()}...
        </div>
      ) : payload.cards.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-[#737373] py-2">
          Nothing found for {label.toLowerCase()}.
        </p>
      ) : (
        <CardRenderer
          response={payload}
          chapters={chapters}
          onNavigate={onNavigateToChapter}
        />
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19V6l12-3v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-sm font-medium">Insights</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-[260px]">
          <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">{message}</p>
        </div>
      </div>
    </div>
  );
}
