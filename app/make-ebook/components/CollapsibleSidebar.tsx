"use client";

import React, { useState, useRef, useEffect } from "react";

import LibraryPanel from "./sidebar/LibraryPanel";
import BookDetailsPanel from "./sidebar/BookDetailsPanel";
import ChaptersPanel from "./sidebar/ChaptersPanel";
import BookSummaryHeader from "./sidebar/BookSummaryHeader";
import SyncConflictBanner from "./sidebar/SyncConflictBanner";
import { BookRecord } from "../types";

interface Chapter {
  id: string;
  type: "frontmatter" | "content" | "backmatter";
  title: string;
  content: string;
  locked?: boolean;
  completed?: boolean;
  synopsis?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  savedAt: number;
  coverUrl?: string;
}

interface CollapsibleSidebarProps {
  isPanelOpen: boolean;

  activeView: "library" | "book" | "chapters" | null;

  onClose: () => void;

  libraryBooks: Book[];
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  handleLoadBook: (id: string) => void;
  handleDeleteBook: (id: string) => void;
  showNewBookConfirmation: () => void;
  showImportDialog: () => void;

  multiSelectMode: boolean;
  setMultiSelectMode: (value: boolean) => void;
  selectedBookIds: Set<string>;
  toggleBookSelection: (id: string) => void;
  toggleSelectAll: () => void;
  handleDeleteSelectedBooks: () => void;

  syncConflicts: { local: BookRecord; cloud: BookRecord }[];
  onResolveSyncConflict: (choice: "local" | "cloud" | "both") => void;

