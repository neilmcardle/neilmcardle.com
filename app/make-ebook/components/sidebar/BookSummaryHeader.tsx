"use client";

import React from "react";

interface BookSummaryHeaderProps {
  title: string;
  author: string;
  genre: string;
  totalWords: number;
  completedChapters: number;
  totalChapters: number;
}

export default function BookSummaryHeader({
  title,
  author,
  genre,
  totalWords,
  completedChapters,
  totalChapters,
}: BookSummaryHeaderProps) {
  const byline = [author?.trim(), genre?.trim()].filter(Boolean).join(" · ");
  const pct =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  return (
    <div className="px-3 pb-4 border-b border-gray-200 dark:border-[#2f2f2f]">
      <div
        className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-gray-900 dark:text-[#f5f5f5] truncate"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        title={title?.trim() || "Untitled book"}
      >
        {title?.trim() || "Untitled book"}
      </div>
      {byline && (
        <div
          className="text-11 text-gray-500 dark:text-[#a3a3a3] truncate mt-1"
          title={byline}
        >
          {byline}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-[#2f2f2f] overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900 dark:bg-white transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-11 tabular-nums text-gray-600 dark:text-[#a3a3a3]">
          {totalWords.toLocaleString()}
        </span>
      </div>
      <div className="text-10 text-gray-400 dark:text-[#737373] mt-1.5">
        {completedChapters} of {totalChapters}{" "}
        {totalChapters === 1 ? "chapter" : "chapters"} complete
      </div>
    </div>
  );
}
