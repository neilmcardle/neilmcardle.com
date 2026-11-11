"use client";
import React from "react";
import EditorLeftNav from "../components/EditorLeftNav";
import EditorHeader from "../components/EditorHeader";
import EditorCanvas from "../components/EditorCanvas";
import { useSession } from "../providers/SessionProvider";
import { useBook, useBookActions } from "../providers/BookProvider";
import { useEditor, useEditorActions } from "../providers/EditorProvider";
import { shallowEqual } from "../providers/store";

export function DesktopNav() {
  const hidden = useEditor(
    (s) => s.focus.active && s.focus.settings.hideChrome,
  );
  if (hidden) return null;
  return <EditorLeftNav />;
}

export function DesktopSurface() {
  const { hasCloudSync, hasBookMind } = useSession(
    (s) => ({ hasCloudSync: s.hasCloudSync, hasBookMind: s.hasBookMind }),
    shallowEqual,
  );
  const { chapters, selectedChapter, title, endnotesCount, isBlankBook } =
    useBook(
      (s) => ({
        chapters: s.chapters,
        selectedChapter: s.selectedChapter,
        title: s.title,
        endnotesCount: s.endnotes.length,
        isBlankBook: s.isBlankBook,
      }),
      shallowEqual,
    );
  const editor = useEditor(
    (s) => ({
      save: s.save,
      versionCount: s.versions.length,
      exportCount: s.exportHistory.length,
      focus: s.focus,
      flowMode: s.flowMode,
      surfaceMode: s.surfaceMode,
      bookStats: s.bookStats,
      sessionStats: s.sessionStats,
      todayWords: s.todayWords,
      bookMindBusy: s.bookMindBusy,
    }),
    shallowEqual,
  );
  const book = useBookActions();
  const actions = useEditorActions();
  const { save, focus } = editor;

  return (
    <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
      {chapters.length === 0 ? (
        <div className="flex-1" />
      ) : (
        <section className="flex flex-col min-w-0 flex-1 min-h-0 pt-2 bg-white dark:bg-[var(--ink)]">
          <EditorHeader
            isDirty={save.showDirty}
            hasFailed={save.hasFailed}
            cloudPending={save.cloudPending}
            isSaving={save.isSaving}
            lastSaved={save.lastSaved}
            hasCloudSync={hasCloudSync}
            onSaveNow={actions.saveNow}
            chapters={chapters}
            selectedChapter={selectedChapter}
            onChapterSelect={book.setSelectedChapter}
            bookTitle={title}
            onSaveAsNewBook={actions.handleSaveAsNewVersion}
            versionCount={editor.versionCount}
            exportCount={editor.exportCount}
            onShowHistory={() => actions.setHistoryModal("versions")}
            focusActive={focus.active}
            onToggleFocusMode={actions.toggleFocusMode}
            flowMode={editor.flowMode}
            onToggleFlowMode={actions.handleToggleFlowMode}
            surfaceMode={editor.surfaceMode}
            onSurfaceModeChange={actions.setSurfaceMode}
            onExportEPUB={() => actions.setPreflightFormat("epub")}
            onExportPDF={() => actions.setPreflightFormat("pdf")}
            onExportDocx={() => actions.setPreflightFormat("docx")}
            hideChrome={focus.active && focus.settings.hideChrome}
          />
          <EditorCanvas
            mode={editor.surfaceMode}
            starters={
              isBlankBook
                ? {
                    onUpload: book.showImportDialog,
                    onLibrary: () => actions.setSidebarView("library"),
                  }
                : undefined
            }
            chapters={chapters}
            selectedChapter={selectedChapter}
            onChapterTitleChange={book.handleChapterTitleChange}
            onChapterContentChange={book.handleChapterContentChange}
            onChapterSelect={book.handleSelectChapter}
            onCreateEndnote={book.handleCreateEndnote}
            endnotesCount={endnotesCount}
            bookStats={editor.bookStats}
            sessionStats={editor.sessionStats}
            todayWords={editor.todayWords}
            focus={focus}
            onInlineEditRequest={
              hasBookMind ? actions.handleInlineEditRequest : undefined
            }
            onComposeRequest={
              hasBookMind ? actions.handleComposeRequest : undefined
            }
            isBookMindLoading={editor.bookMindBusy}
            onOpenBookMind={() => actions.setBookMindOpen(true)}
          />
        </section>
      )}
    </div>
  );
}
