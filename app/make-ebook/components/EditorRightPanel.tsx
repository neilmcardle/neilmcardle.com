'use client';

// Right-hand side panel of the desktop editor. Hosts either the Book
// Mind Inspector (a four-tab workspace: Chat / Insights / Issues /
// Pre-flight) or the live preview, depending on the LayoutSwitcher
// mode. Extracted from page.tsx so the two surfaces (editor / right
// panel) can iterate independently. The ResizableRightPanel wrapper
// handles the user-facing width resize and width persistence.
//
// Legacy note: the old `BookMindPanel.tsx` file still exists but is
// unreachable from the live UI — the LayoutSwitcher now uses
// `'inspector'` instead of `'book-mind'`. Deleting the legacy file is
// a separate atomic-removal step later in Phase A.

import React from 'react';
import ResizableRightPanel from './ResizableRightPanel';
import InspectorPanel from './bookmind/InspectorPanel';
import LivePreviewPanel from './LivePreviewPanel';
import type { RightPanelMode } from './LayoutSwitcher';
import type { Chapter as BookChapter } from '../types';

interface EditorRightPanelProps {
  mode: RightPanelMode;
  onClose: () => void;

  // Shared
  chapters: BookChapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;

  // Book Mind context
  bookId?: string;
  userId?: string;
  title: string;
  author: string;
  genre: string;
  selectedText?: string;
  coverFile?: string | null;
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
}: EditorRightPanelProps) {
  if (mode === 'none') return null;

  return (
    <ResizableRightPanel>
      {mode === 'inspector' && (
        <div className="h-full">
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
          />
        </div>
      )}
      {mode === 'live-preview' && (
        <div data-tour="preview" className="h-full overflow-hidden">
          <LivePreviewPanel
            chapters={chapters}
            selectedChapter={selectedChapter}
            onChapterSelect={onChapterSelect}
            onClose={onClose}
          />
        </div>
      )}
    </ResizableRightPanel>
  );
}
