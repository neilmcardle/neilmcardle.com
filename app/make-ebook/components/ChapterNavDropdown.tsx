"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface Chapter {
  id: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  title: string;
  content: string;
}

interface ChapterNavDropdownProps {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;
}

export default function ChapterNavDropdown({
  chapters,
  selectedChapter,
  onChapterSelect,
}: ChapterNavDropdownProps) {
  if (chapters.length === 0) {
    return null;
  }

  const currentChapter = chapters[selectedChapter];
  const currentTitle = currentChapter?.title || `Chapter ${selectedChapter + 1}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          title="Navigate chapters"
        >
          <span className="max-w-[150px] truncate">{currentTitle}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-[400px] overflow-y-auto" align="start">
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Chapters ({chapters.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {chapters.map((chapter, index) => {
          const isSelected = index === selectedChapter;
          const chapterTitle = chapter.title || `Chapter ${index + 1}`;

          return (
            <DropdownMenuItem
              key={chapter.id}
              onClick={() => onChapterSelect(index)}
              className={`cursor-pointer ${
                isSelected
                  ? 'bg-gray-100 dark:bg-gray-800 font-medium'
                  : ''
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex-shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 truncate">{chapterTitle}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-gray-900 dark:text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
