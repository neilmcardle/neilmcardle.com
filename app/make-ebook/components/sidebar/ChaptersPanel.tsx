'use client';

import React, { useState } from 'react';
import { PlusIcon } from '../icons';
import BinIcon from '../icons/BinIcon';
import EmptyStateHint from '../EmptyStateHint';

interface Chapter {
  id: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  title: string;
  content: string;
  locked?: boolean;
  synopsis?: string;
}

interface ChaptersPanelProps {
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

// Drag handle — uses a bundled SVG in light/dark variants. Extracted from
// the old monolithic CollapsibleSidebar.
function HandleDragIcon({ isSelected: _isSelected }: { isSelected: boolean }) {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition"
      aria-hidden="true"
    >
      <img src="/drag-icon.svg" alt="Drag" className="w-4 h-4 dark:hidden" />
      <img src="/dark-drag-icon.svg" alt="Drag" className="w-4 h-4 hidden dark:block" />
    </span>
  );
}

export default function ChaptersPanel({
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
}: ChaptersPanelProps) {
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);

  return (
    <div data-tour="chapters" className="border-b border-gray-200 dark:border-[#2f2f2f] pb-2">
      <div className="flex items-center justify-between py-2 px-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8M16 17H8M10 9H8" />
          </svg>
          <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Chapters</span>
          <span className="text-xs text-gray-500 dark:text-[#a3a3a3]">({chapters.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
              className="p-1 hover:bg-gray-50 dark:hover:bg-[#262626] rounded transition-colors"
              title="Add chapter"
            >
              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
            </button>

            {chapterTypeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-[#2f2f2f] z-50 py-2 max-h-96 overflow-y-auto">
                <div className="space-y-3 px-2">
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-[#a3a3a3] uppercase">Front Matter</div>
                    {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-sm text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-[#a3a3a3] uppercase">Main Content</div>
                    {CHAPTER_TEMPLATES.content.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-sm text-[#050505] dark:text-[#e5e5e5]"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-[#a3a3a3] uppercase">Back Matter</div>
                    {CHAPTER_TEMPLATES.backmatter.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => {
                          handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                          setChapterTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-sm text-[#050505] dark:text-[#e5e5e5]"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
            title="No chapters yet"
            description="Click the + button above to add your first chapter."
          />
        ) : (
          <>
            <p className="text-xs text-gray-600 dark:text-[#a3a3a3] px-2 mb-1">Drag to reorder</p>
            {chapters.map((ch, i) => {
              const isSelected = selectedChapter === i;
              const titleText = ch.title?.trim() || 'Title';

              const typeLabel =
                ch.type === 'frontmatter' ? 'Frontmatter'
                : ch.type === 'backmatter' ? 'Backmatter'
                : `Chapter ${getContentChapterNumber(chapters, i)}`;
              const chapterTitle = titleText && titleText !== 'Title' ? titleText : 'Title';

              return (
                <div
                  key={ch.id}
                  className={`group flex items-center gap-2 px-2 py-2 rounded text-sm transition-all cursor-pointer select-none ${
                    dragOverIndex === i
                      ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                      : isSelected
                        ? 'bg-gray-100 dark:bg-[#262626] border border-transparent'
                        : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#262626]'
                  }`}
                  style={{ opacity: dragItemIndex === i && ghostPillPosition.visible ? 0.3 : 1 }}
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
                    <span className={`text-xs ${isSelected ? 'text-gray-500 dark:text-[#a3a3a3]' : 'text-gray-500 dark:text-[#737373]'}`}>
                      {typeLabel}
                    </span>
                    <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-[#f5f5f5] font-medium' : 'text-gray-600 dark:text-[#a3a3a3]'}`}>
                      {chapterTitle}
                    </span>
                  </div>
                  {handleToggleChapterLock && (
                    <button
                      className={`transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded ${ch.locked ? 'opacity-100 text-gray-600 dark:text-[#d4d4d4]' : 'opacity-0 group-hover:opacity-100 text-gray-400 dark:text-[#737373]'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleChapterLock(i);
                      }}
                      aria-label={ch.locked ? 'Unlock chapter' : 'Lock chapter'}
                      title={ch.locked ? 'Unlock chapter' : 'Mark complete and lock'}
                    >
                      {ch.locked ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0" />
                        </svg>
                      )}
                    </button>
                  )}
                  {chapters.length > 1 && !ch.locked && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] rounded text-gray-600 dark:text-[#a3a3a3]"
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
  );
}
