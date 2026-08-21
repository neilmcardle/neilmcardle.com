"use client";

import React from "react";
import InspectorPanel from "./bookmind/InspectorPanel";
import type { Chapter as BookChapter } from "../types";
import type { AnalyticalKind } from "../utils/bookmindMemory";

interface FloatingBookMindWindowProps {
  isOpen: boolean;
  onClose: () => void;

  chapters: BookChapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;

  bookId?: string;
  userId?: string;
  title: string;
  author: string;
  genre: string;
  selectedText?: string;
  coverFile?: string | null;
  onRefreshAnalytical?: (kind: AnalyticalKind) => void;
  onAddDisclosureChapter?: (content: string) => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function FloatingBookMindWindow({
  isOpen,
  onClose,
  chapters,
  selectedChapter,
  onChapterSelect,
  bookId,
  userId,
  title,
  author,
  genre,
  selectedText,
  coverFile,
  onRefreshAnalytical,
  onAddDisclosureChapter,
  isPro,
  onUpgrade,
}: FloatingBookMindWindowProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[480px] h-[700px] max-sm:inset-4 max-sm:w-auto max-sm:h-auto bg-white dark:bg-[#252525] rounded-lg shadow-2xl border border-gray-200 dark:border-[#404040] z-[200] flex flex-col overflow-hidden">
      <InspectorPanel
        bookId={bookId}
        userId={userId}
        title={title}
        author={author}
        genre={genre}
        chapters={chapters}
        selectedChapterIndex={selectedChapter}
        selectedText={selectedText}
        coverFile={coverFile}
        onNavigateToChapter={onChapterSelect}
        onRefreshAnalytical={onRefreshAnalytical}
        onAddDisclosureChapter={onAddDisclosureChapter}
        onClose={onClose}
        isPro={isPro}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}
