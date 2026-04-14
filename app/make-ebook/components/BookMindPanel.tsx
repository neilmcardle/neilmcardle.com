"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useBookMind, BookMindContext, BookMindAction, BookMindMessage } from '../hooks/useBookMind';
import {
  BookMindIcon as BookIcon,
  ThinkingDots,
  formatBookMindMessage as formatMessage,
  BOOK_MIND_COMPACT_QUICK_ACTIONS as QUICK_ACTIONS,
} from './BookMindShared';

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

export default function BookMindPanel({
  bookId, userId, title, author, genre,
  chapters = [], selectedChapterIndex = 0,
  selectedText: externalSelectedText, onClose,
}: BookMindPanelProps) {
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

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
      <div className="flex items-center gap-2">
        <BookIcon className="w-6 h-6 text-gray-500 dark:text-[#a3a3a3]" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Book Mind</span>
      </div>
      <div className="flex items-center gap-0.5">
        {messages.length > 0 && (
          <button
            onClick={() => { clearMessages(); createSession(); }}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="New chat"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
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
        {messages.length === 0 ? (
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
                      className="flex flex-col gap-0.5 p-3 rounded-xl bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors text-left disabled:opacity-50"
                    >
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{label}</span>
                      <span className="text-2xs text-gray-500 dark:text-[#737373]">{description}</span>
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
                    : 'bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-[#f5f5f5] rounded-bl-sm'
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
                <div className="bg-gray-100 dark:bg-[#262626] rounded-2xl rounded-bl-sm px-4 py-3">
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
      <div className="flex-shrink-0 px-3 pb-3 pt-2">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-3xl bg-gray-100 dark:bg-[#262626] px-4 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder={chapters.length > 0 ? 'Ask about your book…' : 'Open a book first…'}
            disabled={chapters.length === 0}
            rows={1}
            className="flex-1 appearance-none bg-transparent border-0 outline-none ring-0 shadow-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#888] focus:outline-none focus:ring-0 focus:shadow-none resize-none max-h-[120px] leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || chapters.length === 0}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-700 dark:hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
