"use client";

import { useState, useCallback, useEffect } from 'react';

export type BookMindAction = 
  | 'summarize-book'
  | 'summarize-chapter'
  | 'list-characters'
  | 'find-inconsistencies'
  | 'analyze-themes'
  | 'check-grammar'
  | 'timeline-review'
  | 'word-frequency'
  | 'ask-question';

export interface BookMindMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  action?: BookMindAction;
  isBlocked?: boolean; // For blocked writing requests
}

export interface BookMindContext {
  title: string;
  author: string;
  genre: string;
  chapterTitle: string;
  chapterContent: string;
  allChapters: { title: string; content: string; type: string }[];
  selectedText?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  bookId: string;
  messages: BookMindMessage[];
  createdAt: number;
  updatedAt: number;
}

interface UseBookMindOptions {
  bookId?: string;
}

// Patterns that suggest user wants AI to write content
const WRITING_REQUEST_PATTERNS = [
  /\b(write|create|generate|compose|draft|author)\b.*\b(chapter|paragraph|scene|dialogue|story|content|text|section|passage)\b/i,
  /\b(continue|expand|extend|add to|flesh out|develop)\b.*\b(this|the|my)\b/i,
  /\bcontinue (writing|the story|from here|this)\b/i,
  /\bwrite (me |the next|a new|more)\b/i,
  /\b(help me write|write this for me|finish this)\b/i,
  /\bgenerate (new |more |creative )?content\b/i,
  /\b(rewrite|rephrase) (this|the|my)\b/i,
  /\bmake (this|it) (better|longer|more)\b/i,
];

// Check if a message is requesting AI to write content
function isWritingRequest(message: string): boolean {
  return WRITING_REQUEST_PATTERNS.some(pattern => pattern.test(message));
}

const BLOCKED_RESPONSE = `I'm here to help you **analyze and understand** your book, not to write it for you. 

As an author, your unique voice is what makes your work special. I can help you:

📖 **Summarize** chapters or the whole book
👥 **Identify** characters and their appearances  
🔍 **Find** inconsistencies in plot or timeline
📊 **Analyze** themes and patterns
🔤 **Check** grammar and spelling

What would you like to explore about your writing?`;

const ACTION_PROMPTS: Record<BookMindAction, string> = {
  'summarize-book': 'Provide a comprehensive summary of the entire book, covering the main plot, key themes, and character arcs.',
  'summarize-chapter': 'Summarize the current chapter, highlighting the main events, character developments, and how it connects to the broader narrative.',
  'list-characters': 'List all characters that appear in the book. For each character, note which chapters they appear in and provide a brief description of their role.',
  'find-inconsistencies': 'Analyze the book for potential inconsistencies in plot, timeline, character behavior, or facts. Flag anything that might confuse readers.',
  'analyze-themes': 'Identify and analyze the main themes present in the book. Provide examples from the text that support each theme.',
  'check-grammar': 'Review the current chapter for grammar, spelling, and punctuation errors. List each issue with its location and the suggested correction.',
  'timeline-review': 'Create a chronological timeline of events in the book. Note any dates, times, or sequences mentioned and flag potential timeline issues.',
  'word-frequency': 'Analyze word and phrase frequency in the book. Identify any overused words, repeated phrases, or stylistic patterns the author might want to vary.',
  'ask-question': ''
};

const CHAT_STORAGE_KEY = 'bookmind_chats';

