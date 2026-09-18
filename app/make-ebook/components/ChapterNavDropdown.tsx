"use client";

import styles from "../styles/studio.module.css";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Chapter {
  id: string;
  type: "frontmatter" | "content" | "backmatter";
  title: string;
  content: string;
}

interface ChapterNavDropdownProps {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;
  bookTitle?: string;
}

export default function ChapterNavDropdown({
  chapters,
  selectedChapter,
  onChapterSelect,
  bookTitle,
}: ChapterNavDropdownProps) {
  if (chapters.length === 0) {
    return null;
  }

  const displayTitle = bookTitle?.trim() || "Untitled Book";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={styles.btn} title="Navigate chapters">
          <span className="max-w-[150px] truncate">{displayTitle}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 max-h-[400px] overflow-y-auto bg-white dark:bg-[var(--ink-panel)] border border-gray-200 dark:border-[var(--rule)]"
        align="start"
      >
        <DropdownMenuLabel>Chapters ({chapters.length})</DropdownMenuLabel>
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
                  ? "bg-gray-100 dark:bg-[var(--ink-raised)] font-medium"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-500 dark:text-[var(--clay-muted)] font-mono flex-shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 truncate">{chapterTitle}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-gray-900 dark:text-white flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M5 13l4 4L19 7"
                    />
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
