"use client";

import React from "react";
import BookMindAgent from "./BookMindAgent";
import { ChapterIndex } from "./ChapterIndex";
import PreviewSurface from "./PreviewSurface";
import ChapterPanel, { sectionLabelFor } from "./ChapterPanel";
import styles from "../styles/studio.module.css";
import type { FocusSettings as FocusModeSettings } from "../hooks/useFocusMode";
import { ModKey } from "./PlatformKey";

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
  onBookMindHistory?: () => void;
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
  onBookMindHistory,
}: EditorCanvasProps) {
  const chapter = chapters[selectedChapter];
  const sectionLabel = sectionLabelFor(chapter);

  const chapterWordCount =
    bookStats.chapterStats?.[selectedChapter]?.wordCount ?? 0;

  const footer = (
    <div className={styles.canvasFoot}>
      <span className={styles.footLeft}>
        {onBookMindHistory && (
          <button
            type="button"
            onClick={onBookMindHistory}
            className={styles.footButton}
            title="History"
            aria-label="Recent conversations"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}
        <span>{sectionLabel}</span>
        {onInlineEditRequest && (
          <span className={styles.footKeys}>
            <kbd className={styles.footKey}>
              <ModKey keyName="K" />
            </kbd>
            <span>edit with AI</span>
            <kbd className={styles.footKey}>/</kbd>
            <span>commands</span>
          </span>
        )}
        {sessionStats.wordsThisSession > 0 && (
          <span className={styles.footGain}>
            +{sessionStats.wordsThisSession.toLocaleString()} this session
          </span>
        )}
        {todayWords > 0 && <span>{todayWords.toLocaleString()} today</span>}
      </span>
      <span className={styles.footLeft}>
        <span>{chapterWordCount.toLocaleString()} words</span>
        <span className={styles.footDim}>
          {bookStats.totalWords.toLocaleString()} in the book
        </span>
        {onOpenBookMind && (
          <BookMindAgent
            isLoading={isBookMindLoading}
            onOpen={onOpenBookMind}
          />
        )}
      </span>
    </div>
  );

  if (mode === "preview") {
    return (
      <>
        <PreviewSurface chapters={chapters} selectedChapter={selectedChapter} />
        {footer}
      </>
    );
  }

  return (
    <>
      <div className="w-full flex-1 min-h-0 flex">
        <ChapterIndex
          chapters={chapters}
          selectedChapter={selectedChapter}
          onSelectChapter={onChapterSelect}
        />
        <div
          data-tour="editor"
          className={[
            "w-full flex-1 min-h-0 flex flex-col transition-all duration-300",
            focus.active && focus.settings.columnWidth === "narrow"
              ? "focus-col-narrow"
              : "",
            focus.active && focus.settings.columnWidth === "normal"
              ? "focus-col-normal"
              : "",
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
          />

          {footer}
        </div>
      </div>
    </>
  );
}
