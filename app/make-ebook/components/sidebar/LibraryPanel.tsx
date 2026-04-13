'use client';

import React from 'react';
import { TrashIcon } from '../icons';
import EmptyStateHint from '../EmptyStateHint';

interface Book {
  id: string;
  title: string;
  author: string;
  savedAt: number;
  coverUrl?: string;
}

interface LibraryPanelProps {
  libraryBooks: Book[];
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  handleLoadBook: (id: string) => void;
  handleDeleteBook: (id: string) => void;
  showNewBookConfirmation: () => void;
  showImportDialog: () => void;

  // Multi-select
  multiSelectMode: boolean;
  setMultiSelectMode: (value: boolean) => void;
  selectedBookIds: Set<string>;
  toggleBookSelection: (id: string) => void;
  toggleSelectAll: () => void;
  handleDeleteSelectedBooks: () => void;
}

export default function LibraryPanel({
  libraryBooks,
  selectedBookId,
  setSelectedBookId,
  handleLoadBook,
  handleDeleteBook,
  showNewBookConfirmation,
  showImportDialog,
  multiSelectMode,
  setMultiSelectMode,
  selectedBookIds,
  toggleBookSelection,
  toggleSelectAll,
  handleDeleteSelectedBooks,
}: LibraryPanelProps) {
  return (
    <div className="border-b border-gray-200 dark:border-[#2f2f2f] pb-2">
      <div className="flex items-center justify-between py-2 px-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="3" height="16" rx="0.5" />
            <rect x="10" y="7" width="3" height="13" rx="0.5" />
            <rect x="16" y="5" width="3" height="15" rx="0.5" />
            <path d="M3 20h18" />
          </svg>
          <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Library</span>
          <span className="text-xs text-gray-600 dark:text-[#a3a3a3]">({libraryBooks.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {libraryBooks.length > 0 && (
            <button
              onClick={() => setMultiSelectMode(!multiSelectMode)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${multiSelectMode ? 'bg-[#4070ff]/10 dark:bg-[#4070ff]/15' : 'hover:bg-gray-50 dark:hover:bg-[#262626]'}`}
              title={multiSelectMode ? 'Cancel selection' : 'Select multiple'}
            >
              <svg className={`w-4 h-4 ${multiSelectMode ? 'text-[#4070ff]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <circle className={multiSelectMode ? '' : 'dark:stroke-white'} cx="12" cy="12" r="9" />
                <path className={multiSelectMode ? '' : 'dark:stroke-white'} d="M8.5 12l2.5 2.5 4.5-4.5" />
              </svg>
              <span className={`text-xs font-medium ${multiSelectMode ? 'text-[#4070ff]' : 'text-[#050505] dark:text-[#e5e5e5]'}`}>
                {multiSelectMode ? 'Cancel' : 'Select'}
              </span>
            </button>
          )}
          <button
            onClick={showNewBookConfirmation}
            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#262626] rounded transition-colors"
            title="New book"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path className="dark:stroke-white" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path className="dark:stroke-white" d="M14 2v6h6" />
              <path className="dark:stroke-white" d="M9 14h6M12 11v6" />
            </svg>
            <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5]">New</span>
          </button>
          <button
            onClick={showImportDialog}
            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#262626] rounded transition-colors"
            title="Import document"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path className="dark:stroke-white" d="M12 3v12M7.5 10l4.5 5 4.5-5" />
              <path className="dark:stroke-white" d="M4 19h16" />
            </svg>
            <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5]">Import</span>
          </button>
        </div>
      </div>

      {multiSelectMode && libraryBooks.length > 0 && (
        <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-gray-50 dark:bg-[#262626] rounded-md">
          <button onClick={toggleSelectAll} className="text-xs text-[#4070ff] hover:underline">
            {selectedBookIds.size === libraryBooks.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-gray-500 dark:text-[#a3a3a3]">{selectedBookIds.size} selected</span>
          <button
            onClick={handleDeleteSelectedBooks}
            disabled={selectedBookIds.size === 0}
            className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
                  isSelected || isChecked ? 'bg-gray-100 dark:bg-[#262626]' : 'hover:bg-gray-50 dark:hover:bg-[#262626]'
                }`}
              >
                {multiSelectMode && (
                  <label className="flex items-center mr-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBookSelection(book.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-[#3a3a3a] text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                    />
                  </label>
                )}
                <button
                  onClick={() => (multiSelectMode ? toggleBookSelection(book.id) : setSelectedBookId(isSelected ? null : book.id))}
                  className="flex-1 text-left"
                >
                  <div className={`text-sm font-medium truncate ${isSelected || isChecked ? 'text-gray-900 dark:text-[#f5f5f5]' : 'text-gray-700 dark:text-[#d4d4d4]'}`}>
                    {book.title || 'Untitled'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-[#a3a3a3] truncate">
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
                      title="Open book"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] opacity-100 hover:opacity-70 transition-opacity"
                      title="Delete"
                    >
                      <img src="/dark-bin-icon.svg" alt="Delete" className="w-4 h-4 hidden dark:block" />
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
  );
}
