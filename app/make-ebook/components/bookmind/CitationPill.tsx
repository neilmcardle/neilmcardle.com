"use client";

// A single citation pill. Shows a chapter reference ("Chapter 14",
// "Prologue") as a compact clickable badge that navigates the editor
// to the target chapter and optionally highlights a source passage.
//
// The pill is purely a renderer. The navigation happens through a
// callback passed in by the parent (ChatTab → page.tsx → EditorCanvas),
// so the pill doesn't know about editor internals. This keeps the
// component reusable across Chat, ReadingView, InsightsTab cards, etc.

import React from "react";

interface CitationPillProps {
  label: string;
  chapterIndex: number;
  chapterId?: string;
  onNavigate?: (chapterIndex: number, chapterId?: string) => void;
}

export default function CitationPill({
  label,
  chapterIndex,
  chapterId,
  onNavigate,
}: CitationPillProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate?.(chapterIndex, chapterId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#4070ff]/10 dark:bg-[#4070ff]/15 text-[#4070ff] hover:bg-[#4070ff]/15 dark:hover:bg-[#4070ff]/25 transition-colors text-[11px] font-medium align-baseline"
      title={`Jump to ${label}`}
    >
      <svg
        className="w-2.5 h-2.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
