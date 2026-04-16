'use client';

// Desktop editor top bar. Extracted from page.tsx so the monolith shrinks
// and the primary-action affordances (AutoSave / Save / Export) have a
// dedicated home. See CLAUDE.md → "Known non-obvious gotchas" and the
// audit notes in this session for why the Export button is a labelled pill
// on the right: it's the product's most important action and needs to read
// as primary, not hidden behind an icon.

import React from 'react';
import { SaveIcon, DownloadIcon } from './icons';
import AutoSaveIndicator from './AutoSaveIndicator';
import ChapterNavDropdown from './ChapterNavDropdown';
import { HistoryButton } from './HistoryPanel';
import { FocusModeButton } from './FocusModePanel';
import LayoutSwitcher, { RightPanelMode } from './LayoutSwitcher';
import { useFeatureAccess } from '@/lib/hooks/useSubscription';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Chapter {
  id: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  title: string;
  content: string;
  locked?: boolean;
  synopsis?: string;
}

export interface EditorHeaderProps {
  // Save state
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasCloudSync: boolean;
  onSaveNow: () => void;

  // Chapter navigation
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (index: number) => void;
  bookTitle: string;

  // History
  versionCount: number;
  exportCount: number;
  onShowHistory: () => void;

  // Focus mode
  onToggleFocusMode: () => void;

  // Right panel mode switcher
  rightPanelMode: RightPanelMode;
  onRightPanelModeChange: (mode: RightPanelMode) => void;

  // Export actions
  onExportEPUB: () => void;
  onExportPDF: () => void;
  onExportDocx: () => void;

  // Optional visual override for focus mode hide-chrome
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
  onToggleFocusMode,
  rightPanelMode,
  onRightPanelModeChange,
  onExportEPUB,
  onExportPDF,
  onExportDocx,
  hideChrome = false,
}: EditorHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-6 mb-2 transition-opacity duration-300 ${
        hideChrome ? 'focus-hide-chrome' : ''
      }`}
    >
      {/* ── Left cluster: autosave state ─────────────────────── */}
      <div data-tour="auto-save" className="flex items-center gap-2">
        <AutoSaveIndicator isDirty={isDirty} isSaving={isSaving} lastSaved={lastSaved} hasCloudSync={hasCloudSync} />
        {isDirty && !isSaving && (
          <button
            onClick={onSaveNow}
            className="flex items-center gap-2 h-10 px-3 rounded-lg bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors text-xs font-medium text-gray-700 dark:text-[#d4d4d4]"
            title="Save now (⌘S)"
          >
            <SaveIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
            <span>Save</span>
          </button>
        )}
      </div>

      {/* ── Right cluster: navigation, tools, and the primary Export CTA ── */}
      <div className="flex items-center gap-3">
        <ChapterNavDropdown
          chapters={chapters}
          selectedChapter={selectedChapter}
          onChapterSelect={onChapterSelect}
          bookTitle={bookTitle}
        />
        <HistoryButton versionCount={versionCount} exportCount={exportCount} onClickAction={onShowHistory} />
        <FocusModeButton onClick={onToggleFocusMode} />
        <LayoutSwitcher mode={rightPanelMode} onChange={onRightPanelModeChange} />

        {/* Export pill CTA — the primary action of the whole product. Labelled,
            prominent, anchored to the far right. This is intentional per the
            audit: the most important thing a user does here is finish and
            export a book. That should never be an unlabelled icon.
            Note: uses an inline SVG with stroke="currentColor" rather than
            the DownloadIcon component. DownloadIcon is a raster <img> via
            ThemeAwareImage, so its paths can't be recoloured with CSS — and
            the pill's dark-on-light background inverts the icon contrast
            it ships with. Inline SVG just inherits the button's text color. */}
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
          <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="w-48">
            <DropdownMenuItem onClick={onExportEPUB} className="flex items-center gap-2 cursor-pointer">
              <DownloadIcon className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">EPUB</div>
                <div className="text-xs text-gray-500">Kindle, Kobo, Apple Books</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF} className="flex items-center gap-2 cursor-pointer">
              <DownloadIcon className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">PDF</div>
                <div className="text-xs text-gray-500">Print & sharing</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportDocx} className="flex items-center gap-2 cursor-pointer">
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

// Persistent ⌘K discoverability chip. Sits in the toolbar alongside
// History, Focus Mode, and LayoutSwitcher. Only renders for Pro users.
// Always visible, no conditional timing or localStorage dismissal.
function CmdKHint() {
  const hasBookMind = useFeatureAccess('book_mind_ai');
  if (!hasBookMind) return null;
  return (
    <div
      className="flex items-center gap-1.5 h-10 px-3 rounded-lg text-xs font-medium text-gray-400 dark:text-[#737373] select-none"
      title="Select text and press ⌘K to edit with Book Mind"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span className="hidden sm:inline">⌘K</span>
    </div>
  );
}
