"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBookMind, BookMindContext, BookMindAction, BookMindMessage } from '../hooks/useBookMind';
import { useFeatureAccess, useSubscription } from '@/lib/hooks/useSubscription';

interface BookMindPanelProps {
  bookId?: string;
  userId?: string;
  title?: string;
  author?: string;
  genre?: string;
  chapters?: { title: string; content: string; type: string }[];
  selectedChapterIndex?: number;
  selectedText?: string;
  onClose: () => void;
}

function BookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-[#737373] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}

function formatMessage(text: string): string {
  return text.split(/\n{2,}/).map(p =>
    `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')}</p>`
  ).join('');
}

const QUICK_ACTIONS: { action: BookMindAction; label: string; description: string }[] = [
  { action: 'summarize-book',       label: 'Summarise',      description: 'Full book overview' },
  { action: 'list-characters',      label: 'Characters',     description: 'Who appears where' },
  { action: 'find-inconsistencies', label: 'Inconsistencies',description: 'Plot holes & gaps' },
  { action: 'analyze-themes',       label: 'Themes',         description: 'Big ideas' },
];

export default function BookMindPanel({
  bookId, userId, title, author, genre,
  chapters = [], selectedChapterIndex = 0,
  selectedText: externalSelectedText, onClose,
}: BookMindPanelProps) {
  const hasAccess = useFeatureAccess('book_mind_ai');
  const { isLoading: subLoading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { messages, isLoading, error, sendMessage, quickAction, clearMessages, createSession, currentSessionId } = useBookMind({ bookId, userId });

  const [input, setInput] = useState('');
  const [dismissedText, setDismissedText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSelectedText = externalSelectedText && externalSelectedText !== dismissedText ? externalSelectedText : undefined;

  useEffect(() => { if (externalSelectedText) setDismissedText(null); }, [externalSelectedText]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 260); }, []);

  const currentChapter = chapters[selectedChapterIndex] ?? { title: '', content: '', type: 'chapter' };
  const context: BookMindContext = {
    title: title ?? '', author: author ?? '', genre: genre ?? '',
    chapterTitle: currentChapter.title, chapterContent: currentChapter.content,
    allChapters: chapters, selectedText: activeSelectedText,
  };

  const ensureSession = () => { if (!currentSessionId) createSession(); };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    ensureSession();
    await sendMessage(msg, context, 'ask-question');
  };

  const handleQuickAction = async (action: BookMindAction) => {
    ensureSession();
    await quickAction(action, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { setCheckoutLoading(false); }
  };

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
      <div className="flex items-center gap-2">
        <BookIcon className="w-6 h-6 text-gray-500 dark:text-[#a3a3a3]" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Book Mind</span>
      </div>
      <div className="flex items-center gap-0.5">
        {bookId && (
          <Link
            href={`/make-ebook/book-mind?book=${bookId}`}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="Open full page"
            target="_blank"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        )}
        {messages.length > 0 && (
          <button
            onClick={() => { clearMessages(); createSession(); }}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="New chat"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ── Single stable layout (prevents animation jump from layout shifts) ─────
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white w-full">
      {Header}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {subLoading ? (
          <div className="flex h-full items-center justify-center">
            <BookIcon className="w-5 h-5 text-gray-300 dark:text-[#737373] animate-pulse" />
          </div>
        ) : !hasAccess ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4 max-w-[240px]">
              <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
              <div>
                <h3 className="text-sm font-semibold mb-1">Book Mind AI</h3>
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
                  AI-powered analysis of your manuscript. Summarise chapters, find plot holes, explore themes.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-700 dark:hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
              >
                {checkoutLoading ? 'Redirecting…' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-3 pt-2">
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Open a book to get started.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 dark:text-[#737373] text-center pb-1">
                  {chapters.length} chapters · ask anything
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_ACTIONS.map(({ action, label, description }) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="flex flex-col gap-0.5 p-3 rounded-xl bg-neutral-100 dark:bg-[#262626] hover:bg-neutral-200 dark:hover:bg-[#303030] transition-colors text-left disabled:opacity-40"
                    >
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{label}</span>
                      <span className="text-[10px] text-gray-500 dark:text-[#737373]">{description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {messages.map((message: BookMindMessage) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-gray-900 dark:bg-[#2a2a2a] text-white rounded-br-sm'
                    : 'bg-neutral-100 dark:bg-[#262626] text-gray-800 dark:text-[#f5f5f5] rounded-bl-sm'
                }`}>
                  {message.content ? (
                    <div
                      className="[&>p+p]:mt-3 [&>p]:m-0"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  ) : (
                    <ThinkingDots />
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-[#262626] rounded-2xl rounded-bl-sm px-4 py-3">
                  <ThinkingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — always rendered to keep layout stable during animation */}
      <div className={`flex-shrink-0 px-3 pb-3 pt-2 ${subLoading || !hasAccess ? 'invisible' : ''}`}>
        {activeSelectedText && (
          <div className="flex items-center gap-2 px-1 pb-2">
            <p className="flex-1 text-xs text-gray-400 dark:text-[#737373] truncate italic">
              "{activeSelectedText.length > 55 ? activeSelectedText.slice(0, 55) + '…' : activeSelectedText}"
            </p>
            <button
              onClick={() => setDismissedText(externalSelectedText ?? null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-[#d4d4d4] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-3xl bg-neutral-100 dark:bg-[#262626] px-4 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder={chapters.length > 0 ? 'Ask about your book…' : 'Open a book first…'}
            disabled={chapters.length === 0}
            rows={1}
            className="flex-1 appearance-none bg-transparent border-0 outline-none ring-0 shadow-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#888] focus:outline-none focus:ring-0 focus:shadow-none resize-none max-h-[120px] leading-relaxed disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || chapters.length === 0}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-700 dark:hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
