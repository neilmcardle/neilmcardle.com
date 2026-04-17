'use client';

// Empty state shown when the user is signed into the editor but has no
// book loaded. After the Phase-B positioning pivot, the primary affordance
// is "bring your book from anywhere" — paste, upload, start fresh, or open
// library — not "start a new blank book". Reflects the new one-liner:
// makeEbook is the place where any book becomes shippable, regardless of
// how it got written. See CLAUDE.md Part 1.

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const LITERARY_QUOTES = [
  { text: 'There is no greater agony than bearing an untold story inside you.', author: 'Maya Angelou' },
  { text: 'The scariest moment is always just before you start.', author: 'Stephen King' },
  { text: 'You can make anything by writing.', author: 'C.S. Lewis' },
  { text: 'Start writing, no matter what. The water does not flow until the faucet is turned on.', author: "Louis L'Amour" },
  { text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.", author: 'Toni Morrison' },
  { text: 'Write what should not be forgotten.', author: 'Isabel Allende' },
  { text: 'One day I will find the right words, and they will be simple.', author: 'Jack Kerouac' },
  { text: 'The first draft is just you telling yourself the story.', author: 'Terry Pratchett' },
  { text: 'Fill your paper with the breathings of your heart.', author: 'William Wordsworth' },
  { text: 'We write to taste life twice, in the moment and in retrospect.', author: 'Anaïs Nin' },
];

interface EmptyEditorStateProps {
  onNewBook: () => void;
  onOpenLibrary: () => void;
  libraryCount: number;
  libraryLoading?: boolean;
  onPasteManuscript: (text: string) => void;
  onUploadFile: () => void;
}

export default function EmptyEditorState({
  onNewBook,
  onOpenLibrary,
  libraryCount,
  libraryLoading,
  onPasteManuscript,
  onUploadFile,
}: EmptyEditorStateProps) {
  const [quote, setQuote] = useState(LITERARY_QUOTES[0]);
  const [pasteExpanded, setPasteExpanded] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const idx = Math.floor(Math.random() * LITERARY_QUOTES.length);
    setQuote(LITERARY_QUOTES[idx]);
  }, []);

  useEffect(() => {
    if (pasteExpanded) {
      // Tiny delay so the element exists before we focus it.
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [pasteExpanded]);

  const handlePasteSubmit = () => {
    const trimmed = pasteValue.trim();
    if (!trimmed) return;
    onPasteManuscript(trimmed);
    setPasteValue('');
    setPasteExpanded(false);
  };

  const handlePasteCancel = () => {
    setPasteValue('');
    setPasteExpanded(false);
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#1e1e1e] overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 py-8 sm:py-16 min-h-0 overflow-y-auto">
        {/* Logo */}
        <div className="mb-6 sm:mb-10 flex-shrink-0">
          <Image
            src="/make-ebook-logo.svg"
            alt="makeEbook"
            width={96}
            height={96}
            className="w-14 h-14 sm:w-20 sm:h-20 dark:invert opacity-80"
            priority
          />
        </div>

        {/* Quote */}
        <div className="max-w-3xl mb-8 sm:mb-12 text-center animate-in fade-in duration-1000 flex-shrink-0">
          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-serif italic text-[#444] dark:text-[#d4d4d4] leading-relaxed mb-3 sm:mb-5">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs sm:text-base md:text-lg text-[#999] dark:text-[#737373] font-light">
            — {quote.author}
          </p>
        </div>

        {/* Headline */}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-serif text-[#222] dark:text-[#f5f5f5] mb-2 sm:mb-3 text-center flex-shrink-0">
          Bring your book from anywhere.
        </h2>
        <p className="text-sm sm:text-base text-[#888] dark:text-[#a3a3a3] mb-4 sm:mb-6 text-center max-w-xl flex-shrink-0 px-4">
          Wrote it in Word, drafted it in Google Docs, prompted it from an AI — start here by pasting, uploading, or writing fresh.
        </p>

        {/* First-run guidance — shows steps so new users know the path */}
        <div className="w-full max-w-xl mb-8 sm:mb-12 flex-shrink-0 px-4">
          <div className="flex items-center gap-6 sm:gap-8 justify-center text-center">
            <GuidanceStep number={1} label="Add your text" />
            <GuidanceArrow />
            <GuidanceStep number={2} label="Open Book Mind" />
            <GuidanceArrow />
            <GuidanceStep number={3} label="Export your book" />
          </div>
        </div>

        {/* Actions — four affordances, Paste is the primary */}
        <div className="w-full max-w-2xl flex-shrink-0">
          {pasteExpanded ? (
            /* Inline paste textarea — full-width, replaces the action row */
            <div className="w-full">
              <textarea
                ref={textareaRef}
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder="Paste your manuscript here..."
                rows={10}
                className="w-full px-5 py-4 rounded-2xl border border-[#e5e5e5] dark:border-[#2f2f2f] bg-white dark:bg-[#171717] text-[#222] dark:text-[#f5f5f5] placeholder:text-[#bbb] dark:placeholder:text-[#555] font-serif text-base sm:text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#111]/10 dark:focus:ring-white/10 resize-y"
              />
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-[#999] dark:text-[#737373]">
                  {pasteValue.trim() ? `${pasteValue.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words` : 'Paste to begin'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteCancel}
                    className="px-4 py-2 text-sm text-[#666] dark:text-[#a3a3a3] hover:text-[#111] dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteSubmit}
                    disabled={!pasteValue.trim()}
                    className="px-6 py-2.5 text-sm font-semibold bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-full hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Four affordances in a row on desktop, stacked on mobile */
            <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
              <ActionCard
                primary
                label="Paste manuscript"
                description="From anywhere"
                onClick={() => setPasteExpanded(true)}
              />
              <ActionCard
                label="Upload file"
                description=".docx or .txt"
                onClick={onUploadFile}
              />
              <ActionCard
                label="Start writing"
                description="A blank book"
                onClick={onNewBook}
              />
              {libraryLoading ? (
                <ActionCard
                  label="Open library"
                  description="Loading your books…"
                  onClick={() => {}}
                />
              ) : libraryCount > 0 ? (
                <ActionCard
                  label="Open library"
                  description={`${libraryCount} saved ${libraryCount === 1 ? 'book' : 'books'}`}
                  onClick={onOpenLibrary}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// A single action card. `primary` gives it the filled-pill treatment so
// Paste reads as the hero affordance; everything else is the outlined
// secondary style. Kept inline in this file because it's not reused
// anywhere else and the variants are small.
function ActionCard({
  label,
  description,
  onClick,
  primary = false,
}: {
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  const base =
    'flex-1 group text-left px-5 py-4 rounded-2xl transition-colors flex flex-col gap-0.5 sm:min-w-[12rem]';
  const filled =
    'bg-[#111] dark:bg-white text-white dark:text-[#111] hover:bg-[#333] dark:hover:bg-[#e5e5e5]';
  const outlined =
    'border border-[#e5e5e5] dark:border-[#2f2f2f] text-[#222] dark:text-[#f5f5f5] hover:bg-[#fafafa] dark:hover:bg-[#1f1f1f] hover:border-[#ccc] dark:hover:border-[#444]';

  return (
    <button type="button" onClick={onClick} className={`${base} ${primary ? filled : outlined}`}>
      <span className="text-sm sm:text-base font-semibold">{label}</span>
      <span className={`text-xs ${primary ? 'text-white/70 dark:text-[#111]/60' : 'text-[#888] dark:text-[#737373]'}`}>
        {description}
      </span>
    </button>
  );
}

function GuidanceStep({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#262626] text-[11px] font-bold text-gray-500 dark:text-[#a3a3a3] flex items-center justify-center">
        {number}
      </span>
      <span className="text-[11px] text-gray-500 dark:text-[#a3a3a3] font-medium whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function GuidanceArrow() {
  return (
    <svg className="w-4 h-4 text-gray-300 dark:text-[#525252] flex-shrink-0 -mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
