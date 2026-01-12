"use client";

import React, { useState, useRef, useEffect } from 'react';
import { BookMindMessage, BookMindAction, BookMindContext, ChatSession } from '../hooks/useBookMind';

interface BookMindPanelProps {
  isOpen: boolean;
  onCloseAction: () => void;
  messages: BookMindMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessageAction: (message: string, context: BookMindContext, action?: BookMindAction) => Promise<string | null>;
  onQuickActionAction: (action: BookMindAction, context: BookMindContext) => Promise<string | null>;
  onClearMessagesAction: () => void;
  context: BookMindContext;
  // Chat session management
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onCreateSessionAction: (name?: string) => string;
  onLoadSessionAction: (sessionId: string) => void;
  onRenameSessionAction: (sessionId: string, newName: string) => void;
  onDeleteSessionAction: (sessionId: string) => void;
}

// Analysis-only quick actions - NO writing/ghostwriting features
const QUICK_ACTIONS: { action: BookMindAction; label: string; icon: string; description: string }[] = [
  { action: 'summarize-book', label: 'Summarize Book', icon: '📖', description: 'Full book overview' },
  { action: 'summarize-chapter', label: 'This Chapter', icon: '📄', description: 'Chapter summary' },
  { action: 'list-characters', label: 'Characters', icon: '👥', description: 'Who appears where' },
  { action: 'find-inconsistencies', label: 'Inconsistencies', icon: '🔍', description: 'Find plot holes' },
  { action: 'analyze-themes', label: 'Themes', icon: '📊', description: 'Theme analysis' },
  { action: 'check-grammar', label: 'Grammar', icon: '🔤', description: 'Check for errors' },
  { action: 'timeline-review', label: 'Timeline', icon: '📅', description: 'Event chronology' },
  { action: 'word-frequency', label: 'Word Use', icon: '📈', description: 'Overused words' },
];

export function BookMindPanel({
  isOpen,
  onCloseAction,
  messages,
  isLoading,
  error,
  onSendMessageAction,
  onQuickActionAction,
  onClearMessagesAction,
  context,
  chatSessions,
  currentSessionId,
  onCreateSessionAction,
  onLoadSessionAction,
  onRenameSessionAction,
  onDeleteSessionAction,
}: BookMindPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showSessions, setShowSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Show quick actions when starting fresh
  useEffect(() => {
    setShowQuickActions(messages.length === 0);
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    setShowQuickActions(false);
    
    // Auto-create session if none exists
    if (!currentSessionId) {
      onCreateSessionAction();
    }
    
    await onSendMessageAction(message, context, 'ask-question');
  };

  const handleQuickAction = async (action: BookMindAction) => {
    setShowQuickActions(false);
    
    // Auto-create session if none exists
    if (!currentSessionId) {
      onCreateSessionAction();
    }
    
    await onQuickActionAction(action, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (editingName.trim()) {
      onRenameSessionAction(sessionId, editingName.trim());
    }
    setEditingSessionId(null);
    setEditingName('');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] lg:relative lg:inset-auto">
      {/* Backdrop for mobile */}
      <div 
        className="absolute inset-0 bg-black/40 lg:hidden"
        onClick={onCloseAction}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#1a1a1a] shadow-2xl flex flex-col lg:relative lg:max-w-none lg:shadow-none lg:border-l lg:border-gray-200 lg:dark:border-[#333]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#333] bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Book Mind</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Ask questions about your book</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Chat history toggle */}
            <button
              onClick={() => setShowSessions(!showSessions)}
              className={`p-1.5 rounded-lg transition-colors ${
                showSessions 
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' 
                  : 'hover:bg-gray-200 dark:hover:bg-[#333] text-gray-500'
              }`}
              title="Chat history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            {/* New chat */}
            <button
              onClick={() => {
                onCreateSessionAction();
                setShowSessions(false);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
              title="New chat"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {messages.length > 0 && (
              <button
                onClick={onClearMessagesAction}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                title="Clear conversation"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onCloseAction}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Sessions Sidebar */}
        {showSessions && (
          <div className="border-b border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#151515] max-h-48 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No saved chats</p>
            ) : (
              <div className="p-2 space-y-1">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.id
                        ? 'bg-violet-100 dark:bg-violet-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-[#252525]'
                    }`}
                    onClick={() => {
                      onLoadSessionAction(session.id);
                      setShowSessions(false);
                    }}
                  >
                    {editingSessionId === session.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(session.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(session.id)}
                        className="flex-1 text-xs bg-white dark:bg-[#2a2a2a] px-2 py-1 rounded border border-violet-300 dark:border-violet-700 outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                          {session.name}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatTimestamp(session.updatedAt)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(session.id);
                            setEditingName(session.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded"
                          title="Rename"
                        >
                          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSessionAction(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          title="Delete"
                        >
                          <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {/* Book context indicator */}
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="truncate">
              <strong>{context.title || 'Untitled'}</strong> • {context.allChapters?.length || 0} chapters loaded
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Welcome message when empty */}
          {messages.length === 0 && showQuickActions && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Ask About Your Book</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  I know every word of your manuscript. Ask me about characters, plot, themes, or inconsistencies.
                </p>
              </div>

              {/* Quick actions grid */}
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(({ action, label, icon, description }) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-[#333] hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all text-left group disabled:opacity-50"
                  >
                    <span className="text-lg">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 truncate">{label}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* What I can't do */}
              <div className="mt-4 p-3 rounded-lg bg-stone-100 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-700/50">
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mb-1">✍️ Note: I analyze, not write</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">
                  I'm here to help you understand your own work, not to write it for you. Your voice is what makes your book unique!
                </p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group max-w-[85%] rounded-2xl px-4 py-2.5 relative ${
                  message.role === 'user'
                    ? message.isBlocked 
                      ? 'bg-stone-200 dark:bg-stone-700/50 text-stone-800 dark:text-stone-200 rounded-br-md'
                      : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-br-md'
                    : message.isBlocked
                      ? 'bg-stone-100 dark:bg-stone-800/30 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700/50 rounded-bl-md'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-bl-md'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Copy button - shows on hover */}
                <button
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className={`absolute -right-1 -top-1 p-1.5 rounded-full shadow-sm transition-all ${
                    copiedMessageId === message.id
                      ? 'bg-green-500 text-white opacity-100'
                      : 'bg-white dark:bg-[#333] text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-[#444]'
                  }`}
                  title={copiedMessageId === message.id ? 'Copied!' : 'Copy message'}
                >
                  {copiedMessageId === message.id ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-[#2a2a2a] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Reading your book...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-[#333] p-3 bg-gray-50 dark:bg-[#1f1f1f]">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your book..."
                rows={1}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                style={{ minHeight: '42px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
            Book Mind reads your manuscript to answer questions. It won't write for you.
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact trigger button for the editor
export function BookMindTrigger({ 
  onClickAction, 
  hasContext = false,
  className = '' 
}: { 
  onClickAction: () => void; 
  hasContext?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClickAction}
      className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-700 shadow-sm hover:shadow-md transition-all ${className}`}
      title="Ask questions about your book"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Book Mind</span>
      {hasContext && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
