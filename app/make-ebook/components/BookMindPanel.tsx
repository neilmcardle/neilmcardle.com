"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import {
  useBookMind,
  BookMindContext,
  BookMindAction,
  BookMindMessage,
  ChatSession,
} from '../hooks/useBookMind';

interface BookMindPanelProps {
  bookId?: string;
  userId?: string;
  title?: string;
  author?: string;
  genre?: string;
  chapters?: { title: string; content: string; type: string }[];
  selectedChapterIndex?: number;
  onClose: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function formatMessage(text: string): string {
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs
    .map((p) => {
      const withBold = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const withBreaks = withBold.replace(/\n/g, '<br />');
      return `<p>${withBreaks}</p>`;
    })
    .join('');
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: { action: BookMindAction; label: string; description: string }[] = [
  { action: 'summarize-book',       label: 'Summarize Book',  description: 'Full overview' },
  { action: 'summarize-chapter',    label: 'This Chapter',    description: 'Chapter summary' },
  { action: 'list-characters',      label: 'Characters',      description: 'Who appears where' },
  { action: 'find-inconsistencies', label: 'Inconsistencies', description: 'Plot holes & gaps' },
  { action: 'analyze-themes',       label: 'Themes',          description: 'Big ideas' },
  { action: 'check-grammar',        label: 'Grammar',         description: 'Errors & fixes' },
  { action: 'timeline-review',      label: 'Timeline',        description: 'Chronology' },
  { action: 'word-frequency',       label: 'Word Use',        description: 'Repeated words' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function BookMindPanel({
  bookId,
  userId,
  title,
  author,
  genre,
  chapters = [],
  selectedChapterIndex = 0,
  onClose,
}: BookMindPanelProps) {
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
  } = useBookMind({ bookId, userId });

  const [input, setInput] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const showQuickActions = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const currentChapter = chapters[selectedChapterIndex] ?? { title: '', content: '', type: 'chapter' };
  const context: BookMindContext = {
    title: title ?? '',
    author: author ?? '',
    genre: genre ?? '',
    chapterTitle: currentChapter.title,
    chapterContent: currentChapter.content,
    allChapters: chapters,
  };

  const ensureSession = () => {
    if (!currentSessionId) createSession();
  };

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {/* silent */}
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (editingName.trim()) renameSession(sessionId, editingName.trim());
    setEditingSessionId(null);
    setEditingName('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white w-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800/60 backdrop-blur-md bg-white/80 dark:bg-[#0a0a0a]/80 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Book Mind</span>
          {title && (
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Chat history */}
          <button
            onClick={() => setShowSessions(v => !v)}
            className={`p-1.5 rounded-lg transition-colors ${
              showSessions
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Chat history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
          {/* New chat */}
          <button
            onClick={() => { createSession(); setShowSessions(false); }}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="New chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {/* Open full page */}
          {bookId && (
            <Link
              href={`/make-ebook/book-mind?bookId=${bookId}`}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Open Book Mind"
              target="_blank"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          {/* Close panel */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat sessions drawer */}
      {showSessions && (
        <div className="border-b border-gray-200 dark:border-gray-800/60 bg-gray-50 dark:bg-[#111] max-h-48 overflow-y-auto flex-shrink-0">
          {chatSessions.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No saved chats yet</p>
          ) : (
            <div className="p-2 space-y-0.5">
              {chatSessions.map((session: ChatSession) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => { loadSession(session.id); setShowSessions(false); }}
                >
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => handleRenameSubmit(session.id)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(session.id)}
                      className="flex-1 text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 outline-none text-gray-900 dark:text-white"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{session.name}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600">{formatTimestamp(session.updatedAt)}</span>
                      <button
                        onClick={e => { e.stopPropagation(); setEditingSessionId(session.id); setEditingName(session.name); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="Rename"
                      >
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteSession(session.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {showQuickActions && (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Book Mind</h4>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-relaxed">
                {chapters.length > 0
                  ? `I have full context of your ${chapters.length}-chapter manuscript.`
                  : 'Open a book to get started.'}
              </p>
            </div>

            {/* Quick actions */}
            {chapters.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map(({ action, label, description }) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="flex flex-col gap-0.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all text-left disabled:opacity-40"
                  >
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{label}</span>
                    <span className="text-[10px] text-gray-500">{description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message list */}
        {messages.map((message: BookMindMessage) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`group relative max-w-[88%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gray-900 dark:bg-gray-700 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-md'
              }`}
            >
              {message.content ? (
                <div
                  className="text-sm leading-relaxed [&>p+p]:mt-3 [&>p]:m-0"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              ) : (
                <ThinkingDots />
              )}

              {/* Copy button */}
              {message.content && (
                <button
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className={`absolute -right-1 -top-1 p-1.5 rounded-full shadow-sm border transition-all ${
                    copiedId === message.id
                      ? 'bg-green-500 border-green-500 text-white opacity-100'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-transparent text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={copiedId === message.id ? 'Copied!' : 'Copy'}
                >
                  {copiedId === message.id ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl rounded-bl-md px-4 py-3">
              <ThinkingDots />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-gray-200 dark:border-gray-800/60">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 focus-within:border-gray-300 dark:focus-within:border-gray-700 px-3 py-2 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chapters.length > 0 ? 'Ask about your book…' : 'Open a book first…'}
            disabled={chapters.length === 0}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none resize-none min-h-[24px] max-h-[120px] leading-6 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || chapters.length === 0}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all mb-0.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors w-full text-center"
          >
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}
