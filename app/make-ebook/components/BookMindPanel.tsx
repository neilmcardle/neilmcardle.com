"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBookMind, BookMindContext, BookMindAction, BookMindMessage, ChatSession } from '../hooks/useBookMind';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    quickAction,
    clearMessages,
    createSession,
    currentSessionId,
    chatSessions,
    loadSession,
    deleteSession,
  } = useBookMind({ bookId, userId });
  const [historyOpen, setHistoryOpen] = useState(false);

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

  // Trust signal: what Book Mind is actually reading. Anchored to the
  // current manuscript state so the author sees the real reach, not a
  // stale snapshot. Cheap word count (char-based, good enough).
  const totalWords = chapters.reduce((sum, ch) => {
    const words = ch.content.split(/\s+/).filter(Boolean).length;
    return sum + words;
  }, 0);

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

  const formatSessionTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const sortedSessions: ChatSession[] = [...chatSessions].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    setHistoryOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
      <div className="flex items-center gap-2">
        <BookIcon className="w-6 h-6 text-gray-500 dark:text-[#a3a3a3]" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Book Mind</span>
      </div>
      <div className="flex items-center gap-0.5">
        {/* Chat history: compact popover of recent sessions for this book.
            Tap to resume, hover to reveal delete. Full rename/manage lives
            on the standalone page. */}
        {sortedSessions.length > 0 && (
          <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
                title="Chat history"
                aria-label="Chat history"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={6}
              className="w-72 p-0 max-h-96 overflow-y-auto bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2f2f2f]"
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide">Recent chats</span>
                <span className="text-2xs text-gray-400 dark:text-[#737373]">{sortedSessions.length}</span>
              </div>
              <ul className="py-1">
                {sortedSessions.map(session => {
                  const isCurrent = session.id === currentSessionId;
                  const preview = session.messages.find(m => m.role === 'user')?.content ?? '';
                  return (
                    <li
                      key={session.id}
                      className={`group relative flex items-start gap-2 px-3 py-2 transition-colors ${
                        isCurrent
                          ? 'bg-gray-100 dark:bg-[#262626]'
                          : 'hover:bg-gray-50 dark:hover:bg-[#232323]'
                      }`}
                    >
                      <button
                        onClick={() => handleLoadSession(session.id)}
                        className="flex-1 min-w-0 text-left pr-7"
                        aria-label={`Load ${session.name}`}
                      >
                        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#4070ff]' : 'text-gray-900 dark:text-white'}`}>
                          {session.name}
                        </p>
                        {preview && (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] truncate mt-0.5">
                            {preview}
                          </p>
                        )}
                        <p className="text-2xs text-gray-400 dark:text-[#737373] mt-0.5">
                          {formatSessionTimestamp(session.updatedAt)}
                        </p>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-all"
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {bookId && (
                <div className="border-t border-gray-100 dark:border-[#262626] px-3 py-2">
                  <Link
                    href={`/make-ebook/book-mind?book=${bookId}`}
                    target="_blank"
                    className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setHistoryOpen(false)}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Manage all chats in full view
                  </Link>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
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
        {/* Open full page: jumps to the standalone Book Mind surface with
            sidebar, session rename, and longer-form reading space. Free
            users never reach this panel so the link is always safe. */}
        {bookId && (
          <Link
            href={`/make-ebook/book-mind?book=${bookId}`}
            target="_blank"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="Open full page"
            aria-label="Open Book Mind in full page"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
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

      {/* Context transparency strip — tells the author exactly what Book
          Mind can see right now. Anchors trust: responses are grounded in
          the actual manuscript state, not a stale snapshot. Hidden when no
          book is open. */}
      {chapters.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1.5 border-t border-gray-100 dark:border-[#262626]">
          <p className="text-2xs text-gray-400 dark:text-[#737373] leading-tight">
            Reading all {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
            {totalWords > 0 ? ` · ${totalWords.toLocaleString()} words` : ''}
          </p>
        </div>
      )}

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
