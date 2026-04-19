'use client';

// Desktop left navigation: the slim icon rail + the collapsible content
// sidebar. Extracted from page.tsx as a thin composition so the huge block
// of prop plumbing lives in one place. The component itself doesn't own any
// state — that all stays in page.tsx — it's purely a composition boundary.
//
// If you find yourself adding state *inside* EditorLeftNav, pause: it almost
// certainly belongs in a hook, not a component.

import React from 'react';
import SlimSidebarNav from './SlimSidebarNav';
import CollapsibleSidebar from './CollapsibleSidebar';
import type { RightPanelMode } from './LayoutSwitcher';

interface Chapter {
  id: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  title: string;
  content: string;
  locked?: boolean;
}

interface Book {
  id: string;
  title: string;
  author: string;
  savedAt: number;
  coverUrl?: string;
}

export interface EditorLeftNavProps {
  // Visibility control
  isPanelOpen: boolean;
  activeView: 'library' | 'book' | 'chapters' | 'notes' | null;
  onViewChange: (view: 'library' | 'book' | 'chapters' | 'notes' | null) => void;
  onClose: () => void;

  // Slim nav: logo, tour, book mind toggle
  onLogoClick: () => void;
  onStartTour: () => void;
  onBookMindToggle: () => void;
  rightPanelMode: RightPanelMode;

  // Library
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

  // Chapters
  chapters: Chapter[];
  selectedChapter: number;
  handleSelectChapter: (index: number) => void;
  handleAddChapter: (type: 'frontmatter' | 'content' | 'backmatter', title?: string) => void;
  handleRemoveChapter: (index: number) => void;
  handleToggleChapterLock?: (index: number) => void;
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

  // Book metadata
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
  lockedSections: { bookInfo: boolean; publishing: boolean; tags: boolean; cover: boolean };

  // Notes
  outlineNotes: string;
  setOutlineNotes: (value: string) => void;

  // Mobile accordion state — passed through for compatibility; the split
  // panels no longer read these, but they're still used by the mobile
  // accordion rendered inline in page.tsx.
  sidebarLibraryExpanded: boolean;
  setSidebarLibraryExpanded: (value: boolean) => void;
  sidebarChaptersExpanded: boolean;
  setSidebarChaptersExpanded: (value: boolean) => void;
  sidebarBookDetailsExpanded: boolean;
  setSidebarBookDetailsExpanded: (value: boolean) => void;
}

export default function EditorLeftNav(props: EditorLeftNavProps) {
  return (
    <>
      <SlimSidebarNav
        activeView={props.activeView}
        onViewChange={props.onViewChange}
        libraryCount={props.libraryBooks.length}
        chaptersCount={props.chapters.length}
        isPanelOpen={props.isPanelOpen}
        onLogoClick={props.onLogoClick}
        onStartTour={props.onStartTour}
        onBookMindToggle={props.onBookMindToggle}
        isBookMindOpen={props.rightPanelMode === 'inspector'}
      />

      <CollapsibleSidebar
        isPanelOpen={props.isPanelOpen}
        activeView={props.activeView}
        onClose={props.onClose}
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
        chapters={props.chapters}
        selectedChapter={props.selectedChapter}
        handleSelectChapter={props.handleSelectChapter}
        handleAddChapter={props.handleAddChapter}
        handleRemoveChapter={props.handleRemoveChapter}
        handleToggleChapterLock={props.handleToggleChapterLock}
        outlineNotes={props.outlineNotes}
        setOutlineNotes={props.setOutlineNotes}
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
        sidebarLibraryExpanded={props.sidebarLibraryExpanded}
        setSidebarLibraryExpanded={props.setSidebarLibraryExpanded}
        sidebarChaptersExpanded={props.sidebarChaptersExpanded}
        setSidebarChaptersExpanded={props.setSidebarChaptersExpanded}
        sidebarBookDetailsExpanded={props.sidebarBookDetailsExpanded}
        setSidebarBookDetailsExpanded={props.setSidebarBookDetailsExpanded}
      />
    </>
  );
}
