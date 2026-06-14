'use client';

// Empty state shown when no book is loaded. A two-panel composition that
// mirrors the marketing EditorShowcaseSection: an always-dark "Your Library"
// list (the user's real saved books, click to open) beside an always-cream
// "paper" page where you create a new book (paste / upload / start writing).
// Both panel colours are hardcoded regardless of theme — this is the editor
// surface, not a marketing page, so it does not touch the light-only rule.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useIsMac } from './marketing/sections-v2/PlatformKey';
import type { BookRecord } from '../types';

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

// Line icons reused for the paper-panel action rows (paths lifted from the
// previous card design, gradients dropped).
const ICONS = {
  paste: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  write: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

interface EmptyEditorStateProps {
  onNewBook: () => void;
  onPasteManuscript: (text: string) => void;
  onUploadFile: () => void;
  libraryBooks: BookRecord[];
  libraryLoading?: boolean;
  onOpenBook: (bookId: string) => void;
}

// Word count for a book. Pro books carry a pre-computed total; otherwise strip
// HTML and count. Always called inside a useMemo over the library.
function countBookWords(book: BookRecord): number {
  if (book.bookmindMemory?.brief?.totalWords) return book.bookmindMemory.brief.totalWords;
  let n = 0;
  for (const ch of book.chapters ?? []) {
    const m = (ch.content || '').replace(/<[^>]+>/g, ' ').match(/\S+/g);
    n += m ? m.length : 0;
  }
  return n;
}

export default function EmptyEditorState({
  onNewBook,
  onPasteManuscript,
  onUploadFile,
  libraryBooks,
  libraryLoading,
  onOpenBook,
}: EmptyEditorStateProps) {
  const [quote, setQuote] = useState(LITERARY_QUOTES[0]);
  const [pasteExpanded, setPasteExpanded] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pasteButtonRef = useRef<HTMLButtonElement>(null);
  const isMac = useIsMac();

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

  const { rows, totalWords } = useMemo(() => {
    const sorted = [...libraryBooks].sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
    const rows = sorted.map((b) => ({
      id: b.id,
      title: b.title || 'Untitled',
      words: countBookWords(b),
    }));
    const totalWords = rows.reduce((s, r) => s + r.words, 0);
    return { rows, totalWords };
  }, [libraryBooks]);

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
    pasteButtonRef.current?.focus();
  };

  return (
    <div className="flex-1 overflow-hidden bg-white dark:bg-[#1e1e1e]">
      <div className="h-full min-h-0 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* flex-col + my-auto centers vertically without clipping tall content
            (the documented items-center overflow gotcha). */}
        <div className="min-h-full flex flex-col">
          <div className="w-full max-w-6xl mx-auto my-auto grid lg:grid-cols-[1fr_1.3fr] gap-5 items-stretch">
            {/* Paper first in source so it stacks first on mobile; desktop order
                restores Library-left / Paper-right. */}
            <PaperPanel
              quote={quote}
              pasteExpanded={pasteExpanded}
              pasteValue={pasteValue}
              onPasteValueChange={setPasteValue}
              textareaRef={textareaRef}
              pasteButtonRef={pasteButtonRef}
              onPasteStart={() => setPasteExpanded(true)}
              onPasteSubmit={handlePasteSubmit}
              onPasteCancel={handlePasteCancel}
              onUploadFile={onUploadFile}
              onNewBook={onNewBook}
            />
            <EntryLibraryPanel
              rows={rows}
              totalWords={totalWords}
              loading={!!libraryLoading}
              isMac={isMac}
              onOpenBook={onOpenBook}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Left: always-dark library ──────────────────────────────────────────────

type LibraryRow = { id: string; title: string; words: number };

function EntryLibraryPanel({
  rows,
  totalWords,
  loading,
  isMac,
  onOpenBook,
}: {
  rows: LibraryRow[];
  totalWords: number;
  loading: boolean;
  isMac: boolean;
  onOpenBook: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const headerLabel = rows.length > 0 ? rows[0].title : 'Your shelf is empty';

  return (
    <div className="lg:order-1 flex flex-col bg-[#1e1e1e] text-white rounded-[20px] border border-[#2f2f2f] overflow-hidden lg:min-h-[540px] max-h-[44vh] lg:max-h-none">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-[#2f2f2f] flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 truncate pr-3">
          Your Library &middot; {headerLabel}
        </span>
        <span className="text-[10px] text-white/30 flex items-center gap-1.5 flex-shrink-0" aria-hidden="true">
          <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[9px]">{isMac ? '⌘' : 'Ctrl'}</kbd>
          <span>+</span>
          <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[9px]">K</kbd>
        </span>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 rounded bg-white/5 motion-safe:animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <LibraryEmptyState />
        ) : (
          rows.map((b, i) => {
            const active = hoveredId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onOpenBook(b.id)}
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(b.id)}
                onBlur={() => setHoveredId(null)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left border-l-2 transition-colors focus:outline-none ${
                  active ? 'bg-blue-600/10 border-blue-600' : 'border-transparent hover:bg-white/5'
                }`}
              >
                <span aria-hidden className="text-white/20 text-[11px] select-none">⋮⋮</span>
                <span className="font-mono text-[10px] text-white/30 w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className={`flex-1 truncate text-[13px] ${active ? 'text-white font-medium' : 'text-white/55'}`}>{b.title}</span>
                <span className={`font-mono text-[10px] flex-shrink-0 ${active ? 'text-white/60' : 'text-white/25'}`}>{b.words.toLocaleString()}w</span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-[#2f2f2f] flex justify-between items-center text-[11px] text-white/30 flex-shrink-0">
        <span>
          {rows.length} {rows.length === 1 ? 'book' : 'books'}
          {rows.length > 0 ? ` · ${totalWords.toLocaleString()} words` : ''}
        </span>
      </div>
    </div>
  );
}

function LibraryEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
      <span aria-hidden className="text-white/15 text-3xl mb-3 select-none">⋮⋮</span>
      <p className="text-[13px] text-white/50">No saved books yet.</p>
      <p className="text-[11px] text-white/30 mt-1">Your library lives here. Start one on the right.</p>
    </div>
  );
}

// ─── Right: always-cream paper ──────────────────────────────────────────────

function PaperPanel({
  quote,
  pasteExpanded,
  pasteValue,
  onPasteValueChange,
  textareaRef,
  pasteButtonRef,
  onPasteStart,
  onPasteSubmit,
  onPasteCancel,
  onUploadFile,
  onNewBook,
}: {
  quote: { text: string; author: string };
  pasteExpanded: boolean;
  pasteValue: string;
  onPasteValueChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  pasteButtonRef: React.RefObject<HTMLButtonElement | null>;
  onPasteStart: () => void;
  onPasteSubmit: () => void;
  onPasteCancel: () => void;
  onUploadFile: () => void;
  onNewBook: () => void;
}) {
  const words = pasteValue.trim() ? pasteValue.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="lg:order-2 relative flex flex-col bg-[#f7f4ea] border border-gray-200 rounded-[20px] overflow-hidden lg:min-h-[540px] shadow-[0_24px_40px_-24px_rgba(20,20,19,.22),0_2px_4px_rgba(20,20,19,.04)]">
      {/* Top bar — echoes the reader panel */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-200 bg-white/60 flex-shrink-0">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">New book</span>
        <span className="hidden sm:inline text-[13px] text-gray-500 italic" style={{ fontFamily: 'Georgia, serif' }}>Untitled</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 bg-gray-900 text-[#faf9f5] text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-500" />
          </span>
          Blank page
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-7 sm:px-12 py-9 sm:py-11" style={{ fontFamily: 'Georgia, serif' }}>
        <h2 className="font-serif font-bold text-gray-900 leading-[1.1] tracking-[-0.02em] text-balance" style={{ fontSize: 'clamp(26px, 3.2vw, 32px)' }}>
          Bring your book from anywhere.
        </h2>

        <div className="mt-7 flex-1">
          {pasteExpanded ? (
            <div>
              <textarea
                ref={textareaRef}
                value={pasteValue}
                onChange={(e) => onPasteValueChange(e.target.value)}
                placeholder="Paste your manuscript here…"
                rows={9}
                className="w-full px-5 py-4 rounded-2xl border border-gray-300/70 bg-white/70 text-[#2a2a28] placeholder:text-gray-400 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">{pasteValue.trim() ? `${words.toLocaleString()} words` : 'Paste to begin'}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onPasteCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onPasteSubmit}
                    disabled={!pasteValue.trim()}
                    className="px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <PaperActionRow primary refEl={pasteButtonRef} icon={ICONS.paste} label="Paste manuscript" description="From a doc, an email, anywhere" onClick={onPasteStart} />
              <PaperActionRow icon={ICONS.upload} label="Upload a file" description=".docx or .txt" onClick={onUploadFile} />
              <PaperActionRow icon={ICONS.write} label="Start writing" description="Begin with a blank book" onClick={onNewBook} />
            </div>
          )}
        </div>

        {/* Quote */}
        <p className="mt-8 text-sm italic text-gray-500 leading-relaxed">
          &ldquo;{quote.text}&rdquo; <span className="not-italic text-gray-400">— {quote.author}</span>
        </p>
      </div>
    </div>
  );
}

function PaperActionRow({
  icon,
  label,
  description,
  onClick,
  primary,
  refEl,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  refEl?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={refEl}
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 ${
        primary ? 'border-gray-300 bg-white/80 hover:bg-white' : 'border-gray-200/80 bg-white/40 hover:bg-white/70 hover:border-gray-300'
      }`}
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900/[0.05] text-gray-500 flex-shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>{label}</span>
        <span className="block text-[12px] text-gray-500 mt-0.5">{description}</span>
      </span>
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