export function useBookMind(options: UseBookMindOptions = {}) {
  const { bookId } = options;
  
  const [messages, setMessages] = useState<BookMindMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateSessionId = () => `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Load chat sessions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const allSessions: ChatSession[] = JSON.parse(stored);
        // Filter to current book's sessions
        const bookSessions = bookId 
          ? allSessions.filter(s => s.bookId === bookId)
          : allSessions;
        setChatSessions(bookSessions);
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }
  }, [bookId]);

  // Save chat sessions to localStorage
  const saveSessions = useCallback((sessions: ChatSession[]) => {
    if (typeof window === 'undefined') return;
    try {
      // Merge with other books' sessions
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      const allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];
      const otherBookSessions = bookId 
        ? allSessions.filter(s => s.bookId !== bookId)
        : [];
      const merged = [...otherBookSessions, ...sessions];
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(merged));
      setChatSessions(sessions);
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  }, [bookId]);

  // Create new chat session
  const createSession = useCallback((name?: string): string => {
    const id = generateSessionId();
    const session: ChatSession = {
      id,
      name: name || `Chat ${chatSessions.length + 1}`,
      bookId: bookId || 'unknown',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...chatSessions, session];
    saveSessions(updated);
    setCurrentSessionId(id);
    setMessages([]);
    return id;
  }, [chatSessions, bookId, saveSessions]);

  // Load a chat session
  const loadSession = useCallback((sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  }, [chatSessions]);

  // Rename a chat session
  const renameSession = useCallback((sessionId: string, newName: string) => {
    const updated = chatSessions.map(s => 
      s.id === sessionId ? { ...s, name: newName, updatedAt: Date.now() } : s
    );
    saveSessions(updated);
  }, [chatSessions, saveSessions]);

  // Delete a chat session
  const deleteSession = useCallback((sessionId: string) => {
    const updated = chatSessions.filter(s => s.id !== sessionId);
    saveSessions(updated);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [chatSessions, currentSessionId, saveSessions]);

  // Update current session with new messages
  const updateCurrentSession = useCallback((newMessages: BookMindMessage[]) => {
    if (!currentSessionId) return;
    const updated = chatSessions.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: newMessages, updatedAt: Date.now() }
        : s
    );
    saveSessions(updated);
  }, [chatSessions, currentSessionId, saveSessions]);

  const buildSystemPrompt = (context: BookMindContext): string => {
    // Build full book content for context
    const fullBookContent = context.allChapters
      .map((ch, i) => `[${ch.type.toUpperCase()}] ${ch.title || `Chapter ${i + 1}`}\n${ch.content}`)
      .join('\n\n---\n\n');

    return `You are Book Mind, an AI that embodies the author of this book. You have complete knowledge of every word, character, plot point, and theme in the manuscript.

CRITICAL RULES:
1. You are here to ANALYZE and ANSWER QUESTIONS about the book - NOT to write new content
2. If asked to write, generate, create, continue, or expand content, REFUSE politely and redirect to analysis
3. You may point out grammar errors but do NOT rewrite passages
4. Always cite specific chapters/sections when referencing the book
5. Be the author's analytical partner, not their ghostwriter

Book Details:
- Title: ${context.title || 'Untitled'}
- Author: ${context.author || 'Unknown'}  
- Genre: ${context.genre || 'Not specified'}
- Total Chapters: ${context.allChapters.length}

=== FULL BOOK CONTENT ===
${fullBookContent}
=== END OF BOOK ===

Current Chapter Being Edited: ${context.chapterTitle || 'None'}

Remember: You KNOW this book intimately. Answer as if you wrote every word.`;
  };

  const sendMessage = useCallback(async (
    userMessage: string,
    context: BookMindContext,
    action?: BookMindAction
  ): Promise<string | null> => {
    // Check for writing requests first
    if (action === 'ask-question' && isWritingRequest(userMessage)) {
      const userMsgId = generateId();
      const userMsg: BookMindMessage = {
        id: userMsgId,
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
        action,
        isBlocked: true
      };

      const blockedMsg: BookMindMessage = {
        id: generateId(),
        role: 'assistant',
        content: BLOCKED_RESPONSE,
        timestamp: Date.now(),
        isBlocked: true
      };

      const newMessages = [...messages, userMsg, blockedMsg];
      setMessages(newMessages);
      updateCurrentSession(newMessages);
      return BLOCKED_RESPONSE;
    }

    setIsLoading(true);
    setError(null);

    const userMsgId = generateId();
    const userMsg: BookMindMessage = {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      action
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      // Build the prompt based on action
      let prompt = userMessage;
      if (action && action !== 'ask-question' && ACTION_PROMPTS[action]) {
        prompt = ACTION_PROMPTS[action];
        if (action === 'check-grammar' || action === 'summarize-chapter') {
          prompt += `\n\nFocus on this chapter:\n"""${context.chapterContent}"""`;
        }
      }

      const response = await fetch('/api/ai/book-mind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: buildSystemPrompt(context) },
            ...updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt }
          ],
          context: {
            action
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.content || data.message || 'I apologize, I couldn\'t generate a response.';

      const assistantMsg: BookMindMessage = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
        action
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
      setIsLoading(false);
      return assistantContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setIsLoading(false);
      
      const errorMsg: BookMindMessage = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
      
      return null;
    }
  }, [messages, updateCurrentSession]);

  const quickAction = useCallback(async (
    action: BookMindAction,
    context: BookMindContext
  ): Promise<string | null> => {
    const actionLabels: Record<BookMindAction, string> = {
      'summarize-book': 'Summarize the entire book',
      'summarize-chapter': 'Summarize this chapter',
      'list-characters': 'List all characters',
      'find-inconsistencies': 'Find inconsistencies',
      'analyze-themes': 'Analyze themes',
      'check-grammar': 'Check grammar',
      'timeline-review': 'Review timeline',
      'word-frequency': 'Analyze word frequency',
      'ask-question': 'Ask a question'
    };

    return sendMessage(actionLabels[action], context, action);
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    if (currentSessionId) {
      updateCurrentSession([]);
    }
  }, [currentSessionId, updateCurrentSession]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    toggleOpen,
    sendMessage,
    quickAction,
    clearMessages,
    // Chat session management
    chatSessions,
    currentSessionId,
    createSession,
    loadSession,
    renameSession,
    deleteSession,
  };
}
