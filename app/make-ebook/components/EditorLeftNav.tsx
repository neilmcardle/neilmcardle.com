"use client";

import React from "react";
import SlimSidebarNav from "./SlimSidebarNav";
import CollapsibleSidebar from "./CollapsibleSidebar";
import { useSession } from "../providers/SessionProvider";
import { useBook, useBookActions } from "../providers/BookProvider";
import { useEditor, useEditorActions } from "../providers/EditorProvider";
import { shallowEqual } from "../providers/store";

export default function EditorLeftNav() {
  const hasSyncConflicts = useSession(
    (s) => s.cloudSync.syncConflicts.length > 0,
  );
  const { libraryCount, chaptersCount } = useBook(
    (s) => ({
      libraryCount: s.libraryBooks.length,
      chaptersCount: s.chapters.length,
    }),
    shallowEqual,
  );
  const { activeView, isPanelOpen, isBookMindOpen } = useEditor(
    (s) => ({
      activeView: s.sidebarView,
      isPanelOpen: s.isPanelOpen,
      isBookMindOpen: s.bookMindOpen,
    }),
    shallowEqual,
  );
  const book = useBookActions();
  const editor = useEditorActions();

  return (
    <>
      <SlimSidebarNav
        activeView={activeView}
        onViewChange={editor.setSidebarView}
        libraryCount={libraryCount}
        chaptersCount={chaptersCount}
        isPanelOpen={isPanelOpen}
        onLogoClick={book.goHome}
        onStartTour={() => editor.startTour(100)}
        onBookMindToggle={() => editor.setBookMindOpen((prev) => !prev)}
        isBookMindOpen={isBookMindOpen}
        hasSyncConflicts={hasSyncConflicts}
      />

      <CollapsibleSidebar />
    </>
  );
}
