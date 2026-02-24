"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookMind, BookMindContext, BookMindAction, ChatSession } from '../hooks/useBookMind';
import { useFeatureAccess, useSubscription } from '@/lib/hooks/useSubscription';
import { useAuth } from '@/lib/hooks/useAuth';
import { loadBookLibrary } from '../utils/bookLibrary';
// Book icon inline — used in place of Sparkles for brand consistency
function BookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

const QUICK_ACTIONS: { action: BookMindAction; label: string; description: string }[] = [
  { action: 'summarize-book',       label: 'Summarize book',        description: 'Plot, themes & arc' },
  { action: 'list-characters',      label: 'List characters',       description: 'Who appears and where' },
  { action: 'find-inconsistencies', label: 'Find inconsistencies',  description: 'Plot holes & continuity' },
  { action: 'analyze-themes',       label: 'Analyze themes',        description: 'Ideas in your writing' },
  { action: 'timeline-review',      label: 'Review timeline',       description: 'Chronology check' },
  { action: 'word-frequency',       label: 'Word usage',            description: 'Overused words & phrases' },
];

/** Convert plain text with markdown-ish formatting into HTML paragraphs */
function formatMessage(content: string): string {
  if (!content) return '';
  return content
    .split(/\n\n+/)
    .map(para =>
      `<p>${para
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />')
      }</p>`
    )
    .join('');
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}

