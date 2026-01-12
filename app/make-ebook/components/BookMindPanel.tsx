"use client";

import React, { useState, useRef, useEffect } from 'react';
import { BookMindMessage, BookMindAction, BookMindContext } from '../hooks/useBookMind';

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
  onApplyTextAction?: (text: string) => void;
}

const QUICK_ACTIONS: { action: BookMindAction; label: string; icon: string; description: string }[] = [
  { action: 'improve-writing', label: 'Improve', icon: '✨', description: 'Polish and enhance' },
  { action: 'fix-grammar', label: 'Fix Grammar', icon: '🔤', description: 'Correct errors' },
  { action: 'expand-paragraph', label: 'Expand', icon: '📝', description: 'Add more detail' },
  { action: 'summarize', label: 'Summarize', icon: '📋', description: 'Get key points' },
  { action: 'continue-writing', label: 'Continue', icon: '➡️', description: 'Keep writing' },
  { action: 'simplify', label: 'Simplify', icon: '🎯', description: 'Make clearer' },
  { action: 'suggest-title', label: 'Titles', icon: '💡', description: 'Chapter names' },
  { action: 'find-sources', label: 'Sources', icon: '📚', description: 'Find references' },
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
  onApplyTextAction
}: BookMindPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
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

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    setShowQuickActions(false);
    await onSendMessageAction(message, context, 'custom');
  };

  const handleQuickAction = async (action: BookMindAction) => {
    setShowQuickActions(false);
    await onQuickActionAction(action, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const extractCodeBlock = (content: string): string | null => {
    // Extract text between triple backticks or quoted blocks
    const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
    if (codeMatch) return codeMatch[1].trim();
    
    const quoteMatch = content.match(/[""]([^""]+)[""]/);
    if (quoteMatch) return quoteMatch[1];
    
    return null;
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Book Mind</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">AI Writing Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
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

        {/* Context indicator */}
        {context.selectedText && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="truncate">Working with selected text ({context.selectedText.length} chars)</span>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Welcome message when empty */}
          {messages.length === 0 && showQuickActions && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {context.selectedText 
                    ? "What would you like to do with the selected text?"
                    : "How can I help with your writing today?"}
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 truncate">{label}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{description}</p>
                    </div>
                  </button>
                ))}
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
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-bl-md'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Action buttons for assistant messages */}
                {message.role === 'assistant' && !message.content.startsWith('⚠️') && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-[#444]">
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                      title="Copy response"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {onApplyTextAction && extractCodeBlock(message.content) && (
                      <button
                        onClick={() => onApplyTextAction(extractCodeBlock(message.content) || '')}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors"
                        title="Apply to editor"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Apply
                      </button>
                    )}
                  </div>
                )}
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
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
                placeholder="Ask Book Mind anything..."
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
            Book Mind uses AI. Always verify important information.
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
      title="Open Book Mind AI"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <span>Book Mind</span>
      {hasContext && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
