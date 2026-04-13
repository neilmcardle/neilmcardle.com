'use client';

// Book metadata panel rendered inside the sidebar. The primary Save and
// Export affordances live in the EditorHeader (top bar) — not here.
// Having a second set of Save/Export buttons in the sidebar was redundant
// and confused discoverability per the Phase 3 audit.

import React from 'react';
import { PlusIcon } from '../icons';

interface BookDetailsPanelProps {
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
  coverFile: string | null;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lockedSections: { bookInfo: boolean; publishing: boolean; tags: boolean; cover: boolean };
}

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

export default function BookDetailsPanel({
  title, setTitle,
  author, setAuthor,
  blurb, setBlurb,
  publisher, setPublisher,
  pubDate, setPubDate,
  isbn, setIsbn,
  language, setLanguage,
  genre, setGenre,
  tags, handleAddTag, handleRemoveTag,
  tagInput, setTagInput,
  coverFile, handleCoverChange,
  lockedSections,
}: BookDetailsPanelProps) {
  return (
    <div data-tour="book-details" className="border-b border-gray-200 dark:border-[#2f2f2f] pb-2">
      <div className="flex items-center gap-2 py-2 px-2">
        <svg className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Book</span>
          {title && (
            <span className="text-xs text-gray-600 dark:text-[#a3a3a3] truncate">{title}</span>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-3 pl-2 pr-2">
        {/* Cover Image */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Cover Image</label>
          <div className="w-full aspect-[2/3] max-h-52 bg-gray-100 dark:bg-[#2a2a2a] rounded border border-gray-200 dark:border-[#2f2f2f] overflow-hidden flex items-center justify-center mb-2">
            {coverFile
              ? <img src={coverFile} alt="Cover" className="w-full h-full object-cover" />
              : <img src="/image-icon.svg" alt="" className="w-8 h-8 opacity-30 dark:opacity-20" />}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            disabled={lockedSections.cover}
            className="w-full text-sm text-[#C0C0C0] file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2a2a2a] file:text-[#050505] dark:file:text-[#e5e5e5] hover:file:bg-gray-200 dark:hover:file:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
            placeholder="Book title"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
            placeholder="Author name"
          />
        </div>

        {/* Blurb */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Description</label>
          <textarea
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] resize-none placeholder-[#C0C0C0]"
            placeholder="Brief description or back cover blurb (optional)"
            rows={3}
          />
        </div>

        {/* Publisher */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Publisher</label>
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
            placeholder="Publisher name"
          />
        </div>

        {/* Publication Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Publication Date</label>
          <input
            type="date"
            value={pubDate}
            onChange={(e) => setPubDate(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Genre */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Genre</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
            placeholder="e.g. Fiction, Mystery"
          />
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">ISBN (optional)</label>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
            placeholder="978-0-123456-78-9"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-[#a3a3a3]">
            ISBNs must be purchased from official agencies (e.g., £93 from{' '}
            <a href="https://www.nielsenisbnstore.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-[#d4d4d4]">
              Nielsen UK
            </a>
            ). They cannot be invented.
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-1">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              disabled={lockedSections.bookInfo}
              className="flex-1 px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] placeholder-[#C0C0C0]"
              placeholder="e.g., fiction, thriller, mystery, romance"
            />
            <button
              onClick={handleAddTag}
              disabled={lockedSections.bookInfo}
              className="px-3 py-2 rounded bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-[#262626] text-[#050505] dark:text-[#e5e5e5]"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 dark:hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Coverly promo */}
        <div>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams({ title: title || '', author: author || '' }).toString();
              window.open(`https://coverly.figma.site?${params}`, '_blank', 'noopener,noreferrer');
            }}
            className="group relative w-full overflow-hidden rounded-xl p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Create a professional book cover with Coverly"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3 rounded-xl bg-white dark:bg-[#1e1e1e] px-3 py-3">
              <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden shadow-md ring-1 ring-black/10 dark:ring-white/10 group-hover:shadow-lg transition-shadow">
                <img src="/coverly-preview.png" alt="Example cover made with Coverly" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Need a cover?</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase">
                    Free
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-tight">Design a professional cover in minutes</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 group-hover:gap-1.5 transition-all">
                  <span>Open Coverly</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
