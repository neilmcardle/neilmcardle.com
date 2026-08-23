"use client";

import React from "react";
import { LockIcon } from "./icons";
import RichTextEditor from "./RichTextEditor";
import BookMindAgent from "./BookMindAgent";
import ChapterScrollRail from "./ChapterScrollRail";
import type { FocusSettings as FocusModeSettings } from "../hooks/useFocusMode";
import { ModKey } from "./marketing/sections-v2/PlatformKey";

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

  return (
    <>
      <div className="flex-shrink-0 px-6 pt-6 pb-4 bg-white dark:bg-[#1e1e1e] dark:border-b dark:border-[#2f2f2f]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30 mb-2 select-none">
          {sectionLabel}
        </div>
        <input
          className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none min-w-0 text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-white/20"
          style={{
            border: "none",
            backgroundColor: "transparent",
            boxShadow: "none",
            padding: 0,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "1.375rem",
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
          placeholder="Chapter title..."
          value={chapter?.title ?? ""}
          onChange={(e) =>
            onChapterTitleChange(selectedChapter, e.target.value)
          }
        />
      </div>

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
          {onInlineEditRequest && (
            <div className="mt-2 mb-3 flex-shrink-0 flex items-center justify-end px-6">
              <div className="hidden lg:flex items-center gap-2 text-2xs text-gray-400 dark:text-[#737373]">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-[#262626] border border-gray-200 dark:border-[#3a3a3a] text-gray-500 dark:text-[#a3a3a3] font-mono text-[10px] leading-none">
                    <ModKey keyName="K" />
                  </kbd>
                  <span>edit with AI</span>
                </span>
                <span className="text-gray-300 dark:text-[#3a3a3a]">
                  &middot;
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-[#262626] border border-gray-200 dark:border-[#3a3a3a] text-gray-500 dark:text-[#a3a3a3] font-mono text-[10px] leading-none">
                    /
                  </kbd>
                  <span>commands</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0">
            {chapter?.locked && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-[#2f2f2f] text-xs text-gray-500 dark:text-gray-400">
                <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  This chapter is locked. Click the lock icon in the chapter
                  list to edit.
                </span>
              </div>
            )}
            <RichTextEditor
              value={chapter?.content || ""}
              onChange={(html) => onChapterContentChange(selectedChapter, html)}
              minHeight={400}
              placeholder={
                selectedChapter === 0
                  ? "Start writing, or type / for AI commands..."
                  : "Continue writing, or type / for AI commands..."
              }
              className="h-full text-lg placeholder:text-[#a0a0a0] placeholder:text-lg"
              onCreateEndnote={onCreateEndnote}
              chapterId={chapter?.id}
              hasEndnotes={endnotesCount > 0}
              disabled={!!chapter?.locked}
              hideToolbar={focus.active && focus.settings.hideToolbar}
              onInlineEditRequest={onInlineEditRequest}
              onComposeRequest={onComposeRequest}
            />
          </div>

          <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-t border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-400">
              {onBookMindHistory && (
                <button
                  onClick={onBookMindHistory}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                  title="History"
                  aria-label="Recent conversations"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              )}
              <span className="flex items-center gap-2">
                <span className="text-gray-300 dark:text-gray-500">
                  Chapter:
                </span>
                <span className="tabular-nums">
                  {chapterWordCount.toLocaleString()} words
                </span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="flex items-center gap-2">
                <span className="text-gray-300 dark:text-gray-500">Book:</span>
                <span className="tabular-nums">
                  {bookStats.totalWords.toLocaleString()} words
                </span>
              </span>
              {sessionStats.wordsThisSession > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-green-500/70 dark:text-green-500/50 tabular-nums">
                    +{sessionStats.wordsThisSession.toLocaleString()} this
                    session
                  </span>
                </>
              )}
              {todayWords > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                    {todayWords.toLocaleString()} today
                  </span>
                </>
              )}
            </div>

            {onOpenBookMind && (
              <BookMindAgent
                isLoading={isBookMindLoading}
                onOpen={onOpenBookMind}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
