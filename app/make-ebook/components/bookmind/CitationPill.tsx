"use client";

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
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--paper)]/10 dark:bg-[var(--paper)]/15 text-[var(--acid)] hover:bg-[var(--paper)]/15 dark:hover:bg-[var(--paper)]/25 transition-colors text-[11px] font-medium align-baseline"
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
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
