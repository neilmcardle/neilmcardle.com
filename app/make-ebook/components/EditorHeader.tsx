"use client";

import React from "react";
import { SaveIcon, DownloadIcon } from "./icons";
import AutoSaveIndicator from "./AutoSaveIndicator";
import ChapterNavDropdown from "./ChapterNavDropdown";
import ModeMenu from "./ModeMenu";
import LayoutSwitcher, { RightPanelMode } from "./LayoutSwitcher";
import { useIsMac } from "./marketing/sections-v2/PlatformKey";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Chapter {
  id: string;
  type: "frontmatter" | "content" | "backmatter";
  title: string;
  content: string;
  locked?: boolean;
  completed?: boolean;
  synopsis?: string;
}

export interface EditorHeaderProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasCloudSync: boolean;
  onSaveNow: () => void;

  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;
  bookTitle: string;

  versionCount: number;
  exportCount: number;
  onShowHistory: () => void;
  onSaveAsNewBook?: () => void;

  focusActive: boolean;
  onToggleFocusMode: () => void;
  flowMode: boolean;
  onToggleFlowMode: () => void;

  rightPanelMode: RightPanelMode;
  onRightPanelModeChange: (mode: RightPanelMode) => void;

  onExportEPUB: () => void;
  onExportPDF: () => void;
  onExportDocx: () => void;

  hideChrome?: boolean;
}

export default function EditorHeader({
  isDirty,
  isSaving,
  lastSaved,
  hasCloudSync,
  onSaveNow,
  chapters,
  selectedChapter,
  onChapterSelect,
  bookTitle,
  versionCount,
  exportCount,
  onShowHistory,
  onSaveAsNewBook,
  focusActive,
  onToggleFocusMode,
  flowMode,
  onToggleFlowMode,
  rightPanelMode,
  onRightPanelModeChange,
  onExportEPUB,
  onExportPDF,
  onExportDocx,
  hideChrome = false,
}: EditorHeaderProps) {
  const isMac = useIsMac();
  return (
    <div
      className={`flex items-center justify-between px-6 mb-2 transition-opacity duration-300 ${
        hideChrome ? "focus-hide-chrome" : ""
      }`}
    >
      <div data-tour="auto-save" className="flex items-center gap-2">
        <AutoSaveIndicator
          isDirty={isDirty}
          isSaving={isSaving}
          lastSaved={lastSaved}
          hasCloudSync={hasCloudSync}
        />
        {isDirty && !isSaving && (
          <button
            onClick={onSaveNow}
            className="flex items-center gap-2 h-10 px-3 rounded-full bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#333] hover:bg-gray-200 dark:hover:bg-[#2e2e2e] transition-colors text-xs font-medium text-gray-700 dark:text-[#d4d4d4]"
            title={`Save now (${isMac ? "⌘S" : "Ctrl+S"})`}
          >
            <SaveIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
            <span>Save</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ChapterNavDropdown
          chapters={chapters}
          selectedChapter={selectedChapter}
          onChapterSelect={onChapterSelect}
          bookTitle={bookTitle}
        />
        <ModeMenu
          focusActive={focusActive}
          onToggleFocus={onToggleFocusMode}
          flowMode={flowMode}
          onToggleFlow={onToggleFlowMode}
        />
        <LayoutSwitcher
          mode={rightPanelMode}
          onChange={onRightPanelModeChange}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="More actions"
              aria-label="More actions"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#333] text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-200 dark:hover:bg-[#2e2e2e] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="w-60"
          >
            {onSaveAsNewBook && (
              <DropdownMenuItem
                onClick={onSaveAsNewBook}
                className="flex items-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="12" height="12" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
                <span className="text-sm">Save as a new book</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onShowHistory}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">Version & export history</span>
              </span>
              {versionCount + exportCount > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">
                  {versionCount + exportCount}
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          className="w-px h-6 bg-gray-200 dark:bg-[#2f2f2f] mx-1"
          aria-hidden="true"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-tour="export"
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
              title="Export book"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="w-48"
          >
            <DropdownMenuItem
              onClick={onExportEPUB}
              className="flex items-center gap-2 cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">EPUB</div>
                <div className="text-xs text-gray-500">
                  Kindle, Kobo, Apple Books
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onExportPDF}
              className="flex items-center gap-2 cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">PDF</div>
                <div className="text-xs text-gray-500">Print & sharing</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onExportDocx}
              className="flex items-center gap-2 cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">Word</div>
                <div className="text-xs text-gray-500">Editors & agents</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
