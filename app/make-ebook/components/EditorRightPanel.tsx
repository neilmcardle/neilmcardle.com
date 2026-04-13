'use client';

// Right-hand side panel of the desktop editor. Hosts either Book Mind or
// the live preview, whichever mode the LayoutSwitcher is set to. Extracted
// from page.tsx so the two surfaces (editor / right panel) can iterate
// independently. The ResizableRightPanel wrapper handles the user-facing
// width resize and width persistence — this component only decides which
// panel to render inside it.

import React from 'react';
import ResizableRightPanel from './ResizableRightPanel';
import BookMindPanel from './BookMindPanel';
import LivePreviewPanel from './LivePreviewPanel';
import type { RightPanelMode } from './LayoutSwitcher';

interface Chapter {
  id: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  title: string;
  content: string;
  locked?: boolean;
}

interface EditorRightPanelProps {
  mode: RightPanelMode;
  onClose: () => void;

  // Shared
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;

  // Book Mind context
  bookId?: string;
  userId?: string;
  title: string;
  author: string;
  genre: string;
  selectedText?: string;
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
}: EditorRightPanelProps) {
  if (mode === 'none') return null;

  return (
    <ResizableRightPanel>
      {mode === 'book-mind' && (
        <div className="h-full">
          <BookMindPanel
            bookId={bookId}
            userId={userId}
            title={title}
            author={author}
            genre={genre}
            chapters={chapters.map((c) => ({ title: c.title, content: c.content, type: c.type }))}
            selectedChapterIndex={selectedChapter}
            selectedText={selectedText}
            onClose={onClose}
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
