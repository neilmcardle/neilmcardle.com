"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBookMind, BookMindContext, BookMindAction, ChatSession } from '../hooks/useBookMind';
import { useFeatureAccess } from '@/lib/hooks/useSubscription';
import { useAuth } from '@/lib/hooks/useAuth';
import { loadBookLibrary } from '../utils/bookLibrary';
import { Sparkles } from 'lucide-react';

// Lightbulb icon matching the landing page mockup
const LightbulbIcon = () => (
  <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

// Analysis-only quick actions
const QUICK_ACTIONS: { action: BookMindAction; label: string; description: string }[] = [
  { action: 'summarize-book', label: 'Summarize entire book', description: 'Get a comprehensive overview of the plot and themes' },
  { action: 'list-characters', label: 'List all characters', description: 'Who appears in your story and where' },
  { action: 'find-inconsistencies', label: 'Find inconsistencies', description: 'Identify plot holes and continuity issues' },
  { action: 'analyze-themes', label: 'Analyze themes', description: 'Explore the themes in your writing' },
  { action: 'timeline-review', label: 'Review timeline', description: 'Check the chronology of events' },
  { action: 'word-frequency', label: 'Word usage analysis', description: 'Find overused words and phrases' },
];

function BookMindContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookIdParam = searchParams?.get('book') || null;
  const { user } = useAuth();

  // Check if user has access to Book Mind AI
  const hasBookMindAccess = useFeatureAccess('book_mind_ai');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(bookIdParam);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load library on mount
  useEffect(() => {
    const books = loadBookLibrary(user?.id ?? '');
    setLibraryBooks(books);

    // If no book selected but there are books, select the most recent
    if (!selectedBookId && books.length > 0) {
      const mostRecent = books.reduce((a: any, b: any) => (a.savedAt > b.savedAt ? a : b));
      setSelectedBookId(mostRecent.id);
    }
  }, [selectedBookId]);

  const selectedBook = libraryBooks.find((b: any) => b.id === selectedBookId);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    quickAction,
    clearMessages,
    chatSessions,
    currentSessionId,
    createSession,
    loadSession,
    renameSession,
    deleteSession,
  } = useBookMind({ bookId: selectedBookId || 'default', userId: user?.id });

  // Build context from selected book
  const context: BookMindContext = {
    title: selectedBook?.title || 'Untitled',
    author: selectedBook?.author || 'Unknown',
    genre: selectedBook?.genre || '',
    chapterTitle: selectedBook?.chapters?.[0]?.title || '',
    chapterContent: selectedBook?.chapters?.[0]?.content || '',
    allChapters: selectedBook?.chapters || [],
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');

    if (!currentSessionId) {
      createSession();
    }

    await sendMessage(message, context, 'ask-question');
  };

  const handleQuickAction = async (action: BookMindAction) => {
    if (!currentSessionId) {
      createSession();
    }
    await quickAction(action, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (editingName.trim()) {
      renameSession(sessionId, editingName.trim());
    }
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

  // Group sessions by date
  const groupedSessions = chatSessions.reduce((groups: Record<string, ChatSession[]>, session) => {
    const dateKey = formatTimestamp(session.updatedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(session);
    return groups;
  }, {});

  // Handle upgrade - redirect to Stripe checkout
  const handleUpgrade = async () => {
    setCheckoutLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start checkout');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // Show locked state for free users
  if (!hasBookMindAccess) {
    return (
      <>
        <div className="flex h-screen bg-[#0f1923]">
          <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
            <div className="max-w-2xl text-center space-y-8 py-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#111827] border-2 border-[#1e2836] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  Book Mind AI
                </h1>
                <p className="text-lg text-gray-400">
                  AI-powered analysis and insights for your writing
                </p>
              </div>

              {/* Features List */}
              <div className="grid gap-3 text-left max-w-md mx-auto">
                {[
                  'Summarize your entire book or individual chapters',
                  'List and analyze all characters',
                  'Find plot holes and inconsistencies',
                  'Analyze themes and literary elements',
                  'Review timeline and chronology',
                  'Check word usage and overused phrases'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#111827] rounded-lg border border-[#1e2836]">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#0f1923]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{feature}</p>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA */}
              <div className="pt-6">
                <button
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-full transition-all hover:bg-gray-100 shadow-lg uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Redirecting to checkout...' : 'Upgrade to Pro - $9/month'}
                </button>
                <p className="mt-3 text-sm text-gray-500">
                  Book Mind AI is a Pro feature
                </p>
              </div>

              {/* Back Link */}
              <div className="pt-4">
                <Link
                  href="/make-ebook"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back to make-ebook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f1923]">
      {/* Mobile overlay backdrop */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Overlay on mobile, inline on desktop */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'}
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 lg:flex-shrink-0
        border-r border-[#1e2836]
        bg-[#111827]
        transition-all duration-200
        ${showSidebar ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
      `}>
        <div className="flex flex-col h-full w-64">
          {/* Collapse Sidebar */}
          <div className="p-4 border-b border-[#1e2836]">
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-[#1e2836] rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <img
                src="/dark-close-sidebar-icon.svg"
                alt="Collapse"
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => createSession()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#1e2836] hover:bg-[#1a2230] transition-colors text-sm text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          </div>

          {/* Book Selector */}
          <div className="px-3 pb-3">
            <select
              value={selectedBookId || ''}
              onChange={(e) => setSelectedBookId(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e2836] bg-[#0f1923] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#2a3a4a]"
            >
              <option value="">Select a book...</option>
              {libraryBooks.map((book: any) => (
                <option key={book.id} value={book.id}>
                  {book.title || 'Untitled'}
                </option>
              ))}
            </select>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-4">
              {Object.entries(groupedSessions).map(([dateKey, sessions]) => (
                <div key={dateKey}>
                  <div className="px-2 py-1 text-xs font-medium text-gray-500">
                    {dateKey}
                  </div>
                  <div className="space-y-0.5">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative rounded-lg transition-colors ${
                          session.id === currentSessionId
                            ? 'bg-[#1e2836]'
                            : 'hover:bg-[#1a2230]'
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
                              if (e.key === 'Escape') {
                                setEditingSessionId(null);
                                setEditingName('');
                              }
                            }}
                            className="w-full px-3 py-2 text-sm bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => loadSession(session.id)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 truncate"
                          >
                            {session.name}
                          </button>
                        )}

                        {/* Actions on hover */}
                        {session.id === currentSessionId && editingSessionId !== session.id && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(session.id);
                                setEditingName(session.name);
                              }}
                              className="p-1 rounded hover:bg-[#2a3a4a]"
                              title="Rename"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this chat?')) {
                                  deleteSession(session.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-[#2a3a4a]"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <div className="p-3 border-t border-[#1e2836]">
            <Link href={selectedBookId ? `/make-ebook?load=${selectedBookId}` : '/make-ebook'} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Editor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-[#1e2836] bg-[#0f1923]">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-lg hover:bg-[#1e2836] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">Book Mind</h1>
                {selectedBook && (
                  <p className="text-xs text-gray-400">
                    {selectedBook.title || 'Untitled'} · {selectedBook.chapters?.length || 0} chapters
                  </p>
                )}
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#1e2836] flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-white mb-2">
                Ask about your book
              </h2>
              <p className="text-sm text-gray-400 text-center max-w-md mb-8">
                Book Mind reads your manuscript to answer questions. It won't write for you.
              </p>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.action}
                    onClick={() => handleQuickAction(qa.action)}
                    disabled={isLoading || !selectedBook}
                    className="flex flex-col items-start p-4 rounded-xl border border-[#1e2836] hover:border-[#2a3a4a] hover:bg-[#111827] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-medium text-white mb-1">
                      {qa.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {qa.description}
                    </span>
                  </button>
                ))}
              </div>

              {!selectedBook && libraryBooks.length > 0 && (
                <p className="mt-6 text-sm text-gray-400">
                  Select a book from the sidebar to get started
                </p>
              )}

              {libraryBooks.length === 0 && (
                <p className="mt-6 text-sm text-gray-500">
                  No books in your library.{' '}
                  <Link href="/make-ebook" className="text-white underline">
                    Create one first
                  </Link>
                </p>
              )}
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
                  {message.role === 'user' ? (
                    <div className="max-w-[80%]">
                      <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-gray-600 text-white text-sm">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <>
                      <LightbulbIcon />
                      <div className="flex-1 max-w-[85%] space-y-2">
                        <div className={`bg-[#1e2836] rounded-2xl rounded-tl-none p-4 ${message.isBlocked ? 'opacity-60' : ''}`}>
                          <div
                            className="text-sm text-gray-300 whitespace-pre-wrap [&_strong]:text-gray-200"
                            dangerouslySetInnerHTML={{
                              __html: message.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br />')
                            }}
                          />
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <LightbulbIcon />
                  <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500 bg-[length:200%_100%] animate-shimmer">
                    Thinking...
                  </span>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#1e2836] p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your book..."
                  disabled={isLoading || !selectedBook}
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#1e2836] bg-[#111827] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#2a3a4a] resize-none disabled:opacity-50"
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading || !selectedBook}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
                >
                  <svg className="w-5 h-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-2">
              Book Mind reads your manuscript to answer questions. It won't write for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookMindPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0f1923]">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <BookMindContent />
    </Suspense>
  );
}
