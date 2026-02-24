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
  userId?: string;
}


const ACTION_PROMPTS: Record<BookMindAction, string> = {
  'summarize-book': 'Give me a natural summary of what this book is about—the main story, what themes are running through it, and how the characters develop. Keep it conversational, like you\'re telling a friend about a book you just read.',
  'summarize-chapter': 'Walk me through what happens in this chapter. What are the key moments, how do the characters change or react, and how does it fit into the bigger picture?',
  'list-characters': 'Who are all the people in this book? For each one, tell me where they show up and what their deal is—what role do they play in the story?',
  'find-inconsistencies': 'Look through the book and flag anything that doesn\'t quite add up—plot holes, timeline issues, characters acting out of character, facts that contradict each other. Be specific about what you find.',
  'analyze-themes': 'What are the big ideas running through this book? Point to specific moments that show these themes in action.',
  'check-grammar': 'Go through this chapter and catch any grammar, spelling, or punctuation issues. Tell me where they are and how to fix them.',
  'timeline-review': 'Map out when everything happens in this book. Note any dates or time references, and flag anything that seems off with the chronology.',
  'word-frequency': 'Look at the language patterns in this book. Are there words or phrases that keep coming up? Any habits the author might want to mix up for variety?',
  'ask-question': ''
};

const CHAT_STORAGE_KEY = 'bookmind_chats';

export function useBookMind(options: UseBookMindOptions = {}) {
  const { bookId, userId } = options;
  const chatStorageKey = `${userId ? userId + '_' : ''}${CHAT_STORAGE_KEY}`;
  
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
      const stored = localStorage.getItem(chatStorageKey);
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
      const stored = localStorage.getItem(chatStorageKey);
      const allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];
      const otherBookSessions = bookId 
        ? allSessions.filter(s => s.bookId !== bookId)
        : [];
      const merged = [...otherBookSessions, ...sessions];
      localStorage.setItem(chatStorageKey, JSON.stringify(merged));
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

  // Load a chat session — read from localStorage to avoid stale closure
  const loadSession = useCallback((sessionId: string) => {
    try {
      const stored = localStorage.getItem(chatStorageKey);
      const allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];
      const session = allSessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        setMessages(session.messages);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  }, []);

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

  // Update current session with new messages — read from localStorage to avoid stale closure
  const updateCurrentSession = useCallback((newMessages: BookMindMessage[]) => {
    if (!currentSessionId) return;
    try {
      const stored = localStorage.getItem(chatStorageKey);
      const allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];
      const updated = allSessions.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: newMessages, updatedAt: Date.now() }
          : s
      );
      localStorage.setItem(chatStorageKey, JSON.stringify(updated));
      // Update React state with current book's sessions
      const bookSessions = bookId
        ? updated.filter(s => s.bookId === bookId)
        : updated;
      setChatSessions(bookSessions);
    } catch (e) {
      console.error('Failed to update session:', e);
    }
  }, [currentSessionId, bookId]);

  const buildSystemPrompt = (context: BookMindContext): string => {
    // Build full book content for context
    const fullBookContent = context.allChapters
      .map((ch, i) => `[${ch.type.toUpperCase()}] ${ch.title || `Chapter ${i + 1}`}\n${ch.content}`)
      .join('\n\n---\n\n');

    return `You have full context of this author's manuscript — every chapter, every character, every scene. You're their most useful collaborator because you know their book inside out.

Help with whatever they need: analysis, feedback, summaries, tables, spotting issues, writing suggestions, drafting passages, continuing scenes — anything. You know this book, so make that count.

Be direct and conversational. Talk like a sharp friend who's read the whole thing and has good instincts. No preamble, no filler. Match your response length to what's actually needed — short questions get short answers. Use short paragraphs, not walls of text.

When you reference the book, be specific. Quote the actual text. Name the chapters. The author should feel like you genuinely know their work.

About this book:
- Title: ${context.title || 'Untitled'}
- Author: ${context.author || 'Unknown'}
- Genre: ${context.genre || 'Not specified'}
- ${context.allChapters.length} chapters

${context.chapterTitle ? `Currently open: ${context.chapterTitle}` : ''}
${context.selectedText ? `\nThe author has highlighted this passage and wants to discuss it:\n"""\n${context.selectedText}\n"""` : ''}
=== FULL MANUSCRIPT ===
${fullBookContent}
=== END ===`;
  };

  const sendMessage = useCallback(async (
    userMessage: string,
    context: BookMindContext,
    action?: BookMindAction
  ): Promise<string | null> => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: buildSystemPrompt(context) },
            ...updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt }
          ],
          context: { action }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      // ── Streaming ───────────────────────────────────────────────────────────
      const assistantMsgId = generateId();
      const assistantMsg: BookMindMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        action,
      };

      // Show placeholder bubble immediately; hide "Thinking..." spinner
      setMessages([...updatedMessages, assistantMsg]);
      setIsLoading(false);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break outer;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: fullContent } : m)
              );
            }
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected token') throw e;
          }
        }
      }

      const finalMessages = [...updatedMessages, { ...assistantMsg, content: fullContent }];
      updateCurrentSession(finalMessages);
      return fullContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setIsLoading(false);

      const errorMsg: BookMindMessage = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        timestamp: Date.now(),
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
