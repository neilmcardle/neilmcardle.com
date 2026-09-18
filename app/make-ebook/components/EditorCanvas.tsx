"use client";

import React from "react";
import { LockIcon } from "./icons";
import RichTextEditor from "./RichTextEditor";
import BookMindAgent from "./BookMindAgent";
import ChapterScrollRail from "./ChapterScrollRail";
import PreviewSurface from "./PreviewSurface";
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
  isBookMindLoading = false,
  onOpenBookMind,
  onBookMindHistory,
}: EditorCanvasProps) {
  const chapter = chapters[selectedChapter];
  const sectionLabel =
    chapter?.type === "frontmatter"
      ? "Front Matter"
      : chapter?.type === "backmatter"
        ? "Back Matter"
        : "Chapter";

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
        <ChapterScrollRail
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
          <div className={styles.editorCanvas}>
            <div
              key={chapter?.id ?? selectedChapter}
              className={`me-chapter-in ${styles.editorPanel}`}
            >
              <p className={styles.chapterEyebrow}>{sectionLabel}</p>
              <input
                className={styles.chapterTitle}
                placeholder="Chapter title..."
                aria-label="Chapter title"
                value={chapter?.title ?? ""}
                onChange={(e) =>
                  onChapterTitleChange(selectedChapter, e.target.value)
                }
              />

              {chapter?.locked && (
                <p className={styles.lockNote}>
                  <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  This chapter is locked. Click the lock icon in the chapter
                  list to edit.
                </p>
              )}

              <RichTextEditor
                value={chapter?.content || ""}
                onChange={(html) =>
                  onChapterContentChange(selectedChapter, html)
                }
                minHeight={240}
                placeholder={
                  selectedChapter === 0
                    ? "Start writing, or type / for AI commands..."
                    : "Continue writing, or type / for AI commands..."
                }
                className="flex-1 min-h-0"
                contentClassName={styles.editorProse}
                onCreateEndnote={onCreateEndnote}
                chapterId={chapter?.id}
                hasEndnotes={endnotesCount > 0}
                disabled={!!chapter?.locked}
                hideToolbar={focus.active && focus.settings.hideToolbar}
                onInlineEditRequest={onInlineEditRequest}
                onComposeRequest={onComposeRequest}
              />
            </div>
          </div>

          {footer}
        </div>
      </div>
    </>
  );
}
