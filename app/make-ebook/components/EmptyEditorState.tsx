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
      <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 py-4 sm:py-16 min-h-0 overflow-y-auto">
        {/* Logo */}
        <div style={{ marginBottom: '1rem' }} className="flex-shrink-0 sm:mb-[1.6rem]">
          <Image
            src="/make-ebook-logomark.svg"
            alt="makeEbook"
            width={320}
            height={320}
            className="w-32 sm:w-80 h-auto dark:invert"
            priority
          />
        </div>

        {/* Headline */}
        <h2
          className="text-2xl sm:text-2xl md:text-3xl text-[#222] dark:text-[#f5f5f5] text-center flex-shrink-0 whitespace-nowrap"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '1.8rem' }}
        >
          Bring your book from anywhere.
        </h2>


        {/* Actions */}
        <div className="w-full max-w-2xl flex-shrink-0 mx-auto">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
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

        {/* Quote — subtle hint below the cards, hidden on mobile */}
        <div className="hidden sm:block text-center flex-shrink-0" style={{ marginTop: '1.8rem' }}>
          <p className="text-sm italic text-[#999] dark:text-[#636363] leading-relaxed">
            &ldquo;{quote.text}&rdquo; <span className="not-italic">— {quote.author}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Action card — visual card with icon header, title, description, and
// a CTA button feel. Inspired by app-store-style launch cards.
// Warm blurred gradient backgrounds with white icons — each card gets
// a slightly shifted hue so they feel like a family, not identical.
const CARD_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  'Paste manuscript': {
    bg: 'linear-gradient(135deg, #d4a574 0%, #c4856b 40%, #a87c8a 100%)',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
      </svg>
    ),
  },
  'Upload file': {
    bg: 'linear-gradient(135deg, #c4856b 0%, #b07a8a 40%, #8b7aab 100%)',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  'Start writing': {
    bg: 'linear-gradient(135deg, #b07a8a 0%, #9a7aab 40%, #7a8ab0 100%)',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  'Open library': {
    bg: 'linear-gradient(135deg, #9a7aab 0%, #8a7ab0 40%, #7a9ab0 100%)',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
};

function ActionCard({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  const visual = CARD_ICONS[label] ?? CARD_ICONS['Start writing'];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 group text-left rounded-2xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#1e1e1e] hover:border-gray-300 dark:hover:border-[#444] hover:shadow-md transition-all overflow-hidden sm:min-w-[10rem]"
    >
      {/* Icon header with warm gradient */}
      <div
        className="flex items-center justify-center py-6 sm:py-8"
        style={{ background: visual.bg }}
      >
        {visual.icon}
      </div>
      {/* Content */}
      <div className="px-3 py-3 flex flex-col items-start gap-1.5">
        <span className="inline-block px-3 py-1 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold">
          {label}
        </span>
        <span className="text-[11px] text-[#888] dark:text-[#737373]">{description}</span>
      </div>
    </button>
  );
}

