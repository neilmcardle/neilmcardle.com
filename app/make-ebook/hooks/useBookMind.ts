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

const BLOCKED_RESPONSE = `I'd love to help, but writing the actual content is your job as the author—that's where the magic happens!

What I'm great at is helping you think through your book. I can:

- Break down what's happening in any chapter
- Spot characters you might have forgotten about
- Find bits that might confuse readers
- Look at your themes and how they're developing
- Check grammar if you want a second pair of eyes

What's on your mind about your book?`;

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

    return `You're a thoughtful reader and thinking partner for the author of this book. You've read every word and you're here to help them work through their ideas, spot issues, and think more deeply about what they've written.

Your job is to help the author reflect on and improve their work—not to write it for them. You can analyze, question, summarize, and point things out. If they ask you to write content for them, kindly redirect them to thinking about it themselves.

Be natural and conversational. Talk like a smart friend who happens to have read their entire manuscript and has a good memory. Don't be stuffy or overly formal. Ask follow-up questions when it would help. Be honest but not harsh—you're on their side.

When you reference the book, be specific. Quote or paraphrase the actual text. Mention chapter names or numbers. The author should feel like you actually know their book.

About this book:
- Title: ${context.title || 'Untitled'}
- Author: ${context.author || 'Unknown'}
- Genre: ${context.genre || 'Not specified'}
- ${context.allChapters.length} chapters total

${context.chapterTitle ? `Currently looking at: ${context.chapterTitle}` : ''}

=== THE FULL MANUSCRIPT ===
${fullBookContent}
=== END ===

Remember: You genuinely know this book. Respond like someone who's read it carefully and is excited to discuss it.`;
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
