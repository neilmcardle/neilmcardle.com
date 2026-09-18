"use client";

import React from "react";
import { LockIcon } from "./icons";
import RichTextEditor from "./RichTextEditor";
import styles from "../styles/studio.module.css";

interface Chapter {
  id: string;
  type: "frontmatter" | "content" | "backmatter";
  title: string;
  content: string;
  locked?: boolean;
}

interface ChapterPanelProps {
  chapter?: Chapter;
  selectedChapter: number;
  onTitleChange: (index: number, title: string) => void;
  onContentChange: (index: number, html: string) => void;
  onCreateEndnote?: (selectedText: string, chapterId?: string) => string;
  hasEndnotes?: boolean;
  hideToolbar?: boolean;
  onFocusStateChange?: (focused: boolean) => void;
  onInlineEditRequest?: (args: {
    selectedText: string;
    range: Range;
    rect: DOMRect;
    instruction?: string;
  }) => void;
  onComposeRequest?: (args: { range: Range; rect: DOMRect }) => void;
}

export function sectionLabelFor(chapter?: Chapter) {
  if (chapter?.type === "frontmatter") return "Front matter";
  if (chapter?.type === "backmatter") return "Back matter";
  return "Chapter";
}

export default function ChapterPanel({
  chapter,
  selectedChapter,
  onTitleChange,
  onContentChange,
  onCreateEndnote,
  hasEndnotes = false,
  hideToolbar = false,
  onFocusStateChange,
  onInlineEditRequest,
  onComposeRequest,
}: ChapterPanelProps) {
  return (
    <div className={styles.editorCanvas}>
      <div
        key={chapter?.id ?? selectedChapter}
        className={`me-chapter-in ${styles.editorPanel}`}
      >
        <p className={styles.chapterEyebrow}>{sectionLabelFor(chapter)}</p>
        <input
          className={styles.chapterTitle}
          placeholder="Chapter title..."
          aria-label="Chapter title"
          value={chapter?.title ?? ""}
          onChange={(e) => onTitleChange(selectedChapter, e.target.value)}
        />

        {chapter?.locked && (
          <p className={styles.lockNote}>
            <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
            This chapter is locked. Click the lock icon in the chapter list to
            edit.
          </p>
        )}

        <RichTextEditor
          value={chapter?.content || ""}
          onChange={(html) => onContentChange(selectedChapter, html)}
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
          hasEndnotes={hasEndnotes}
          disabled={!!chapter?.locked}
          hideToolbar={hideToolbar}
          onFocusStateChange={onFocusStateChange}
          onInlineEditRequest={onInlineEditRequest}
          onComposeRequest={onComposeRequest}
        />
      </div>
    </div>
  );
}
