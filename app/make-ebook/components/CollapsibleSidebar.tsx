"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PlusIcon, TrashIcon, SaveIcon, DownloadIcon, CloseIcon } from './icons';
import { ExportHistoryButton } from './ExportHistoryPanel';
import EmptyStateHint from './EmptyStateHint';
import DragIcon from './icons/DragIcon';
import BinIcon from './icons/BinIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import SubscriptionBadge from './SubscriptionBadge';
import ManageBillingButton from './ManageBillingButton';
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

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

interface CollapsibleSidebarProps {
  // Panel visibility (always rendered, animated via CSS)
  isPanelOpen: boolean;
  // Active view from slim sidebar
  activeView: 'library' | 'book' | 'chapters' | 'preview' | null;
  // Close handler
  onClose: () => void;
  
  // Library props
  libraryBooks: Book[];
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  handleLoadBook: (id: string) => void;
  handleDeleteBook: (id: string) => void;
  handleExportLibraryBook: (id: string) => void;
  showNewBookConfirmation: () => void;
  showImportDialog: () => void;
  
  // Multi-select props
  multiSelectMode: boolean;
  setMultiSelectMode: (value: boolean) => void;
  selectedBookIds: Set<string>;
  toggleBookSelection: (id: string) => void;
  toggleSelectAll: () => void;
  handleDeleteSelectedBooks: () => void;
  
  // Chapters props
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
  
  // Book Details props
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
  lockedSections: { bookInfo: boolean; publishing: boolean; tags: boolean; cover: boolean };
  
  // Preview props
  coverUrl: string | null;
  totalWords: number;
  pageCount: number;
  readingTime: number;
  
  // Actions
  handleSaveBook: () => void;
  handleExportEPUB: () => void;
  handleExportPDF: () => void;
  saveFeedback: boolean;

  // Export history
  exportHistoryCount: number;
  onShowExportHistory: () => void;
  
  // Expanded state
  sidebarLibraryExpanded: boolean;
  setSidebarLibraryExpanded: (value: boolean) => void;
  sidebarPreviewExpanded: boolean;
  setSidebarPreviewExpanded: (value: boolean) => void;
  sidebarChaptersExpanded: boolean;
  setSidebarChaptersExpanded: (value: boolean) => void;
  sidebarBookDetailsExpanded: boolean;
  setSidebarBookDetailsExpanded: (value: boolean) => void;
}

const CHAPTER_TEMPLATES = {
  frontmatter: [
    { title: 'Title Page' },
    { title: 'Copyright' },
    { title: 'Dedication' },
    { title: 'Foreword' },
    { title: 'Preface' },
    { title: 'Acknowledgements' },
    { title: 'Introduction' },
    { title: 'Prologue' },
    { title: 'Custom Front Matter' },
  ],
  content: [
    { title: 'Chapter' },
    { title: 'Part' },
    { title: 'Section' },
    { title: 'Custom Chapter' },
  ],
  backmatter: [
    { title: 'Epilogue' },
    { title: 'Afterword' },
    { title: 'Appendix' },
    { title: 'Notes' },
    { title: 'Glossary' },
    { title: 'Bibliography' },
    { title: 'Index' },
    { title: 'About the Author' },
    { title: 'Custom Back Matter' },
  ],
};

const LANGUAGES = [
  'en - English',
  'es - Spanish', 
  'fr - French',
  'de - German',
  'it - Italian',
  'pt - Portuguese',
  'ru - Russian',
  'ja - Japanese',
  'zh - Chinese',
  'ar - Arabic',
];

function HandleDragIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition"
      aria-hidden="true"
    >
      <img
        src="/drag-icon.svg"
        alt="Drag"
        className="w-4 h-4 dark:hidden"
      />
      <img
        src="/dark-drag-icon.svg"
        alt="Drag"
        className="w-4 h-4 hidden dark:block"
      />
    </span>
  );
}

