"use client";

import React from "react";
import ResizableRightPanel from "./ResizableRightPanel";
import LivePreviewPanel from "./LivePreviewPanel";
import InspectorPanel from "./bookmind/InspectorPanel";
import type { RightPanelMode } from "./LayoutSwitcher";
import type { Chapter as BookChapter } from "../types";

interface EditorRightPanelProps {
  mode: RightPanelMode;
  onClose: () => void;

  chapters: BookChapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;

  bookId?: string;
  userId?: string;
  title?: string;
  author?: string;
  genre?: string;
  selectedText?: string;
  coverFile?: string | null;
  onRefreshAnalytical?: (kind: any) => void;
  onAddDisclosureChapter?: (content: string) => void;
  onExport?: () => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function EditorRightPanel({
  mode,
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
  onExport,
  isPro,
  onUpgrade,
}: EditorRightPanelProps) {
  if (mode === "none") return null;

  return (
    <ResizableRightPanel>
      <div data-tour="preview" className="h-full overflow-hidden">
        {mode === "live-preview" && (
          <LivePreviewPanel
            chapters={chapters}
            selectedChapter={selectedChapter}
            onChapterSelect={onChapterSelect}
            onClose={onClose}
          />
        )}
        {mode === "inspector" && (
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
            onExport={onExport}
            onClose={onClose}
            isPro={isPro}
            onUpgrade={onUpgrade}
          />
        )}
      </div>
    </ResizableRightPanel>
  );
}
