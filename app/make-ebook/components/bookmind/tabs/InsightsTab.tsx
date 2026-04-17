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

import React, { useState } from "react";
import { BookRecord, AnalyticalResponse, AnalyticalCard } from "../../../types";
import { getAnalytical, isAnalyticalFresh, setCharacter, getMemory, AnalyticalKind } from "../../../utils/bookmindMemory";
import CardRenderer from "../CardRenderer";
import { BookMindIcon as BookIcon } from "../../BookMindShared";
import { toast } from "sonner";

interface InsightsTabProps {
  book: BookRecord | undefined;
  userId?: string;
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
  userId,
  chapters,
  onNavigateToChapter,
  onRefresh,
}: InsightsTabProps) {
  const [addedChars, setAddedChars] = useState<Set<string>>(new Set());

  if (!book) {
    return (
      <EmptyState message="Open a book to see insights." />
    );
  }

  const characterEntry = getAnalytical(book, "characters");
  const characterCards = characterEntry?.payload?.cards ?? [];
  const existingMemory = getMemory(book);

  const handleAddCharacter = (card: AnalyticalCard) => {
    if (!userId || !book) return;
    setCharacter(userId, book.id, card.title, card.claim || card.body || "");
    setAddedChars(prev => new Set(prev).add(card.title));
    toast.success(`${card.title} added to Book Mind memory`);
  };

  const handleAddAllCharacters = () => {
    if (!userId || !book) return;
    for (const card of characterCards) {
      if (!existingMemory.characters[card.title]) {
        setCharacter(userId, book.id, card.title, card.claim || card.body || "");
      }
    }
    setAddedChars(new Set(characterCards.map(c => c.title)));
    toast.success(`${characterCards.length} characters added to Book Mind memory`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
            <div key={kind}>
              <InsightSection
                kind={kind}
                label={label}
                payload={payload ?? null}
                isFresh={fresh}
                isStale={!!entry && !fresh}
                chapters={chapters}
                onNavigateToChapter={onNavigateToChapter}
                onRefresh={onRefresh ? () => onRefresh(kind) : undefined}
              />
              {/* Add-to-memory actions for the Characters section */}
              {kind === "characters" && characterCards.length > 0 && userId && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleAddAllCharacters}
                    disabled={addedChars.size === characterCards.length}
                    className="text-2xs text-[#4070ff] hover:text-[#3560e6] disabled:text-gray-400 disabled:cursor-default transition-colors"
                  >
                    {addedChars.size === characterCards.length
                      ? "All characters added to Book Mind"
                      : `Add all ${characterCards.length} characters to Book Mind`}
                  </button>
                </div>
              )}
            </div>
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
        onRefresh ? (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 py-2 px-4 rounded-lg border border-gray-200 dark:border-[#2f2f2f] text-xs font-medium text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate {label.toLowerCase()}
          </button>
        ) : (
          <p className="text-xs text-gray-400 dark:text-[#737373] py-2">
            Not yet generated.
          </p>
        )
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
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
