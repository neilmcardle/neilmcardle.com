"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LibraryIcon, PlusIcon, TrashIcon, SaveIcon, DownloadIcon, CloseIcon } from './icons';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DragIcon from './icons/DragIcon';
import BinIcon from './icons/BinIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
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
}

interface Book {
  id: string;
  title: string;
  author: string;
  savedAt: number;
  coverUrl?: string;
}

interface CollapsibleSidebarProps {
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
  
  // Chapters props
  chapters: Chapter[];
  selectedChapter: number;
  handleSelectChapter: (index: number) => void;
  handleAddChapter: (type: 'frontmatter' | 'content' | 'backmatter', title?: string) => void;
  handleRemoveChapter: (index: number) => void;
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
  coverFile: File | null;
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
  saveFeedback: boolean;
  
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
      <DragIcon 
        className={`w-4 h-4 transition ${
          isSelected ? "dark:[&_path]:stroke-white" : "dark:[&_path]:stroke-[#a0a0a0]"
        }`}
      />
    </span>
  );
}

export default function CollapsibleSidebar(props: CollapsibleSidebarProps) {
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  
  const {
    activeView,
    onClose,
    libraryBooks,
    selectedBookId,
    setSelectedBookId,
    handleLoadBook,
    handleDeleteBook,
    handleExportLibraryBook,
    showNewBookConfirmation,
    chapters,
    selectedChapter,
    handleSelectChapter,
    handleAddChapter,
    handleRemoveChapter,
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
    saveFeedback,
    sidebarLibraryExpanded,
    setSidebarLibraryExpanded,
    sidebarPreviewExpanded,
    setSidebarPreviewExpanded,
    sidebarChaptersExpanded,
    setSidebarChaptersExpanded,
    sidebarBookDetailsExpanded,
    setSidebarBookDetailsExpanded,
  } = props;

  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    // Small delay to trigger animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Animate out first
    setIsVisible(false);
    // Then actually close after animation completes
    setTimeout(() => {
      onClose();
    }, 8); // Match the transition duration
  };

  return (
    <aside 
      className={`hidden lg:flex flex-col absolute left-16 top-0 w-full lg:max-w-sm bg-white dark:bg-[#1a1a1a] min-w-0 lg:min-w-[300px] lg:max-w-[350px] h-full shadow-sm border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >

      {/* Close Button Row */}
      <div className="flex justify-end px-4 pt-4 pb-2">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
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
      <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
        
        {/* Library Section */}
        {activeView === 'library' && (
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarLibraryExpanded(!sidebarLibraryExpanded)}
              className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
              title={sidebarLibraryExpanded ? "Collapse library" : "Expand library"}
            >
              {sidebarLibraryExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <LibraryIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
            <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Library</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({libraryBooks.length})</span>
          </div>
          <button
            onClick={showNewBookConfirmation}
            className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
            title="New book"
          >
            <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
          </button>
        </div>
        
        {sidebarLibraryExpanded && (
          <div className={`mt-2 space-y-1 pl-2 ${libraryBooks.length > 4 ? 'max-h-[400px] overflow-y-auto pr-1' : ''}`}>
            {libraryBooks.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 py-4 px-2 text-center">
                No saved books yet
              </div>
            ) : (
              libraryBooks.map((book) => {
                const isSelected = selectedBookId === book.id;
                return (
                  <div
                    key={book.id}
                    className={`group flex items-center justify-between py-2 px-2 rounded transition-colors ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-[#2a2a2a]'
                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedBookId(isSelected ? null : book.id)}
                      className="flex-1 text-left"
                    >
                      <div className={`text-sm font-medium truncate ${
                        isSelected
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {book.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {book.author || 'Unknown author'}
                      </div>
                    </button>
                    {isSelected && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => {
                            handleLoadBook(book.id);
                            setSelectedBookId(null);
                          }}
                          className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-[#050505] dark:text-[#e5e5e5]"
                          title="Load book"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleExportLibraryBook(book.id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#3a3a3a]"
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
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#3a3a3a] opacity-100 hover:opacity-70 transition-opacity"
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
        )}
      </div>
        )}

      {/* Book Details Section */}
      {activeView === 'book' && (
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setSidebarBookDetailsExpanded(!sidebarBookDetailsExpanded)}
              className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors flex-shrink-0"
              title={sidebarBookDetailsExpanded ? "Collapse details" : "Expand details"}
            >
              {sidebarBookDetailsExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <img src="/preview-icon.svg" alt="Details" className="w-5 h-5 dark:invert flex-shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Book</span>
              {title && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {title}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleSaveBook}
              disabled={!!saveFeedback}
              className={`p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-all disabled:opacity-60 ${saveFeedback ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
              title={saveFeedback ? "Saved!" : "Save book"}
            >
              {saveFeedback ? (
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
              )}
            </button>
            <button
              onClick={handleExportEPUB}
              className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
              title="Export as EPUB"
            >
              <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
            </button>
          </div>
        </div>
        
        {sidebarBookDetailsExpanded && (
          <div className="mt-2 space-y-3 pl-2 pr-2">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                placeholder="Book title"
              />
            </div>
            
            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                placeholder="Author name"
              />
            </div>
            
            {/* Blurb */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <textarea
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] resize-none"
                placeholder="Brief description"
                rows={3}
              />
            </div>
            
            {/* Publisher */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                placeholder="Publisher name"
              />
            </div>
            
            {/* Publication Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Publication Date</label>
              <input
                type="date"
                value={pubDate}
                onChange={(e) => setPubDate(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
              />
            </div>
            
            {/* Language */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
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
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                placeholder="e.g. Fiction, Mystery"
              />
            </div>
            
            {/* ISBN */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ISBN</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={lockedSections.bookInfo}
                className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                placeholder="ISBN number"
              />
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  disabled={lockedSections.bookInfo}
                  className="flex-1 px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                  placeholder="Add tag"
                />
                <button
                  onClick={handleAddTag}
                  disabled={lockedSections.bookInfo}
                  className="px-3 py-2 rounded bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-[#2a2a2a] text-[#050505] dark:text-[#e5e5e5]"
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
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={lockedSections.bookInfo}
                className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2a2a2a] file:text-[#050505] dark:file:text-[#e5e5e5] hover:file:bg-gray-200 dark:hover:file:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {coverFile && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {coverFile.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
        )}

      {/* Chapters Section */}
      {activeView === 'chapters' && (
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarChaptersExpanded(!sidebarChaptersExpanded)}
              className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
              title={sidebarChaptersExpanded ? "Collapse chapters" : "Expand chapters"}
            >
              {sidebarChaptersExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <img src="/chapters-icon.svg" alt="Chapters" className="w-5 h-5 dark:invert" />
            <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Chapters</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({chapters.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                title="Add chapter"
              >
                <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
              </button>
              
              {chapterTypeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2 max-h-96 overflow-y-auto">
                  <div className="space-y-3 px-2">
                    {/* Front Matter */}
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Front Matter
                      </div>
                      {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {template.title}
                      </button>
                    ))}
                    </div>
                    
                    {/* Main Content */}
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Main Content
                      </div>
                      {CHAPTER_TEMPLATES.content.map((template) => (
                        <button
                          key={template.title}
                          onClick={() => {
                            handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                            setChapterTypeDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                        >
                          {template.title}
                        </button>
                      ))}
                    </div>
                    
                    {/* Back Matter */}
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Back Matter
                      </div>
                      {CHAPTER_TEMPLATES.backmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
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
      </div>        {sidebarChaptersExpanded && (
          <div className="mt-1 space-y-1 pl-2">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 px-2 mb-1">Drag to reorder</p>
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
                        ? 'bg-gray-100 dark:bg-[#2a2a2a] border border-transparent'
                        : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
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
                    <span className={`text-[10px] ${isSelected ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      {typeLabel}
                    </span>
                    <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {chapterTitle}
                    </span>
                  </div>
                  {chapters.length > 1 && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveChapter(i);
                      }}
                      aria-label="Delete chapter"
                    >
                      <BinIcon
                        className="w-4 h-4"
                        stroke={isSelected ? "#050505" : "#666666"}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
        )}

      {/* Preview Section */}
      {activeView === 'preview' && (
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarPreviewExpanded(!sidebarPreviewExpanded)}
              className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
              title={sidebarPreviewExpanded ? "Collapse preview" : "Expand preview"}
            >
              {sidebarPreviewExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <img src="/summary-icon.svg" alt="Preview" className="w-5 h-5 dark:invert" />
            <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Preview</span>
          </div>
        </div>
        
        {sidebarPreviewExpanded && (
          <div className="mt-2 px-2">
            {/* Cover Preview */}
            <div className="mb-4 flex justify-center">
              <div className="w-32 h-48 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title</div>
                <div className="font-medium text-[#050505] dark:text-[#e5e5e5]">{title || 'Untitled'}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Author</div>
                <div className="text-[#050505] dark:text-[#e5e5e5]">{author || 'Unknown'}</div>
              </div>
              
              {pubDate && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Publication Date</div>
                  <div className="text-[#050505] dark:text-[#e5e5e5]">{new Date(pubDate).toLocaleDateString()}</div>
                </div>
              )}
              
              {language && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Language</div>
                  <div className="flex items-center gap-2">
                    <img src="/dark-languages-icon.svg" className="w-4 h-4 hidden dark:block" alt="" />
                    <img src="/languages-icon.svg" className="w-4 h-4 dark:hidden" alt="" />
                    <span className="text-[#050505] dark:text-[#e5e5e5]">{language}</span>
                  </div>
                </div>
              )}
              
              {genre && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Genre</div>
                  <div className="text-[#050505] dark:text-[#e5e5e5]">{genre}</div>
                </div>
              )}
              
              {tags.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-[#2a2a2a] text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Chapters</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{chapters.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Words</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{totalWords.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Pages</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{pageCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Reading Time</span>
                <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">
                  {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
        )}
      </div>
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
        <DropdownMenuLabel className="font-normal pt-2">
          <div className="flex flex-col space-y-1">
            <p className="pt-2 pl-2 text-sm font-medium leading-none">{user?.email || 'user@email.com'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="pr-2">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