  chapters: Chapter[];
  selectedChapter: number;
  handleSelectChapter: (index: number) => void;
  handleAddChapter: (
    type: "frontmatter" | "content" | "backmatter",
    title?: string,
  ) => void;
  handleRemoveChapter: (index: number) => void;
  confirmChapterDelete?: (index: number) => void;
  handleToggleChapterLock?: (index: number) => void;
  handleToggleChapterComplete?: (index: number) => void;
  handleDragStart: (index: number) => void;
  handleDragEnter: (index: number) => void;
  handleDragEnd: () => void;
  handleTouchStart: (index: number, e: React.TouchEvent) => void;
  handleTouchMove: (index: number, e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  dragOverIndex: number | null;
  dragItemIndex: number | null;
  ghostPillPosition: { visible: boolean; x: number; y: number };
  getContentChapterNumber: (chapters: Chapter[], index: number) => number;
  chapterWordCounts?: number[];
  totalWords?: number;

  title: string;
  setTitle: (value: string) => void;
  author: string;
  setAuthor: (value: string) => void;
  blurb: string;
  setBlurb: (value: string) => void;
  publisher: string;
  setPublisher: (value: string) => void;
  pubDate: string;
  setPubDate: (value: string) => void;
  isbn: string;
  setIsbn: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  genre: string;
  setGenre: (value: string) => void;
  tags: string[];
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  coverFile: string | null;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCoverFile?: (dataUrl: string) => void;
  lockedSections: {
    bookInfo: boolean;
    publishing: boolean;
    tags: boolean;
    cover: boolean;
  };

  sidebarLibraryExpanded: boolean;
  setSidebarLibraryExpanded: (value: boolean) => void;
  sidebarChaptersExpanded: boolean;
  setSidebarChaptersExpanded: (value: boolean) => void;
  sidebarBookDetailsExpanded: boolean;
  setSidebarBookDetailsExpanded: (value: boolean) => void;
}

const MIN_WIDTH = 220;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 350;

export default function CollapsibleSidebar(props: CollapsibleSidebarProps) {
  const { isPanelOpen, activeView, onClose } = props;

  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("me-left-panel-width");
      return saved
        ? Math.min(Math.max(parseInt(saved, 10), MIN_WIDTH), MAX_WIDTH)
        : DEFAULT_WIDTH;
    }
    return DEFAULT_WIDTH;
  });
  const sidebarRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    if (sidebarRef.current) sidebarRef.current.style.transition = "none";
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(
        Math.max(startWidth.current + e.clientX - startX.current, MIN_WIDTH),
        MAX_WIDTH,
      );
      if (sidebarRef.current) sidebarRef.current.style.width = `${next}px`;
      if (innerRef.current) {
        innerRef.current.style.width = `${next}px`;
        innerRef.current.style.minWidth = `${next}px`;
      }
    };
    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (sidebarRef.current) {
        sidebarRef.current.style.transition = "";
        const final = Math.min(
          Math.max(
            Math.round(
              parseFloat(sidebarRef.current.style.width) || startWidth.current,
            ),
            MIN_WIDTH,
          ),
          MAX_WIDTH,
        );
        setWidth(final);
        try {
          localStorage.setItem("me-left-panel-width", String(final));
        } catch {}
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`hidden lg:block h-full z-40 transition-all duration-300 ease-in-out overflow-hidden relative ${
        isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ width: isPanelOpen ? width : 0 }}
    >
      <div
        ref={innerRef}
        className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#2a2a2a]"
        style={{ width, minWidth: width }}
      >
        <div className="flex justify-end px-4 pt-2 pb-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 dark:hover:bg-[#262626] rounded-lg transition-colors"
            title="Close panel"
            aria-label="Close panel"
          >
            <img
              src="/close-sidebar-icon.svg"
              alt="Close"
              className="w-5 h-5 dark:hidden"
            />
            <img
              src="/dark-close-sidebar-icon.svg"
              alt="Close"
              className="w-5 h-5 hidden dark:block"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#C0C0C0] hover:scrollbar-thumb-[#C0C0C0] dark:scrollbar-thumb-[#C0C0C0] dark:hover:scrollbar-thumb-[#C0C0C0]">
          {activeView === "library" && (
            <>
              <SyncConflictBanner
                conflicts={props.syncConflicts}
                onResolve={props.onResolveSyncConflict}
              />
              <LibraryPanel
                libraryBooks={props.libraryBooks}
                selectedBookId={props.selectedBookId}
                setSelectedBookId={props.setSelectedBookId}
                handleLoadBook={props.handleLoadBook}
                handleDeleteBook={props.handleDeleteBook}
                showNewBookConfirmation={props.showNewBookConfirmation}
                showImportDialog={props.showImportDialog}
                multiSelectMode={props.multiSelectMode}
                setMultiSelectMode={props.setMultiSelectMode}
                selectedBookIds={props.selectedBookIds}
                toggleBookSelection={props.toggleBookSelection}
                toggleSelectAll={props.toggleSelectAll}
                handleDeleteSelectedBooks={props.handleDeleteSelectedBooks}
              />
            </>
          )}

          {activeView === "book" && (
            <BookDetailsPanel
              title={props.title}
              setTitle={props.setTitle}
              author={props.author}
              setAuthor={props.setAuthor}
              blurb={props.blurb}
              setBlurb={props.setBlurb}
              publisher={props.publisher}
              setPublisher={props.setPublisher}
              pubDate={props.pubDate}
              setPubDate={props.setPubDate}
              isbn={props.isbn}
              setIsbn={props.setIsbn}
              language={props.language}
              setLanguage={props.setLanguage}
              genre={props.genre}
              setGenre={props.setGenre}
              tags={props.tags}
              handleAddTag={props.handleAddTag}
              handleRemoveTag={props.handleRemoveTag}
              tagInput={props.tagInput}
              setTagInput={props.setTagInput}
              coverFile={props.coverFile}
              handleCoverChange={props.handleCoverChange}
              setCoverFile={props.setCoverFile}
              lockedSections={props.lockedSections}
            />
          )}

          {activeView === "chapters" && (
            <>
              <BookSummaryHeader
                title={props.title}
                author={props.author}
                genre={props.genre}
                totalWords={props.totalWords ?? 0}
                completedChapters={
                  props.chapters.filter((c) => c.completed).length
                }
                totalChapters={props.chapters.length}
              />
              <ChaptersPanel
                chapters={props.chapters}
                selectedChapter={props.selectedChapter}
                handleSelectChapter={props.handleSelectChapter}
                handleAddChapter={props.handleAddChapter}
                handleRemoveChapter={props.handleRemoveChapter}
                confirmChapterDelete={props.confirmChapterDelete}
                handleToggleChapterLock={props.handleToggleChapterLock}
                handleToggleChapterComplete={props.handleToggleChapterComplete}
                handleDragStart={props.handleDragStart}
                handleDragEnter={props.handleDragEnter}
                handleDragEnd={props.handleDragEnd}
                handleTouchStart={props.handleTouchStart}
                handleTouchMove={props.handleTouchMove}
                handleTouchEnd={props.handleTouchEnd}
                dragOverIndex={props.dragOverIndex}
                dragItemIndex={props.dragItemIndex}
                ghostPillPosition={props.ghostPillPosition}
                getContentChapterNumber={props.getContentChapterNumber}
                chapterWordCounts={props.chapterWordCounts}
              />
            </>
          )}
        </div>
      </div>

      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize z-50 hidden lg:block hover:bg-gray-300 dark:hover:bg-[#3a3a3a] transition-colors"
        onMouseDown={handleResizeStart}
      />
    </aside>
  );
}
