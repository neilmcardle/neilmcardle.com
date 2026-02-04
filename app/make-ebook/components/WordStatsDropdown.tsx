'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookStats, ChapterStats } from '../hooks/useWordStats';

// Inline formatting functions to avoid prop serialization issues
function formatWordCount(count: number): string {
  return count.toLocaleString();
}

function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface WordCountBadgeProps {
  totalWords: number;
}

export function WordCountBadge({ totalWords }: WordCountBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>{formatWordCount(totalWords)} words</span>
    </div>
  );
}

interface WordStatsDropdownProps {
  bookStats: BookStats;
  currentChapterIndex: number;
  wordsThisSession: number;
  onSelectChapter?: (index: number) => void;
}

export function WordStatsDropdown({
  bookStats,
  currentChapterIndex,
  wordsThisSession,
  onSelectChapter,
}: WordStatsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, isMobile: false });

  // Client-side only for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const viewportWidth = window.innerWidth;
      const dropdownWidth = isMobile ? viewportWidth - 24 : 288;
      
      // On mobile, center the dropdown. On desktop, align to button right edge
      let left: number;
      if (isMobile) {
        // Center horizontally on mobile
        left = 12;
      } else {
        left = Math.min(rect.right - dropdownWidth, viewportWidth - dropdownWidth - 12);
      }
      
      setPosition({
        top: rect.bottom + 8,
        left,
        isMobile,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentChapter = bookStats.chapterStats[currentChapterIndex];

  const dropdownContent = isOpen && mounted ? createPortal(
    <div 
      ref={dropdownRef}
      className="fixed bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[9999] overflow-hidden"
      style={{ 
        top: position.top, 
        left: position.left,
        width: position.isMobile ? 'calc(100vw - 24px)' : '288px',
        maxWidth: '320px',
      }}
    >
      {/* Header Stats */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StatCard
            label="Total Words"
            value={formatWordCount(bookStats.totalWords)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            label="Reading Time"
            value={formatReadingTime(bookStats.totalReadingTime)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Chapters"
            value={bookStats.chapterStats.length.toString()}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          />
          <StatCard
            label="Written"
            value={wordsThisSession > 0 ? `+${formatWordCount(wordsThisSession)}` : '0'}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            highlight={wordsThisSession > 0}
          />
        </div>
      </div>

      {/* Current Chapter */}
      {currentChapter && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Chapter</div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
              {currentChapter.title}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {formatWordCount(currentChapter.wordCount)} words
            </span>
          </div>
        </div>
      )}

      {/* Chapter Breakdown */}
      <div className="max-h-48 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
            All Chapters
          </div>
          {bookStats.chapterStats.map((chapter, index) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              isActive={index === currentChapterIndex}
              index={index}
              onClick={(idx) => {
                onSelectChapter?.(idx);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f0f]">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Avg. {formatWordCount(bookStats.averageWordsPerChapter)} words/chapter
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Clickable Badge */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        title="Click to view word stats"
      >
        <WordCountBadge 
          totalWords={bookStats.totalWords} 
        />
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownContent}
    </>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ label, value, icon, highlight }: StatCardProps) {
  return (
    <div className={`p-2 rounded-lg ${
      highlight 
        ? 'bg-green-50 dark:bg-green-900/20' 
        : 'bg-gray-50 dark:bg-[#252525]'
    }`}>
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-sm font-semibold ${
        highlight 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-gray-900 dark:text-gray-100'
      }`}>
        {value}
      </div>
    </div>
  );
}

interface ChapterRowProps {
  chapter: ChapterStats;
  isActive: boolean;
  index: number;
  onClick?: (index: number) => void;
}

function ChapterRow({ chapter, isActive, index, onClick }: ChapterRowProps) {
  return (
    <button
      onClick={() => onClick?.(index)}
      className={`w-full flex justify-between items-center px-2 py-1.5 rounded text-left ${
        isActive
          ? 'bg-black/5 dark:bg-white/5'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
      }`}
    >
      <span className={`text-sm truncate pr-2 ${
        isActive
          ? 'font-medium text-gray-900 dark:text-gray-100'
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {chapter.title}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {formatWordCount(chapter.wordCount)}
      </span>
    </button>
  );
}

export default WordStatsDropdown;
