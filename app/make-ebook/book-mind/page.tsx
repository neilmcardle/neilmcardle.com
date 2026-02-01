"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBookMind, BookMindContext, BookMindAction, ChatSession } from '../hooks/useBookMind';

const BOOK_LIBRARY_KEY = "makeebook_library";

function loadBookLibrary() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(BOOK_LIBRARY_KEY);
  return raw ? JSON.parse(raw) : [];
}

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
    const books = loadBookLibrary();
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
  } = useBookMind({ bookId: selectedBookId || 'default' });

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

  return (
    <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Mobile overlay backdrop */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Sidebar - Overlay on mobile, inline on desktop */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'}
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 lg:flex-shrink-0
        border-r border-gray-200 dark:border-[#222] 
        bg-gray-50 dark:bg-[#111] 
        transition-all duration-200 
        ${showSidebar ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'}
      `}>
        <div className="flex flex-col h-full w-64">
          {/* Logo & Back */}
          <div className="p-4 border-b border-gray-200 dark:border-[#222]">
            <Link href="/make-ebook" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Back to Editor</span>
            </Link>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => createSession()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-sm text-gray-700 dark:text-gray-300"
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-500">
                    {dateKey}
                  </div>
                  <div className="space-y-0.5">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative rounded-lg transition-colors ${
                          session.id === currentSessionId
                            ? 'bg-gray-200 dark:bg-[#222]'
                            : 'hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
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
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#444] rounded-lg focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => loadSession(session.id)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 truncate"
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
                              className="p-1 rounded hover:bg-gray-300 dark:hover:bg-[#333]"
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
                              className="p-1 rounded hover:bg-gray-300 dark:hover:bg-[#333]"
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

          {/* Collapse button */}
          <div className="p-3 border-t border-gray-200 dark:border-[#222]">
            <button
              onClick={() => setShowSidebar(false)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span>Collapse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#222] bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <svg className="w-4 h-4 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Book Mind</h1>
                {selectedBook && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {selectedBook.title || 'Untitled'} · {selectedBook.chapters?.length || 0} chapters
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ask about your book
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center max-w-md mb-8">
                Book Mind reads your manuscript to answer questions. It won't write for you.
              </p>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.action}
                    onClick={() => handleQuickAction(qa.action)}
                    disabled={isLoading || !selectedBook}
                    className="flex flex-col items-start p-4 rounded-xl border border-gray-200 dark:border-[#333] hover:border-gray-400 dark:hover:border-[#555] hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {qa.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {qa.description}
                    </span>
                  </button>
                ))}
              </div>

              {!selectedBook && libraryBooks.length > 0 && (
                <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
                  Select a book from the sidebar to get started
                </p>
              )}

              {libraryBooks.length === 0 && (
                <p className="mt-6 text-sm text-gray-500">
                  No books in your library.{' '}
                  <Link href="/make-ebook" className="text-gray-900 dark:text-white underline">
                    Create one first
                  </Link>
                </p>
              )}
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : 'order-0'}`}>
                    {message.role === 'user' ? (
                      <div className="px-4 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm">
                        {message.content}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className={`prose prose-sm dark:prose-invert max-w-none ${message.isBlocked ? 'text-stone-600 dark:text-stone-400' : ''}`}>
                          <div 
                            className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ 
                              __html: message.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br />')
                            }} 
                          />
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-[#222] p-4">
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
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-[#555] resize-none disabled:opacity-50"
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading || !selectedBook}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                >
                  <svg className="w-4 h-4 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2">
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
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <BookMindContent />
    </Suspense>
  );
}
