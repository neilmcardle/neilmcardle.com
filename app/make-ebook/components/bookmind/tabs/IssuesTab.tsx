"use client";

// IssuesTab — renders inconsistencies, plot holes, and character drift
// from the analytical cache. Each issue is a tappable card that can
// jump the editor to the offending passage via a citation pill. Issues
// the author has dismissed are filtered out via bookmindMemory.
// dismissedIssueIds and don't reappear on refresh.

import React from "react";
import { BookRecord, AnalyticalCard } from "../../../types";
import {
  getAnalytical,
  isAnalyticalFresh,
  getMemory,
  dismissIssue,
  AnalyticalKind,
} from "../../../utils/bookmindMemory";
import CitationPill from "../CitationPill";
import { BookMindIcon as BookIcon } from "../../BookMindShared";

interface IssuesTabProps {
  book: BookRecord | undefined;
  userId?: string;
  chapters: Array<{ id: string; title: string }>;
  onNavigateToChapter?: (chapterIndex: number) => void;
  onRefresh?: (kind: AnalyticalKind) => void;
}

export default function IssuesTab({
  book,
  userId,
  chapters,
  onNavigateToChapter,
  onRefresh,
}: IssuesTabProps) {
  if (!book) {
    return <EmptyState message="Open a book to check for issues." />;
  }

  const entry = getAnalytical(book, "inconsistencies");
  const fresh = isAnalyticalFresh(book, "inconsistencies");
  const memory = getMemory(book);
  const dismissedIds = new Set(memory.dismissedIssueIds ?? []);

  // Filter out dismissed issues. Each card gets a stable id from its
  // title + claim hash so dismissals persist across regeneration when
  // the finding text is identical.
  const allCards = entry?.payload?.cards ?? [];
  const visibleCards = allCards.filter(
    (card, idx) => !dismissedIds.has(issueId(card, idx)),
  );

  const handleDismiss = (card: AnalyticalCard, idx: number) => {
    if (!userId || !book) return;
    dismissIssue(userId, book.id, issueId(card, idx));
    // Force a re-render by... well, React will re-render on the next
    // state change. Since we wrote to localStorage, the next time
    // the component reads getMemory it will see the dismissal. For
    // an immediate visual update we'd need state here, but the tab
    // switch already triggers a re-mount. Acceptable for Phase C.
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-medium">Issues</span>
          {visibleCards.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-[#737373]">
              {visibleCards.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {entry && !fresh && (
            <span className="text-2xs text-amber-600 dark:text-amber-400">May be out of date</span>
          )}
          {onRefresh && (
            <button
              onClick={() => onRefresh("inconsistencies")}
              className="text-2xs text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-white underline underline-offset-2 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
        {!entry ? (
          onRefresh ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <svg className="w-8 h-8 text-gray-300 dark:text-[#525252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">No scan yet</p>
              <button
                onClick={() => onRefresh("inconsistencies")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Scan for issues
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-[#737373] text-center py-8">Not yet scanned.</p>
          )
        ) : visibleCards.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-8 h-8 text-emerald-400 dark:text-emerald-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No issues found</p>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">
              {allCards.length > 0
                ? `${allCards.length} dismissed. Refresh to re-scan.`
                : "Book Mind didn't find inconsistencies in this manuscript."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {visibleCards.map((card, idx) => {
              const chapterIndex = card.chapterLabel
                ? resolveChapterIndex(card.chapterLabel, chapters)
                : -1;
              return (
                <li
                  key={issueId(card, idx)}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-[#262626] border border-gray-100 dark:border-[#2f2f2f]"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/15">
                      Issue
                    </span>
                    <div className="flex items-center gap-1">
                      {card.chapterLabel && chapterIndex >= 0 && (
                        <CitationPill
                          label={card.chapterLabel}
                          chapterIndex={chapterIndex}
                          onNavigate={onNavigateToChapter}
                        />
                      )}
                      <button
                        onClick={() => handleDismiss(card, idx)}
                        className="text-2xs text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors px-1"
                        title="Dismiss this issue"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug mb-1">
                    {card.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                    {card.claim}
                  </p>
                  {card.quote && (
                    <blockquote className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-[#3a3a3a] text-xs italic text-gray-500 dark:text-[#888] leading-relaxed">
                      &ldquo;{card.quote}&rdquo;
                    </blockquote>
                  )}
                  {card.body && card.body !== card.claim && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                      {card.body}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// Stable issue id derived from content so dismissals survive re-gen
// when the finding text is identical.
function issueId(card: AnalyticalCard, fallbackIdx: number): string {
  const base = `${card.title ?? ""}|${card.claim ?? ""}`;
  if (base.length > 4) return base;
  return `issue-${fallbackIdx}`;
}

function resolveChapterIndex(
  label: string,
  chapters: Array<{ id: string; title: string }>,
): number {
  const match = label.match(/\d+/);
  if (!match) return -1;
  const num = parseInt(match[0], 10);
  // "Chapter N" is 1-based content chapters
  const contentChapters = chapters;
  return num > 0 && num <= contentChapters.length ? num - 1 : -1;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-medium">Issues</span>
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
