"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookMind, BookMindContext, BookMindAction, ChatSession } from '../hooks/useBookMind';
import { useFeatureAccess, useSubscription } from '@/lib/hooks/useSubscription';
import { useAuth } from '@/lib/hooks/useAuth';
import { loadBookLibrary } from '../utils/bookLibrary';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';
import {
  BookMindIcon as BookIcon,
  ThinkingDots,
  formatBookMindMessage as formatMessage,
} from '../components/BookMindShared';

// The standalone page uses long-form labels ("Summarize book") rather than
// the terse ones in BookMindShared ("Summarise"). The full-page surface has
// room to breathe; the inline right panel does not. This is an intentional
// local override — do not replace with the shared constant without also
// adding a label variant there.
const QUICK_ACTIONS: { action: BookMindAction; label: string; description: string }[] = [
  { action: 'summarize-book',       label: 'Summarize book',        description: 'Plot, themes & arc' },
  { action: 'list-characters',      label: 'List characters',       description: 'Who appears and where' },
  { action: 'find-inconsistencies', label: 'Find inconsistencies',  description: 'Plot holes & continuity' },
  { action: 'analyze-themes',       label: 'Analyze themes',        description: 'Ideas in your writing' },
  { action: 'timeline-review',      label: 'Review timeline',       description: 'Chronology check' },
  { action: 'word-frequency',       label: 'Word usage',            description: 'Overused words & phrases' },
];

function BookMindContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookIdParam = searchParams?.get('book') || null;
  const { user } = useAuth();

  const hasBookMindAccess = useFeatureAccess('book_mind_ai');
  const { isLoading: subLoading } = useSubscription();

  // Free users should never reach this page. Per CLAUDE.md Pro/Free UI
  // policy, the upgrade pitch lives in exactly one place (the account
  // dropdown) — not here. Redirect them back to the editor.
  useEffect(() => {
    if (!subLoading && !hasBookMindAccess) router.replace('/make-ebook');
  }, [subLoading, hasBookMindAccess, router]);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookIdParam);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const books = loadBookLibrary(user?.id ?? '');
    setLibraryBooks(books);
    if (!selectedBookId && books.length > 0) {
      const mostRecent = books.reduce((a: any, b: any) => (a.savedAt > b.savedAt ? a : b));
      setSelectedBookId(mostRecent.id);
    }
  }, [selectedBookId]);

  const selectedBook = libraryBooks.find((b: any) => b.id === selectedBookId);

  const {
    messages, isLoading, error,
    sendMessage, quickAction, clearMessages,
    chatSessions, currentSessionId,
    createSession, loadSession, renameSession, deleteSession,
  } = useBookMind({ bookId: selectedBookId || 'default', userId: user?.id });

  const context: BookMindContext = {
    title: selectedBook?.title || 'Untitled',
    author: selectedBook?.author || 'Unknown',
    genre: selectedBook?.genre || '',
    chapterTitle: selectedBook?.chapters?.[0]?.title || '',
    chapterContent: selectedBook?.chapters?.[0]?.content || '',
    allChapters: selectedBook?.chapters || [],
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    if (!currentSessionId) createSession();
    await sendMessage(message, context, 'ask-question');
  };

  const handleQuickAction = async (action: BookMindAction) => {
    if (!currentSessionId) createSession();
    await quickAction(action, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (editingName.trim()) renameSession(sessionId, editingName.trim());
    setEditingSessionId(null);
    setEditingName('');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupedSessions = chatSessions.reduce((groups: Record<string, ChatSession[]>, session) => {
    const key = formatTimestamp(session.updatedAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(session);
    return groups;
  }, {});

  // ── Loading / redirect state: render a minimal shell while subscription
  //    resolves, and while the redirect effect fires for Free users.
  if (subLoading || !hasBookMindAccess) {
    return (
      <div className="relative min-h-screen flex flex-col bg-me-cream text-gray-700">
        <MarketingNav />
        <main id="main-content" className="flex-1 flex flex-col px-6 sm:px-10 py-16">
          <div className="my-auto mx-auto">
            <BookIcon className="w-6 h-6 text-gray-300 animate-pulse" />
          </div>
        </main>
        <MarketingFooter showWordmark={false} />
      </div>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white dark:bg-[#1e1e1e]">
      {/* Mobile overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setShowSidebar(false)} />
      )}

      {/* ── Sidebar ── */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 lg:flex-shrink-0
        border-r border-gray-200 dark:border-[#2f2f2f]
        bg-white dark:bg-[#1e1e1e]
        transition-all duration-200
        ${showSidebar ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
      `}>
        <div className="flex flex-col h-full w-64">

          {/* Top row: back arrow + collapse */}
          <div className="flex items-center justify-between px-3 py-3">
            <Link
              href={selectedBookId ? `/make-ebook?load=${selectedBookId}` : '/make-ebook'}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
              title="Back to editor"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="9" y1="3" x2="9" y2="21" strokeLinecap="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 9l-3 3 3 3" />
              </svg>
            </button>
          </div>

          {/* New Chat */}
          <div className="p-3">
            <button
              onClick={() => createSession()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          </div>

          {/* Book Selector */}
          <div className="px-3 pb-3">
            <div className="relative">
              <select
                value={selectedBookId || ''}
                onChange={(e) => setSelectedBookId(e.target.value || null)}
                className="w-full pl-3 pr-8 py-2 rounded-lg border-0 focus:border-0 focus:ring-0 bg-transparent text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select a book…</option>
                {libraryBooks.map((book: any) => (
                  <option key={book.id} value={book.id}>{book.title || 'Untitled'}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-4">
              {Object.entries(groupedSessions).map(([dateKey, sessions]) => (
                <div key={dateKey}>
                  <div className="px-2 py-1.5 text-3xs font-medium text-gray-600 uppercase tracking-wider">{dateKey}</div>
                  <div className="space-y-0.5">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative rounded-lg transition-colors ${
                          session.id === currentSessionId ? 'bg-gray-100 dark:bg-[#262626]' : 'hover:bg-gray-50 dark:hover:bg-[#2f2f2f]'
                        }`}
                      >
                        {editingSessionId === session.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleRenameSubmit(session.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSubmit(session.id);
                              if (e.key === 'Escape') { setEditingSessionId(null); setEditingName(''); }
                            }}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] rounded-lg text-gray-900 dark:text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => loadSession(session.id)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-gray-200 truncate transition-colors"
                          >
                            {session.name}
                          </button>
                        )}
                        {session.id === currentSessionId && editingSessionId !== session.id && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingSessionId(session.id); setEditingName(session.name); }}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                              title="Rename"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm('Delete this chat?')) deleteSession(session.id); }}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-[#1e1e1e]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1e1e1e]">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <BookIcon className="w-5 h-5 text-gray-400" />
              <div>
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Book Mind</h1>
                {selectedBook && (
                  <p className="text-xs text-gray-500 dark:text-[#888]">
                    {selectedBook.title || 'Untitled'} · {selectedBook.chapters?.length || 0} chapters
                  </p>
                )}
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-gray-400 hover:text-gray-600 dark:text-[#888] dark:hover:text-gray-400 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* ── Input pill — shared JSX rendered in two positions ── */}
        {(() => {
          const inputPill = (
            <div className="flex items-center gap-3 rounded-3xl bg-gray-100 dark:bg-[#262626] px-4 py-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={selectedBook ? `Ask anything about "${selectedBook.title || 'your book'}"…` : 'Select a book to get started…'}
                disabled={isLoading || !selectedBook}
                rows={1}
                className="flex-1 appearance-none bg-transparent border-0 outline-none ring-0 shadow-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#888] focus:outline-none focus:ring-0 focus:shadow-none resize-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                style={{ minHeight: '24px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || !selectedBook}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-[#111] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-[#e5e5e5] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          );

          return (
            <>
              {/* Messages / Empty state */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {messages.length === 0 ? (

                  /* ── Empty state — input centered with content ── */
                  <div className="flex flex-col items-center justify-center h-full px-6 py-16">
                    <div className="mb-6 w-12 h-12 rounded-full bg-gray-100 dark:bg-[#262626] flex items-center justify-center">
                      <BookIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ask about your book</h2>
                    <p className="text-sm text-gray-500 dark:text-[#737373] text-center max-w-sm mb-8">
                      Book Mind has read every word of your manuscript. Ask it anything about your story, characters, or themes.
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-md mb-6">
                      {QUICK_ACTIONS.map((qa) => (
                        <button
                          key={qa.action}
                          onClick={() => handleQuickAction(qa.action)}
                          disabled={isLoading || !selectedBook}
                          className="flex flex-col items-start p-4 rounded-xl bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-[#e5e5e5] mb-1">{qa.label}</span>
                          <span className="text-xs text-gray-500 dark:text-[#888]">{qa.description}</span>
                        </button>
                      ))}
                    </div>
                    {!selectedBook && libraryBooks.length > 0 && (
                      <p className="mb-4 text-sm text-gray-500 dark:text-[#888]">Select a book from the sidebar to get started</p>
                    )}
                    {libraryBooks.length === 0 && (
                      <p className="mb-4 text-sm text-gray-600">
                        No books yet.{' '}
                        <Link href="/make-ebook" className="text-gray-400 hover:text-white underline transition-colors">Create one first</Link>
                      </p>
                    )}
                    {/* Input centered */}
                    <div className="w-full max-w-2xl">{inputPill}</div>
                  </div>

                ) : (

                  /* ── Messages ── */
                  <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}
                      >
                        {message.role === 'user' ? (
                          <div className="max-w-[78%]">
                            <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-gray-900 dark:bg-[#2a2a2a] text-white text-sm leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#262626] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <BookIcon className="w-3.5 h-3.5 text-gray-400 dark:text-[#737373]" />
                            </div>
                            <div className="flex-1 max-w-[85%] space-y-2">
                              <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-[#262626]">
                                {message.content ? (
                                  <div
                                    className="text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed [&>p+p]:mt-3 [&>p>strong]:text-gray-900 dark:[&>p>strong]:text-white [&>p>strong]:font-semibold"
                                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                  />
                                ) : (
                                  <ThinkingDots />
                                )}
                              </div>
                              {message.content && (
                                <button
                                  onClick={() => { navigator.clipboard.writeText(message.content); setCopiedId(message.id); setTimeout(() => setCopiedId(null), 2000); }}
                                  className="text-xs text-gray-400 hover:text-gray-600 dark:text-[#888] dark:hover:text-gray-400 transition-colors px-1"
                                >
                                  {copiedId === message.id ? 'Copied!' : 'Copy'}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#262626] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BookIcon className="w-3.5 h-3.5 text-gray-400 dark:text-[#888] animate-pulse" />
                        </div>
                        <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-[#262626]">
                          <ThinkingDots />
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/60">
                        {error}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input pinned at bottom — only when chatting */}
              {messages.length > 0 && (
                <div className="px-6 pb-6 pt-3 bg-white dark:bg-[#1e1e1e]">
                  <div className="max-w-3xl mx-auto">{inputPill}</div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default function BookMindPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-me-cream dark:bg-[#1e1e1e]">
        <BookIcon className="w-6 h-6 text-gray-300 dark:text-[#888] animate-pulse" />
      </div>
    }>
      <BookMindContent />
    </Suspense>
  );
}
