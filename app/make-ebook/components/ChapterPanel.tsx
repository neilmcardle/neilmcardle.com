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
  starters?: { onUpload: () => void; onLibrary: () => void };
  footer?: React.ReactNode;
}

const STARTER_ICONS = {
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  library: "M4 4v16M10 7v13M16 5v15M3 20h18",
};

function StarterIcon({ d }: { d: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
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
  starters,
  footer,
}: ChapterPanelProps) {
  return (
    <div className={styles.editorCanvas}>
      <div
        key={chapter?.id ?? selectedChapter}
        className={`me-chapter-in ${styles.editorPanel}`}
      >
        <p className={styles.chapterEyebrow} data-chapter-eyebrow>
          {sectionLabelFor(chapter)}
        </p>
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
            starters
              ? "Start writing, or paste your manuscript"
              : "Continue writing..."
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

        {starters && (
          <div className={styles.starters}>
            <span className={styles.startersLabel}>Or get started with</span>
            <div className={styles.starterRow}>
              <button
                type="button"
                className={styles.starterChip}
                onClick={starters.onUpload}
              >
                <StarterIcon d={STARTER_ICONS.upload} />
                Upload a file
              </button>
              <button
                type="button"
                className={styles.starterChip}
                onClick={starters.onLibrary}
              >
                <StarterIcon d={STARTER_ICONS.library} />
                Open library
              </button>
            </div>
          </div>
        )}
      </div>
      {footer && <div className={styles.panelFoot}>{footer}</div>}
    </div>
  );
}