export default function CollapsibleSidebar(props: CollapsibleSidebarProps) {
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  
  const {
    isPanelOpen,
    activeView,
    onClose,
    libraryBooks,
    selectedBookId,
    setSelectedBookId,
    handleLoadBook,
    handleDeleteBook,
    handleExportLibraryBook,
    showNewBookConfirmation,
    showImportDialog,
    multiSelectMode,
    setMultiSelectMode,
    selectedBookIds,
    toggleBookSelection,
    toggleSelectAll,
    handleDeleteSelectedBooks,
    chapters,
    selectedChapter,
    handleSelectChapter,
    handleAddChapter,
    handleRemoveChapter,
    handleToggleChapterLock,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragOverIndex,
    dragItemIndex,
    ghostPillPosition,
    getContentChapterNumber,
    title,
    setTitle,
    author,
    setAuthor,
    blurb,
    setBlurb,
    publisher,
    setPublisher,
    pubDate,
    setPubDate,
    isbn,
    setIsbn,
    language,
    setLanguage,
    genre,
    setGenre,
    tags,
    handleAddTag,
    handleRemoveTag,
    tagInput,
    setTagInput,
    coverFile,
    handleCoverChange,
    lockedSections,
    coverUrl,
    totalWords,
    pageCount,
    readingTime,
    handleSaveBook,
    handleExportEPUB,
    handleExportPDF,
    saveFeedback,
    exportHistoryCount,
    onShowExportHistory,
    sidebarLibraryExpanded,
    setSidebarLibraryExpanded,
    sidebarPreviewExpanded,
    setSidebarPreviewExpanded,
    sidebarChaptersExpanded,
    setSidebarChaptersExpanded,
    sidebarBookDetailsExpanded,
    setSidebarBookDetailsExpanded,
  } = props;

  const handleClose = () => {
    onClose();
  };

  // ── Resizable width ──────────────────────────────────────────────
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('me-left-panel-width');
      return saved ? Math.min(Math.max(parseInt(saved, 10), 220), 560) : 350;
    }
    return 350;
  });
  const sidebarRef = useRef<HTMLElement>(null);
  const innerRef   = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX     = useRef(0);
  const startWidth = useRef(350);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current     = e.clientX;
    startWidth.current = width;
    if (sidebarRef.current) sidebarRef.current.style.transition = 'none';
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(Math.max(startWidth.current + e.clientX - startX.current, 220), 560);
      if (sidebarRef.current) sidebarRef.current.style.width = `${next}px`;
      if (innerRef.current)   { innerRef.current.style.width = `${next}px`; innerRef.current.style.minWidth = `${next}px`; }
    };
    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = document.body.style.userSelect = '';
      if (sidebarRef.current) {
        sidebarRef.current.style.transition = '';
        const final = Math.min(Math.max(Math.round(parseFloat(sidebarRef.current.style.width) || startWidth.current), 220), 560);
        setWidth(final);
        try { localStorage.setItem('me-left-panel-width', String(final)); } catch {}
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);
  // ────────────────────────────────────────────────────────────────

  return (
    <aside
      ref={sidebarRef}
      className={`hidden lg:block h-full z-40 transition-all duration-300 ease-in-out overflow-hidden relative ${
        isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ width: isPanelOpen ? width : 0 }}
    >
      <div ref={innerRef} className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800" style={{ width, minWidth: width }}>

      {/* Close Button Row */}
      <div className="flex justify-end px-4 pt-2 pb-2">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors"
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

      {/* Scrollable Content Area */}
  <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#C0C0C0] hover:scrollbar-thumb-[#C0C0C0] dark:scrollbar-thumb-[#C0C0C0] dark:hover:scrollbar-thumb-[#C0C0C0]">
        
        {/* Library Section */}
        {activeView === 'library' && (
  <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="3" height="16" rx="0.5" />
              <rect x="10" y="7" width="3" height="13" rx="0.5" />
              <rect x="16" y="5" width="3" height="15" rx="0.5" />
              <path d="M3 20h18" />
            </svg>
            <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Library</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">({libraryBooks.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {libraryBooks.length > 0 && (
              <button
                onClick={() => {
                  setMultiSelectMode(!multiSelectMode);
                  if (multiSelectMode) {
                    // Clear selection when exiting multi-select mode
                  }
                }}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${multiSelectMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
                title={multiSelectMode ? "Cancel selection" : "Select multiple"}
              >
                <svg className={`w-4 h-4 ${multiSelectMode ? 'text-blue-600 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <circle className={multiSelectMode ? '' : 'dark:stroke-white'} cx="12" cy="12" r="9" />
                  <path className={multiSelectMode ? '' : 'dark:stroke-white'} d="M8.5 12l2.5 2.5 4.5-4.5" />
                </svg>
                <span className={`text-[10px] font-medium ${multiSelectMode ? 'text-blue-600 dark:text-blue-400' : 'text-[#050505] dark:text-[#e5e5e5]'}`}>
                  {multiSelectMode ? 'Cancel' : 'Select'}
                </span>
              </button>
            )}
            <button
              onClick={showNewBookConfirmation}
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-colors"
              title="New book"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path className="dark:stroke-white" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path className="dark:stroke-white" d="M14 2v6h6" />
                <path className="dark:stroke-white" d="M9 14h6M12 11v6" />
              </svg>
              <span className="text-[10px] font-medium text-[#050505] dark:text-[#e5e5e5]">New</span>
            </button>
            <button
              onClick={showImportDialog}
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-colors"
              title="Import document"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path className="dark:stroke-white" d="M12 3v12M7.5 10l4.5 5 4.5-5" />
                <path className="dark:stroke-white" d="M4 19h16" />
              </svg>
              <span className="text-[10px] font-medium text-[#050505] dark:text-[#e5e5e5]">Import</span>
            </button>
          </div>
        </div>
        
        {multiSelectMode && libraryBooks.length > 0 && (
              <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-md">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedBookIds.size === libraryBooks.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedBookIds.size} selected
                </span>
                <button
                  onClick={handleDeleteSelectedBooks}
                  disabled={selectedBookIds.size === 0}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete Selected
                </button>
              </div>
            )}
            <div className={`mt-2 space-y-1 pl-2 ${libraryBooks.length > 4 ? 'max-h-[400px] overflow-y-auto pr-1' : ''}`}>
            {libraryBooks.length === 0 ? (
              <EmptyStateHint
                compact
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                title="No saved books yet"
                description="Your books will appear here once saved. Click Save to preserve your current work."
              />
            ) : (
              libraryBooks.map((book) => {
                const isSelected = selectedBookId === book.id;
                const isChecked = selectedBookIds.has(book.id);
                return (
                  <div
                    key={book.id}
                    className={`group flex items-center justify-between py-2 px-2 rounded transition-colors ${
                      isSelected || isChecked
                        ? 'bg-gray-100 dark:bg-[#1a1a1a]'
                        : 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {multiSelectMode && (
                      <label className="flex items-center mr-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBookSelection(book.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                        />
                      </label>
                    )}
                    <button
                      onClick={() => multiSelectMode ? toggleBookSelection(book.id) : setSelectedBookId(isSelected ? null : book.id)}
                      className="flex-1 text-left"
                    >
                      <div className={`text-sm font-medium truncate ${
                        isSelected || isChecked
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {book.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {book.author || 'Unknown author'}
                      </div>
                    </button>
                    {!multiSelectMode && isSelected && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => {
                            handleLoadBook(book.id);
                            setSelectedBookId(null);
                          }}
                          className="px-2 py-1 text-xs rounded bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                          title="Load book"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleExportLibraryBook(book.id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                          title="Export as EPUB"
                        >
                          <img
                            src="/export-download-icon.svg"
                            alt="Export"
                            className="w-4 h-4 dark:hidden"
                          />
                          <img
                            src="/dark-export-download-icon.svg"
                            alt="Export"
                            className="w-4 h-4 hidden dark:block"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] opacity-100 hover:opacity-70 transition-opacity"
                          title="Delete"
                        >
                          <img 
                            src="/dark-bin-icon.svg" 
                            alt="Delete" 
                            className="w-4 h-4 hidden dark:block"
                          />
                          <TrashIcon className="w-4 h-4 dark:hidden" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            </div>
      </div>
        )}

      {/* Book Details Section */}
      {activeView === 'book' && (
  <div data-tour="book-details" className="border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Book</span>
              {title && (
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {title}
                </span>
              )}
            </div>
          </div>
          <div data-tour="export" className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleSaveBook}
              disabled={!!saveFeedback}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-all disabled:opacity-60 ${saveFeedback ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
              title={saveFeedback ? "Saved!" : "Save book"}
            >
              {saveFeedback ? (
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
              )}
              <span className={`text-[10px] font-medium ${saveFeedback ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {saveFeedback ? 'Saved!' : 'Save'}
              </span>
            </button>
            <button
              onClick={handleExportEPUB}
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-colors"
              title="Export as EPUB"
            >
              <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">EPUB</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-colors"
              title="Export as PDF"
            >
              <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">PDF</span>
            </button>
            {exportHistoryCount > 0 && (
              <ExportHistoryButton
                exportCount={exportHistoryCount}
                onClickAction={onShowExportHistory}
              />
            )}
          </div>
        </div>

        <div className="mt-2 space-y-3 pl-2 pr-2">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
                placeholder="Book title"
              />
            </div>
            
            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
                placeholder="Author name"
              />
            </div>
            
            {/* Blurb */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Description</label>
              <textarea
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] resize-none placeholder-[#C0C0C0]"
                placeholder="Brief description or back cover blurb (optional)"
                rows={3}
              />
            </div>
            
            {/* Publisher */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
                placeholder="Publisher name"
              />
            </div>
            
            {/* Publication Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Publication Date</label>
              <input
                type="date"
                value={pubDate}
                onChange={(e) => setPubDate(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
              />
            </div>
            
            {/* Language */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Genre */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
                placeholder="e.g. Fiction, Mystery"
              />
            </div>
            
            {/* ISBN */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">ISBN (optional)</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
                placeholder="978-0-123456-78-9"
              />
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                ISBNs must be purchased from official agencies (e.g., £93 from <a href="https://www.nielsenisbnstore.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Nielsen UK</a>). They cannot be invented.
              </p>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  disabled={lockedSections.bookInfo}
                  className="flex-1 px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
                  placeholder="e.g., fiction, thriller, mystery, romance"
                />
                <button
                  onClick={handleAddTag}
                  disabled={lockedSections.bookInfo}
                  className="px-3 py-2 rounded bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-[#1a1a1a] text-[#050505] dark:text-[#e5e5e5]"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 dark:hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Cover Image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={lockedSections.bookInfo}
                className="w-full text-sm text-[#C0C0C0] file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2a2a2a] file:text-[#050505] dark:file:text-[#e5e5e5] hover:file:bg-gray-200 dark:hover:file:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {coverFile && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Cover uploaded</p>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      title: title || '',
                      author: author || ''
                    }).toString();
                    window.open(`https://coverly.figma.site?${params}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="group relative w-full overflow-hidden rounded-xl p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Create a professional book cover with Coverly"
                >
                  {/* Gradient border */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Inner content */}
                  <div className="relative flex items-center gap-3 rounded-xl bg-white dark:bg-[#0a0a0a] px-3 py-3">
                    {/* Example cover thumbnail */}
                    <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden shadow-md ring-1 ring-black/10 dark:ring-white/10 group-hover:shadow-lg transition-shadow">
                      <img
                        src="/coverly-preview.png"
                        alt="Example cover made with Coverly"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Need a cover?</p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase">
                          Free
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Design a professional cover in minutes</p>
                      
                      {/* CTA */}
                      <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 group-hover:gap-1.5 transition-all">
                        <span>Open Coverly</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
      </div>
        )}

      {/* Chapters Section */}
      {activeView === 'chapters' && (
  <div data-tour="chapters" className="border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8M16 17H8M10 9H8" />
            </svg>
            <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Chapters</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({chapters.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                className="p-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-colors"
                title="Add chapter"
              >
                <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
              </button>
              
              {chapterTypeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2 max-h-96 overflow-y-auto">
                  <div className="space-y-3 px-2">
                    {/* Front Matter */}
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Front Matter
                      </div>
                      {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {template.title}
                      </button>
                    ))}
                    </div>
                    
                    {/* Main Content */}
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Main Content
                      </div>
                      {CHAPTER_TEMPLATES.content.map((template) => (
                        <button
                          key={template.title}
                          onClick={() => {
                            handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                            setChapterTypeDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                        >
                          {template.title}
                        </button>
                      ))}
                    </div>
                    
                    {/* Back Matter */}
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Back Matter
                      </div>
                      {CHAPTER_TEMPLATES.backmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
        <div className="mt-1 space-y-1 pl-2">
            {chapters.length === 0 ? (
              <EmptyStateHint
                compact
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                }
                title="No chapters yet"
                description="Click the + button above to add your first chapter."
              />
            ) : (
            <>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 px-2 mb-1">Drag to reorder</p>
            {chapters.map((ch, i) => {
              const isSelected = selectedChapter === i;
              const titleText = ch.title?.trim() || 'Title';
              
              const getChapterInfo = () => {
                if (ch.type === 'frontmatter') {
                  return {
                    typeLabel: 'Frontmatter',
                    title: titleText && titleText !== 'Title' ? titleText : 'Title'
                  };
                }
                if (ch.type === 'backmatter') {
                  return {
                    typeLabel: 'Backmatter',
                    title: titleText && titleText !== 'Title' ? titleText : 'Title'
                  };
                }
                const contentChapterNum = getContentChapterNumber(chapters, i);
                return {
                  typeLabel: `Chapter ${contentChapterNum}`,
                  title: titleText && titleText !== 'Title' ? titleText : 'Title'
                };
              };

              const { typeLabel, title: chapterTitle } = getChapterInfo();
              
              return (
                <div
                  key={ch.id}
                  className={`group flex items-center gap-2 px-2 py-2 rounded text-sm transition-all cursor-pointer select-none ${
                    dragOverIndex === i
                      ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                      : isSelected
                        ? 'bg-gray-100 dark:bg-[#1a1a1a] border border-transparent'
                        : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                  }`}
                  style={{
                    opacity: dragItemIndex === i && ghostPillPosition.visible ? 0.3 : 1,
                  } as React.CSSProperties}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onTouchStart={(e) => handleTouchStart(i, e)}
                  onTouchMove={(e) => handleTouchMove(i, e)}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => handleSelectChapter(i)}
                >
                  <HandleDragIcon isSelected={isSelected} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-[10px] ${isSelected ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}> 
                      {typeLabel}
                    </span>
                    <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {chapterTitle}
                    </span>
                  </div>
                  {/* Lock button */}
                  {handleToggleChapterLock && (
                    <button
                      className={`transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded ${ch.locked ? 'opacity-100 text-gray-600 dark:text-gray-300' : 'opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleChapterLock(i);
                      }}
                      aria-label={ch.locked ? 'Unlock chapter' : 'Lock chapter'}
                      title={ch.locked ? 'Unlock chapter' : 'Mark complete and lock'}
                    >
                      {ch.locked ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0"/>
                        </svg>
                      )}
                    </button>
                  )}
                  {/* Delete button — hidden when locked */}
                  {chapters.length > 1 && !ch.locked && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded text-gray-600 dark:text-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveChapter(i);
                      }}
                      aria-label="Delete chapter"
                    >
                      <BinIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
            </>
            )}
          </div>
      </div>
        )}

      {/* Preview Section */}
      {activeView === 'preview' && (
  <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Preview</span>
          </div>
        </div>
        <div className="mt-2 px-2">
            {/* Cover Preview */}
            <div className="mb-4 flex justify-center">
              <div className="w-32 h-48 bg-gray-100 dark:bg-[#1e1e1e] rounded border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Book cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src="/preview-icon.svg" alt="No cover" className="w-8 h-8 opacity-40 dark:invert" />
                )}
              </div>
            </div>
            
            {/* Book Info */}
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Title</div>
                <div className="font-medium text-[#050505] dark:text-[#e5e5e5]">{title || 'Untitled'}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Author</div>
                <div className="text-[#050505] dark:text-[#e5e5e5]">{author || 'Unknown'}</div>
              </div>
              
              {pubDate && (
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Publication Date</div>
                  <div className="text-[#050505] dark:text-[#e5e5e5]">{new Date(pubDate).toLocaleDateString()}</div>
                </div>
              )}
              
              {language && (
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Language</div>
                  <div className="flex items-center gap-2">
                    <img src="/dark-languages-icon.svg" className="w-4 h-4 hidden dark:block" alt="" />
                    <img src="/languages-icon.svg" className="w-4 h-4 dark:hidden" alt="" />
                    <span className="text-[#050505] dark:text-[#e5e5e5]">{language}</span>
                  </div>
                </div>
              )}
              
              {genre && (
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Genre</div>
                  <div className="text-[#050505] dark:text-[#e5e5e5]">{genre}</div>
                </div>
              )}
              
              {tags.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-[#1a1a1a] text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Chapters</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{chapters.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Words</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{totalWords.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pages</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{pageCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Reading Time</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">
                  {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
                </span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      </div>

      {/* Resize handle — right edge of left panel */}
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize z-50 hidden lg:block hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        onMouseDown={handleResizeStart}
      />
    </aside>
  );
}

// User Dropdown Component
function UserDropdown() {
  const { user, signOut, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition px-0" 
          aria-label="User menu"
        >
          <img
            src="/user-icon.svg"
            alt="user icon"
            width={24}
            height={24}
            className="w-6 h-6 dark:invert"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8} forceMount>
        <DropdownMenuLabel className="font-normal pt-2 pb-2">
          <div className="flex flex-col space-y-3">
            <p className="pl-2 text-sm font-medium leading-none">{user?.email || 'user@email.com'}</p>
            <div className="pl-2 flex items-center">
              <SubscriptionBadge showUpgradeButton={true} />
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <ManageBillingButton variant="ghost" size="sm" className="w-full justify-start" />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="pr-2">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
