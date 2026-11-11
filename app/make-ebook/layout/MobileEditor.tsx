"use client";
import React from "react";
import ChapterPanel from "../components/ChapterPanel";
import PreviewSurface from "../components/PreviewSurface";
import MobileTabBar from "../components/mobile/MobileTabBar";
import ChaptersSheet from "../components/mobile/ChaptersSheet";
import SelectionActionBar from "../components/mobile/SelectionActionBar";
import studio from "../styles/studio.module.css";
import { displayTitle } from "../utils/bookLibrary";
import { useSession } from "../providers/SessionProvider";
import { useBook, useBookActions } from "../providers/BookProvider";
import { useEditor, useEditorActions } from "../providers/EditorProvider";
import { shallowEqual } from "../providers/store";

export function MobileTopBar() {
  const { title, chapters } = useBook(
    (s) => ({ title: s.title, chapters: s.chapters }),
    shallowEqual,
  );
  const { showDirty, isSaving, hasFailed } = useEditor(
    (s) => ({
      showDirty: s.save.showDirty,
      isSaving: s.save.isSaving,
      hasFailed: s.save.hasFailed,
    }),
    shallowEqual,
  );
  const actions = useEditorActions();
  if (chapters.length === 0) return null;
  return (
    <div className={`lg:hidden ${studio.mobileBar}`} data-mobile-topbar>
      <button
        type="button"
        data-tour="mobile-menu"
        onClick={() => actions.setMobileSidebarOpen(true)}
        className={studio.mobileIconBtn}
        aria-label="Open menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M9 4v16" />
        </svg>
      </button>

      <div className={studio.mobileTitle}>
        <span className={studio.mobileTitleText}>
          {displayTitle({ title, chapters })}
        </span>
        <button
          type="button"
          className={studio.mobileStatus}
          onClick={() => {
            if (showDirty && !isSaving) {
              actions.saveNow();
            }
          }}
          aria-live="polite"
          aria-label={
            hasFailed && showDirty
              ? "Not saved. Retrying. Tap to try now"
              : showDirty || isSaving
                ? "Saving"
                : "Saved"
          }
        >
          <span
            className={`${studio.savedDot} ${
              hasFailed && showDirty
                ? studio.dirtyDot
                : showDirty || isSaving
                  ? studio.savingDot
                  : ""
            }`}
          />
          {hasFailed && showDirty
            ? "Not saved, retrying"
            : showDirty || isSaving
              ? "Saving…"
              : "Saved"}
        </button>
      </div>

      <button
        type="button"
        className={studio.mobileExport}
        onClick={() => actions.setPreflightFormat("epub")}
      >
        Export
      </button>
    </div>
  );
}

export function MobileSurface() {
  const { chapters, selectedChapter, hasEndnotes, isBlankBook } = useBook(
    (s) => ({
      chapters: s.chapters,
      selectedChapter: s.selectedChapter,
      hasEndnotes: s.endnotes.length > 0,
      isBlankBook: s.isBlankBook,
    }),
    shallowEqual,
  );
  const { surfaceMode, hideToolbar } = useEditor(
    (s) => ({
      surfaceMode: s.surfaceMode,
      hideToolbar: s.focus.active && s.focus.settings.hideToolbar,
    }),
    shallowEqual,
  );
  const book = useBookActions();
  const actions = useEditorActions();

  return (
    <div
      data-tour="mobile-editor"
      data-mobile-editor
      className={`lg:hidden flex flex-col ${chapters.length === 0 ? "" : "pt-[52px] pb-[92px]"} flex-1 min-h-0 overflow-hidden`}
    >
      {chapters.length === 0 ? (
        <div className="flex-1" />
      ) : surfaceMode === "preview" ? (
        <PreviewSurface chapters={chapters} selectedChapter={selectedChapter} />
      ) : (
        <>
          <ChapterPanel
            chapter={chapters[selectedChapter]}
            selectedChapter={selectedChapter}
            onTitleChange={book.handleChapterTitleChange}
            onContentChange={book.handleChapterContentChange}
            onCreateEndnote={book.handleCreateEndnote}
            hasEndnotes={hasEndnotes}
            hideToolbar={hideToolbar}
            onFocusStateChange={actions.setMobileEditorFocused}
            starters={
              isBlankBook
                ? {
                    onUpload: book.showImportDialog,
                    onLibrary: () => actions.setMobileSidebarOpen(true),
                  }
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}

export function MobileChrome() {
  const hasBookMind = useSession((s) => s.hasBookMind);
  const { chapters, selectedChapter } = useBook(
    (s) => ({ chapters: s.chapters, selectedChapter: s.selectedChapter }),
    shallowEqual,
  );
  const ui = useEditor(
    (s) => ({
      chaptersSheetOpen: s.chaptersSheetOpen,
      mobileBookMindOpen: s.mobileBookMindOpen,
      mobileEditorFocused: s.mobileEditorFocused,
      surfaceMode: s.surfaceMode,
      bookStats: s.bookStats,
    }),
    shallowEqual,
  );
  const book = useBookActions();
  const actions = useEditorActions();
  if (chapters.length === 0) return null;

  return (
    <>
      <div className="lg:hidden">
        <ChaptersSheet
          open={ui.chaptersSheetOpen}
          onClose={() => actions.setChaptersSheetOpen(false)}
          chapters={chapters}
          selectedChapter={selectedChapter}
          wordCounts={ui.bookStats.chapterStats.map((c) => c.wordCount)}
          totalWords={ui.bookStats.totalWords}
          onSelectChapter={book.handleSelectChapter}
          onToggleComplete={book.handleToggleChapterComplete}
          onAddChapter={() => {
            book.handleAddChapter("content");
            actions.setChaptersSheetOpen(false);
          }}
          onBulkComplete={book.handleBulkComplete}
          onBulkDelete={book.handleBulkDelete}
        />
      </div>

      {hasBookMind && !ui.mobileBookMindOpen && (
        <div className="lg:hidden">
          <SelectionActionBar
            onRewrite={(selectedText, range, rect) =>
              actions.handleInlineEditRequest({
                selectedText,
                range,
                rect,
                instruction: "Rewrite this passage.",
              })
            }
            onTighten={(selectedText, range, rect) =>
              actions.handleInlineEditRequest({
                selectedText,
                range,
                rect,
                instruction: "Tighten this passage. Same meaning, fewer words.",
              })
            }
            onAsk={(selectedText, range, rect) =>
              actions.handleInlineEditRequest({ selectedText, range, rect })
            }
          />
        </div>
      )}

      {!ui.mobileEditorFocused && (
        <div className="lg:hidden">
          <MobileTabBar
            active={
              ui.chaptersSheetOpen
                ? "chapters"
                : ui.mobileBookMindOpen
                  ? "bookmind"
                  : ui.surfaceMode === "preview"
                    ? "preview"
                    : "write"
            }
            hasBookMind={hasBookMind}
            onWrite={() => {
              actions.setChaptersSheetOpen(false);
              actions.setMobileBookMindOpen(false);
              actions.setSurfaceMode("edit");
            }}
            onPreview={() => {
              actions.setChaptersSheetOpen(false);
              actions.setMobileBookMindOpen(false);
              actions.setSurfaceMode("preview");
            }}
            onChapters={() => {
              actions.setMobileBookMindOpen(false);
              actions.setChaptersSheetOpen((prev) => !prev);
            }}
            onBookMind={() => {
              actions.setChaptersSheetOpen(false);
              actions.setMobileBookMindOpen(true);
            }}
          />
        </div>
      )}
    </>
  );
}
