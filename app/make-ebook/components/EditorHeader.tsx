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
import ModeMenu from './ModeMenu';
import LayoutSwitcher, { RightPanelMode } from './LayoutSwitcher';
import { useIsMac } from './marketing/sections-v2/PlatformKey';
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

  // Writing modes (Focus + Flow, grouped in the Mode menu)
  focusActive: boolean;
  onToggleFocusMode: () => void;
  flowMode: boolean;
  onToggleFlowMode: () => void;

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
            title={`Save now (${isMac ? '⌘S' : 'Ctrl+S'})`}
          >
            <SaveIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
            <span>Save</span>
          </button>
        )}
      </div>

      {/* ── Right cluster: navigation, tools, and the primary Export CTA ──
           Hierarchy: navigation + view tools read as a quiet group; the dark
           Export pill is the single primary action. Low-frequency History
           lives in the overflow menu so it stops competing for attention. */}
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
        <LayoutSwitcher mode={rightPanelMode} onChange={onRightPanelModeChange} />

        {/* Overflow — low-frequency actions that shouldn't rival Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="More"
              aria-label="More actions"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#262626] text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="w-60">
            <DropdownMenuItem onClick={onShowHistory} className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Version & export history</span>
              </span>
              {versionCount + exportCount > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">{versionCount + exportCount}</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator so the primary action reads apart from the tools */}
        <span className="w-px h-6 bg-gray-200 dark:bg-[#2f2f2f] mx-1" aria-hidden="true" />

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
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
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
