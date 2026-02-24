'use client';
import React, { useRef, useEffect, useState } from 'react';
import { ChapterMatch } from '../hooks/useFindReplace';

interface FindReplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  replaceTerm: string;
  onReplaceChange: (value: string) => void;
  caseSensitive: boolean;
  onCaseSensitiveChange: (value: boolean) => void;
  matches: ChapterMatch[];
  totalMatches: number;
  onReplaceInChapter: (chapterIndex: number) => number;
  onReplaceAll: () => number;
  onGoToMatch: (chapterIndex: number) => void;
}

export default function FindReplacePanel({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  replaceTerm,
  onReplaceChange,
  caseSensitive,
  onCaseSensitiveChange,
  matches,
  totalMatches,
  onReplaceInChapter,
  onReplaceAll,
  onGoToMatch,
}: FindReplacePanelProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  }

  function handleReplaceInChapter(chapterIndex: number) {
    const count = onReplaceInChapter(chapterIndex);
    showFeedback(`Replaced ${count} match${count !== 1 ? 'es' : ''}`);
  }

  function handleReplaceAll() {
    const count = onReplaceAll();
    showFeedback(`Replaced ${count} match${count !== 1 ? 'es' : ''} across ${matches.length} chapter${matches.length !== 1 ? 's' : ''}`);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-xl w-full max-w-lg mx-4 border border-gray-200 dark:border-[#333]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Find & Replace</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Search input */}
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Find..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 pr-16 text-sm rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#111] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                {totalMatches} match{totalMatches !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          {/* Replace input */}
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => onReplaceChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#111] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Options row */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => onCaseSensitiveChange(e.target.checked)}
                className="rounded border-gray-300 dark:border-[#444]"
              />
              Case sensitive
            </label>
            <button
              onClick={handleReplaceAll}
              disabled={totalMatches === 0 || !replaceTerm}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Replace All ({totalMatches})
            </button>
          </div>

          {/* Feedback toast */}
          {feedback && (
            <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in duration-150">
              {feedback}
            </div>
          )}

          {/* Match results */}
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-[#333] rounded-lg divide-y divide-gray-200 dark:divide-[#333]">
              {matches.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No matches found
                </div>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.chapterIndex}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                  >
                    <button
                      onClick={() => onGoToMatch(m.chapterIndex)}
                      className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate text-left flex-1 mr-3"
                    >
                      {m.chapterTitle}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {m.count} match{m.count !== 1 ? 'es' : ''}
                      </span>
                    </button>
                    <button
                      onClick={() => handleReplaceInChapter(m.chapterIndex)}
                      disabled={!replaceTerm}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      Replace
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2.5 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 font-mono">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