function BookMindContent() {
  const searchParams = useSearchParams();
  const bookIdParam = searchParams?.get('book') || null;
  const { user } = useAuth();

  const hasBookMindAccess = useFeatureAccess('book_mind_ai');
  const { isLoading: subLoading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', credentials: 'include' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const { url } = await res.json();
      if (url) window.location.href = url;
      else throw new Error('No checkout URL');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // ── Loading state (prevents flash of wrong UI while subscription fetches) ──
  if (subLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <BookIcon className="w-6 h-6 text-gray-700 animate-pulse" />
      </div>
    );
  }

  // ── Locked state ────────────────────────────────────────────────────────────
  if (!hasBookMindAccess) {
    return (
      <div className="flex h-screen bg-[#0a0a0a]">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(75,85,99,0.4)_0%,_transparent_70%)] scale-150" />
                <div className="relative w-20 h-20 rounded-2xl bg-gray-900/50 border border-white/8 flex items-center justify-center">
                  <BookIcon className="w-9 h-9 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-3">Book Mind AI</h1>
              <p className="text-gray-400">AI-powered analysis and insights for your manuscript.</p>
            </div>

            <div className="grid gap-2 text-left">
              {[
                'Summarize your entire book or individual chapters',
                'List and analyze all characters',
                'Find plot holes and inconsistencies',
                'Analyze themes and literary elements',
                'Review timeline and chronology',
                'Spot overused words and phrases',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-300">{feature}</p>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? 'Redirecting…' : 'Upgrade to Pro — $9/month'}
              </button>
              <p className="mt-3 text-xs text-gray-600">Book Mind AI is a Pro feature</p>
            </div>

            <Link href="/make-ebook" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors">
              ← Back to editor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Mobile overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setShowSidebar(false)} />
      )}

      {/* ── Sidebar ── */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 lg:flex-shrink-0
        border-r border-white/8
        bg-[#0a0a0a]
        transition-all duration-200
        ${showSidebar ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
      `}>
        <div className="flex flex-col h-full w-64">

          {/* Collapse button */}
          <div className="p-4 border-b border-white/8">
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-500 hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
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
                className="w-full pl-3 pr-8 py-2 rounded-lg border-0 focus:border-0 focus:ring-0 bg-transparent text-sm text-gray-500 hover:text-gray-300 focus:outline-none hover:bg-white/5 transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select a book…</option>
                {libraryBooks.map((book: any) => (
                  <option key={book.id} value={book.id}>{book.title || 'Untitled'}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-4">
              {Object.entries(groupedSessions).map(([dateKey, sessions]) => (
                <div key={dateKey}>
                  <div className="px-2 py-1.5 text-[11px] font-medium text-gray-600 uppercase tracking-wider">{dateKey}</div>
                  <div className="space-y-0.5">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative rounded-lg transition-colors ${
                          session.id === currentSessionId ? 'bg-white/[0.06]' : 'hover:bg-white/5'
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
                            className="w-full px-3 py-2 text-sm bg-[#111] border border-white/15 rounded-lg text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => loadSession(session.id)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-200 truncate transition-colors"
                          >
                            {session.name}
                          </button>
                        )}
                        {session.id === currentSessionId && editingSessionId !== session.id && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingSessionId(session.id); setEditingName(session.name); }}
                              className="p-1 rounded hover:bg-white/10"
                              title="Rename"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm('Delete this chat?')) deleteSession(session.id); }}
                              className="p-1 rounded hover:bg-white/10"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

          {/* Back to Editor */}
          <div className="p-3 border-t border-white/8">
            <Link
              href={selectedBookId ? `/make-ebook?load=${selectedBookId}` : '/make-ebook'}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to editor
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-gray-900">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/8 bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <BookIcon className="w-5 h-5 text-gray-400" />
              <div>
                <h1 className="text-sm font-semibold text-white">Book Mind</h1>
                {selectedBook && (
                  <p className="text-xs text-gray-600">
                    {selectedBook.title || 'Untitled'} · {selectedBook.chapters?.length || 0} chapters
                  </p>
                )}
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (

            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center h-full px-6 py-16">
              <div className="mb-6 w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                <BookIcon className="w-6 h-6 text-gray-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Ask about your book</h2>
              <p className="text-sm text-gray-500 text-center max-w-sm mb-10">
                Book Mind has read every word of your manuscript. Ask it anything about your story, characters, or themes.
              </p>

              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.action}
                    onClick={() => handleQuickAction(qa.action)}
                    disabled={isLoading || !selectedBook}
                    className="group flex flex-col items-start p-4 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 hover:bg-white/[0.07] transition-all text-left disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-medium text-gray-200 mb-1 group-hover:text-white transition-colors">{qa.label}</span>
                    <span className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">{qa.description}</span>
                  </button>
                ))}
              </div>

              {!selectedBook && libraryBooks.length > 0 && (
                <p className="mt-8 text-sm text-gray-600">Select a book from the sidebar to get started</p>
              )}
              {libraryBooks.length === 0 && (
                <p className="mt-8 text-sm text-gray-600">
                  No books yet.{' '}
                  <Link href="/make-ebook" className="text-gray-400 hover:text-white underline transition-colors">Create one first</Link>
                </p>
              )}
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
                      <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-[#2a2a2a] text-white text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 max-w-[85%] space-y-2">
                        <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-[#111]">
                          {message.content ? (
                            <div
                              className="text-sm text-gray-300 leading-relaxed [&>p+p]:mt-3 [&>p>strong]:text-white [&>p>strong]:font-semibold"
                              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                            />
                          ) : (
                            <ThinkingDots />
                          )}
                        </div>
                        {message.content && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              setCopiedId(message.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="text-xs text-gray-700 hover:text-gray-400 transition-colors px-1"
                          >
                            {copiedId === message.id ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Thinking indicator (only before placeholder appears) */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookIcon className="w-3.5 h-3.5 text-gray-600 animate-pulse" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-[#111]">
                    <ThinkingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-400 bg-red-950/40 px-4 py-3 rounded-xl border border-red-900/60">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="p-4 pb-6 bg-gradient-to-t from-[#0a0a0a] to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-2.5">
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
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none resize-none disabled:opacity-40 disabled:cursor-not-allowed leading-relaxed self-center"
                style={{ minHeight: '28px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || !selectedBook}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookMindPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <BookIcon className="w-6 h-6 text-gray-700 animate-pulse" />
      </div>
    }>
      <BookMindContent />
    </Suspense>
  );
}
