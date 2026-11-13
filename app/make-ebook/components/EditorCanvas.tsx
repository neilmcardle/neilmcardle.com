"use client";

import React, { useEffect } from "react";
import { PreviewSlot, preloadPreview } from "./previewLoader";
import BookMindAgent from "./BookMindAgent";
import { ChapterIndex } from "./ChapterIndex";
import ChapterPanel from "./ChapterPanel";
import styles from "../styles/studio.module.css";
import type { FocusSettings as FocusModeSettings } from "../hooks/useFocusMode";

interface Chapter {
  id: string;
  type: "frontmatter" | "content" | "backmatter";
  title: string;
  content: string;
  locked?: boolean;
  completed?: boolean;
}

interface ChapterStats {
  wordCount: number;
}

interface BookStats {
  totalWords: number;
  chapterStats?: ChapterStats[];
}

interface SessionStats {
  wordsThisSession: number;
}

interface FocusState {
  active: boolean;
  settings: FocusModeSettings;
}

interface EditorCanvasProps {
  chapters: Chapter[];
  selectedChapter: number;
  mode: "edit" | "preview";
  onChapterTitleChange: (index: number, title: string) => void;
  onChapterContentChange: (index: number, html: string) => void;
  onChapterSelect?: (index: number) => void;

  onCreateEndnote: (selectedText: string, chapterId?: string) => string;
  endnotesCount: number;

  bookStats: BookStats;
  sessionStats: SessionStats;
  todayWords: number;

  focus: FocusState;

  onInlineEditRequest?: (args: {
    selectedText: string;
    range: Range;
    rect: DOMRect;
    instruction?: string;
  }) => void;
  onComposeRequest?: (args: { range: Range; rect: DOMRect }) => void;
  starters?: { onUpload: () => void; onLibrary: () => void };

  isBookMindLoading?: boolean;
  onOpenBookMind?: () => void;
}

export default function EditorCanvas({
  chapters,
  selectedChapter,
  mode,
  onChapterTitleChange,
  onChapterContentChange,
  onChapterSelect,
  onCreateEndnote,
  endnotesCount,
  bookStats,
  sessionStats,
  todayWords,
  focus,
  onInlineEditRequest,
  onComposeRequest,
  starters,
  isBookMindLoading = false,
  onOpenBookMind,
}: EditorCanvasProps) {
  useEffect(() => {
    if (!("requestIdleCallback" in window)) {
      const timer = globalThis.setTimeout(preloadPreview, 2000);
      return () => globalThis.clearTimeout(timer);
    }
    const handle = window.requestIdleCallback(() => void preloadPreview(), {
      timeout: 4000,
    });
    return () => window.cancelIdleCallback(handle);
  }, []);

  const chapter = chapters[selectedChapter];

  const chapterWordCount =
    bookStats.chapterStats?.[selectedChapter]?.wordCount ?? 0;

  const detail = [
    sessionStats.wordsThisSession > 0
      ? `+${sessionStats.wordsThisSession.toLocaleString()} this session`
      : null,
    todayWords > 0 ? `${todayWords.toLocaleString()} today` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const footer = (
    <div className={styles.canvasFoot}>
      <span className={styles.footLeft} title={detail || undefined}>
        <span>
          {chapterWordCount.toLocaleString()}{" "}
          {chapterWordCount === 1 ? "word" : "words"}
        </span>
        <span className={styles.footDim}>
          {bookStats.totalWords.toLocaleString()} in the book
        </span>
      </span>
      {onOpenBookMind && (
        <BookMindAgent isLoading={isBookMindLoading} onOpen={onOpenBookMind} />
      )}
    </div>
  );

  const previewing = mode === "preview";

  return (
    <>
      {previewing && (
        <PreviewSlot chapters={chapters} selectedChapter={selectedChapter} />
      )}
      {previewing && footer}
      <div
        className={`w-full flex-1 min-h-0 flex ${previewing ? "hidden" : ""}`}
      >
        <ChapterIndex
          chapters={chapters}
          selectedChapter={selectedChapter}
          onSelectChapter={onChapterSelect}
        />
        <div
          className={[
            "w-full flex-1 min-h-0 flex flex-col",
            focus.active && focus.settings.paragraphFocus
              ? "paragraph-focus"
              : "",
            focus.active && focus.settings.typewriterMode
              ? "typewriter-mode"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ChapterPanel
            chapter={chapter}
            selectedChapter={selectedChapter}
            onTitleChange={onChapterTitleChange}
            onContentChange={onChapterContentChange}
            onCreateEndnote={onCreateEndnote}
            hasEndnotes={endnotesCount > 0}
            hideToolbar={focus.active && focus.settings.hideToolbar}
            onInlineEditRequest={onInlineEditRequest}
            onComposeRequest={onComposeRequest}
            starters={starters}
            footer={footer}
          />
        </div>
      </div>
    </>
  );
}
