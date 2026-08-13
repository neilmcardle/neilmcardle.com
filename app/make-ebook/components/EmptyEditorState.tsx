'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  library: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="3" height="16" rx="0.5" />
      <rect x="10" y="7" width="3" height="13" rx="0.5" />
      <rect x="16" y="5" width="3" height="15" rx="0.5" />
      <path d="M3 20h18" />
    </svg>
  ),
};

interface EmptyEditorStateProps {
  onNewBook: () => void;
  onPasteManuscript: (text: string) => void;
  onUploadFile: () => void;
  onOpenLibrary: () => void;
  libraryBooks: BookRecord[];
  libraryLoading?: boolean;
  onOpenBook: (bookId: string) => void;
}

export default function EmptyEditorState({
  onNewBook,
  onPasteManuscript,
  onUploadFile,
  onOpenLibrary,
}: EmptyEditorStateProps) {
  const [quote, setQuote] = useState(LITERARY_QUOTES[0]);
  const [pasteExpanded, setPasteExpanded] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pasteButtonRef = useRef<HTMLButtonElement>(null);

  // Locked animation values (tuned with DialKit)
  const STAGGER_DELAY = 0.4;
  const DURATION = 0.6;
  const Y_OFFSET = 16;

  useEffect(() => {
    const idx = Math.floor(Math.random() * LITERARY_QUOTES.length);
    setQuote(LITERARY_QUOTES[idx]);
  }, []);

  useEffect(() => {
    if (pasteExpanded) {
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
    pasteButtonRef.current?.focus();
  };

  return (
    <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
      <div className="h-full min-h-0 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="min-h-full flex flex-col">
          <div className="w-full max-w-xl mx-auto my-auto">
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
              onOpenLibrary={onOpenLibrary}
              staggerDelay={STAGGER_DELAY}
              duration={DURATION}
              yOffset={Y_OFFSET}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  onOpenLibrary,
  staggerDelay,
  duration,
  yOffset,
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
  onOpenLibrary: () => void;
  staggerDelay: number;
  duration: number;
  yOffset: number;
}) {
  const words = pasteValue.trim() ? pasteValue.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="relative flex flex-col bg-[#2c2c2c] border border-[#3a3a3a] rounded-[20px] overflow-hidden">
      {/* Body */}
      <div className="flex-1 flex flex-col px-7 sm:px-10 py-9 sm:py-10">
        <h2 className="font-bold text-white leading-[1.1] tracking-[-0.02em]" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.2vw, 32px)' }}>
          Bring your book.
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
                className="w-full px-5 py-4 rounded-2xl border border-[#3a3a3a] bg-white/[0.06] text-white placeholder:text-white/30 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-white/10 resize-y"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-white/40">{pasteValue.trim() ? `${words.toLocaleString()} words` : 'Paste to begin'}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onPasteCancel} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onPasteSubmit}
                    disabled={!pasteValue.trim()}
                    className="px-6 py-2.5 text-sm font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <PaperActionRow primary refEl={pasteButtonRef} icon={ICONS.paste} label="Paste manuscript" description="From a doc, an email, anywhere" onClick={onPasteStart} index={0} staggerDelay={staggerDelay} duration={duration} yOffset={yOffset} />
              <PaperActionRow icon={ICONS.upload} label="Upload a file" description=".docx or .txt" onClick={onUploadFile} index={1} staggerDelay={staggerDelay} duration={duration} yOffset={yOffset} />
              <PaperActionRow icon={ICONS.write} label="Start writing" description="Begin with a blank book" onClick={onNewBook} index={2} staggerDelay={staggerDelay} duration={duration} yOffset={yOffset} />
              <PaperActionRow icon={ICONS.library} label="Open library" description="Your saved books" onClick={onOpenLibrary} index={3} staggerDelay={staggerDelay} duration={duration} yOffset={yOffset} />
            </div>
          )}
        </div>

        {/* Quote */}
        <p className="mt-8 text-sm italic text-white/35 leading-relaxed">
          &ldquo;{quote.text}&rdquo; <span className="not-italic text-white/25">— {quote.author}</span>
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
  index = 0,
  staggerDelay = 0.1,
  duration = 0.4,
  yOffset = 20,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  refEl?: React.Ref<HTMLButtonElement>;
  index?: number;
  staggerDelay?: number;
  duration?: number;
  yOffset?: number;
}) {
  return (
    <motion.button
      ref={refEl}
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * staggerDelay,
        duration: duration,
        ease: 'easeOut',
      }}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
        primary
          ? 'border-[#444] bg-white/[0.08] hover:bg-white/[0.12]'
          : 'border-[#3a3a3a] bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#444]'
      }`}
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.08] text-white/50 flex-shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] text-white" style={{ fontFamily: 'Georgia, serif' }}>{label}</span>
        <span className="block text-[12px] text-white/40 mt-0.5">{description}</span>
      </span>
      <svg className="w-4 h-4 text-white/25 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </motion.button>
  );
}

