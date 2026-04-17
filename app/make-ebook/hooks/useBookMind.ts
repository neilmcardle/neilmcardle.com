"use client";

// Book Mind hook — speed-first edition.
//
// One source of truth: when a bookId+userId is provided, the hook loads
// the BookRecord from localStorage on every send and reads the brief,
// memory, and chapters from there. No more passing 100K-token manuscripts
// through React props on every keystroke.
//
// Three context tiers, picked per turn:
//   - spotlight : selection + brief         (Cmd-K, ghost text)
//   - scene     : current chapter + brief    (chat about the open chapter)
//   - wide      : retrieved chapters + brief (cross-chapter chat)
//
// Live work is routed to Haiku 4.5. Wide chat with the "deep" flag
// escalates to Sonnet for editorial quality. The user never waits on
// Sonnet for normal chat — that's reserved for background brief and
// analytical-cache generation.

import { useState, useCallback, useEffect, useRef } from 'react';
import { Chapter as BookChapter } from '../types';
import { loadBookById } from '../utils/bookLibrary';
import { getMemory, formatMemoryForPrompt, isBriefFresh } from '../utils/bookmindMemory';
import {
  buildSceneContext,
  buildSpotlightContext,
  buildWideContext,
  pickContextTier,
  renderContextForPrompt,
  RetrievedContext,
  ContextTier,
} from '../utils/contextRetrieval';

// ─── Types ────────────────────────────────────────────────────────────────

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
  // Per-message metadata from the streaming meta line. Used by the chat
  // UI to show tier/model in the transparency strip.
  meta?: {
    tier?: ContextTier;
    deep?: boolean;
    model?: string;
  };
}

// Legacy context shape — kept for backwards compatibility with the old
// BookMindPanel call sites that still build this object themselves.
// The new flow (and any new caller) should pass bookId/userId on the
// hook config and use the simpler sendMessage opts API.
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

export interface SendMessageOpts {
  selectedChapterIndex?: number;
  selectedText?: string;
  action?: BookMindAction;
  // When true, force the wide tier and escalate to Sonnet for editorial
  // quality. Used by the "Deep think" toggle in the chat input.
  deep?: boolean;
}

const ACTION_PROMPTS: Record<BookMindAction, string> = {
  'summarize-book': 'Give me a natural summary of what this book is about: the main story, the themes running through it, and how the characters develop. Keep it conversational and grounded in specific moments.',
  'summarize-chapter': 'Walk me through what happens in the currently open chapter. What are the key moments, how do the characters change or react, and how does it fit into the bigger picture?',
  'list-characters': 'Who are all the people in this book? For each one, tell me where they appear and what role they play in the story. Be specific.',
  'find-inconsistencies': "Look through the book and flag anything that doesn't quite add up: plot holes, timeline issues, characters acting out of character, facts that contradict each other. Be specific about what you find and where.",
  'analyze-themes': 'What are the big ideas running through this book? Point to specific moments that show these themes in action.',
  'check-grammar': 'Go through the currently open chapter and catch any grammar, spelling, or punctuation issues. Tell me where they are and how to fix them.',
  'timeline-review': 'Map out when everything happens in this book. Note any dates or time references, and flag anything that seems off with the chronology.',
  'word-frequency': 'Look at the language patterns in this book. Are there words or phrases that keep coming up? Any habits the author might want to mix up?',
  'ask-question': '',
};

// Analytical actions need a wide view of the manuscript and benefit from
// editorial-quality reasoning. They auto-escalate to deep mode (Sonnet).
const ANALYTICAL_ACTIONS: BookMindAction[] = [
  'summarize-book',
  'list-characters',
  'find-inconsistencies',
  'analyze-themes',
  'timeline-review',
  'word-frequency',
];

// The shared voice + format block — every Book Mind chat call ships with
// this. Inlined here rather than imported so the hook owns its own
// surface contract. Kept terse: literary editor voice, no em dashes, no
// H1/H2/HR/tables, short paragraphs, ground every claim.
const VOICE_BLOCK = `You are Book Mind, the editorial brain inside makeEbook. You have read the author's manuscript and you are their sharpest collaborator: equal parts line editor, developmental editor, and honest first reader. Your judgement is the thing they are paying for. Make it count.

You help with anything: analysis, feedback, summaries, spotting issues, writing suggestions, drafting passages, continuing scenes, character work. Ground every claim in the actual text. Quote specifically, name chapters, refer to real moments. The author should feel like you genuinely know their book.

VOICE
- Direct, confident, literary. No hedging. No corporate softeners ("I'd be happy to", "Great question").
- Talk like a careful editor who has read the whole thing and has strong, specific opinions.
- Match response length to the question. A short question gets a short answer. An analysis request gets substance, but never filler.
- Never break character. Never mention being an AI or a language model.

STRICT FORMATTING RULES
- NEVER use em dashes. Use commas, colons, or full stops instead. This is a brand rule.
- NEVER use H1 or H2 headings (no # or ##). Short bolded labels inline (**Like this:**) or numbered points only.
- NEVER use horizontal rules.
- NEVER use tables unless explicitly asked.
- Short paragraphs, two to four sentences. No walls of text.
- When you quote the manuscript, use standard quotation marks and keep quotes tight (one or two sentences).
- Reference chapters as "Chapter N" (the linker turns these into clickable pills in the UI).
- Stop cleanly at a natural conclusion. Never trail off, never promise more.`;

const CHAT_STORAGE_KEY = 'bookmind_chats';

// Separate voice for inline Cmd-K edits. Deliberately stripped of the
// full editorial personality — the model is a rewriter here, not an
// editor. Every instruction that could produce commentary or advice is
// removed so the response is ONLY the rewritten passage, nothing else.
// This is the fix for the bug where accepted Cmd-K edits would include
// AI advice mixed in with the actual rewrite.
const INLINE_EDIT_VOICE = `You rewrite text. The user has selected a passage in their manuscript and given you an instruction ("make this tighter", "add sensory detail", etc). Return ONLY the rewritten passage.

RULES
- Return the rewritten text and absolutely nothing else. No preamble ("Here's the rewrite:"), no explanation ("I changed X because Y"), no quote marks around the result, no sign-off.
- Match the author's voice, tense, and point of view exactly. Do not shift register.
- Preserve the approximate length of the original unless the instruction explicitly asks to expand or shorten.
- Never use em dashes. Use commas, colons, or full stops.
- The first character of your response is the first character of the rewrite. The last character is the last character of the rewrite.`;

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useBookMind(options: UseBookMindOptions = {}) {
  const { bookId, userId } = options;
  const chatStorageKey = `${userId ? userId + '_' : ''}${CHAT_STORAGE_KEY}`;

  const [messages, setMessages] = useState<BookMindMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // AbortController for cancelling in-flight requests. Stored in a ref
  // so the stop() function can reach the controller that was set when
  // the current request started, not a stale closure.
  const abortRef = useRef<AbortController | null>(null);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const generateSessionId = () => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  // ── Session storage (unchanged contract from previous version) ───────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(chatStorageKey);
      if (stored) {
        const allSessions: ChatSession[] = JSON.parse(stored);
        const bookSessions = bookId
          ? allSessions.filter(s => s.bookId === bookId)
          : allSessions;
        setChatSessions(bookSessions);
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }
  }, [bookId, chatStorageKey]);

  const saveSessions = useCallback((sessions: ChatSession[]) => {
    if (typeof window === 'undefined') return;
    try {
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
  }, [bookId, chatStorageKey]);

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
  }, [chatStorageKey]);

  const renameSession = useCallback((sessionId: string, newName: string) => {
    const updated = chatSessions.map(s =>
      s.id === sessionId ? { ...s, name: newName, updatedAt: Date.now() } : s,
    );
    saveSessions(updated);
  }, [chatSessions, saveSessions]);

  const deleteSession = useCallback((sessionId: string) => {
    const updated = chatSessions.filter(s => s.id !== sessionId);
    saveSessions(updated);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [chatSessions, currentSessionId, saveSessions]);

  const updateCurrentSession = useCallback((newMessages: BookMindMessage[]) => {
    if (!currentSessionId) return;
    try {
      const stored = localStorage.getItem(chatStorageKey);
      const allSessions: ChatSession[] = stored ? JSON.parse(stored) : [];
      const updated = allSessions.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: newMessages, updatedAt: Date.now() }
          : s,
      );
      localStorage.setItem(chatStorageKey, JSON.stringify(updated));
      const bookSessions = bookId
        ? updated.filter(s => s.bookId === bookId)
        : updated;
      setChatSessions(bookSessions);
    } catch (e) {
      console.error('Failed to update session:', e);
    }
  }, [currentSessionId, bookId, chatStorageKey]);

  // ── Context resolution ───────────────────────────────────────────────

  // Build a RetrievedContext for a chat send. Loads the BookRecord fresh
  // so the brief and chapter content are always current. If bookId/userId
  // aren't provided, falls back to a context shape from the legacy
  // BookMindContext (which lacks IDs but has content).
  function resolveContext(
    query: string,
    opts: SendMessageOpts,
    legacy?: BookMindContext,
  ): { ctx: RetrievedContext; tier: 'spotlight' | 'scene' | 'wide'; chapters: BookChapter[] } {
    // Path A: hook is wired to a real book. Read everything from disk.
    if (bookId && userId) {
      const book = loadBookById(userId, bookId);
      if (book) {
        const chapters = book.chapters;
        const currentChapter =
          (opts.selectedChapterIndex !== undefined && chapters[opts.selectedChapterIndex])
            ? chapters[opts.selectedChapterIndex]
            : chapters[0];
        const brief = isBriefFresh(book) ? book.bookmindMemory!.brief! : null;

        // Spotlight is reserved for inline-edit surfaces (Cmd-K, ghost
        // text). Plain chat sends never auto-pick spotlight.
        const tier = opts.action && ANALYTICAL_ACTIONS.includes(opts.action)
          ? 'wide'
          : pickContextTier({ query, currentChapter });

        const ctx = tier === 'wide'
          ? buildWideContext({ brief, chapters, query, selectedText: opts.selectedText })
          : buildSceneContext({
              brief,
              chapters,
              currentChapterId: currentChapter?.id,
              query,
              selectedText: opts.selectedText,
            });

        return { ctx, tier, chapters };
      }
    }

    // Path B: legacy fallback — no bookId/userId or book missing. Build
    // synthetic chapters from the legacy BookMindContext. No retrieval,
    // no brief, no memory; the model gets the current chapter only.
    const legacyChapters: BookChapter[] = (legacy?.allChapters ?? []).map((c, i) => ({
      id: `legacy-${i}`,
      title: c.title,
      content: c.content,
      type: c.type as BookChapter['type'],
    }));
    const currentChapter = legacyChapters.find(c => c.title === legacy?.chapterTitle) ?? legacyChapters[0];
    const ctx = buildSceneContext({
      brief: null,
      chapters: legacyChapters,
      currentChapterId: currentChapter?.id,
      query,
      selectedText: opts.selectedText ?? legacy?.selectedText,
    });
    return { ctx, tier: 'scene', chapters: legacyChapters };
  }

  // ── sendMessage ──────────────────────────────────────────────────────
  //
  // Two call shapes for backwards compatibility during the migration:
  //   sendMessage(text, ctx, action)         ← legacy BookMindPanel
  //   sendMessage(text, opts)                 ← new ChatTab surface
  // The hook detects which by checking for `allChapters` on the second arg.

  const sendMessage = useCallback(async (
    userMessage: string,
    contextOrOpts?: BookMindContext | SendMessageOpts,
    legacyAction?: BookMindAction,
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    // Disambiguate: if the second arg has `allChapters`, it's the legacy
    // BookMindContext. Otherwise it's the new SendMessageOpts.
    const isLegacy = !!contextOrOpts && 'allChapters' in contextOrOpts;
    const legacy = isLegacy ? (contextOrOpts as BookMindContext) : undefined;
    const opts: SendMessageOpts = isLegacy
      ? { action: legacyAction, selectedText: legacy?.selectedText }
      : ((contextOrOpts as SendMessageOpts) ?? {});
    const action = opts.action ?? legacyAction;

    const userMsgId = generateId();
    const userMsg: BookMindMessage = {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      action,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Auto-name the session from the first user message. Truncate to
    // 40 chars so it reads well in the history popover. Only fires once
    // per session (when messages was empty before this send).
    if (messages.length === 0 && currentSessionId) {
      const autoName = userMessage.trim().slice(0, 40) + (userMessage.trim().length > 40 ? '…' : '');
      renameSession(currentSessionId, autoName);
    }

    try {
      // Build the prompt to send. For canned analytical actions, we
      // substitute the curated prompt; the user message text is just a
      // label for the chat history.
      let prompt = userMessage;
      if (action && action !== 'ask-question' && ACTION_PROMPTS[action]) {
        prompt = ACTION_PROMPTS[action];
      }

      // Resolve context (loads brief, picks tier, retrieves chapters)
      const { ctx, tier } = resolveContext(prompt, opts, legacy);

      // Build the three system-prompt sections. The server stitches them.
      // Memory is per-book and read fresh from the BookRecord.
      let memoryBlock = '';
      if (bookId && userId) {
        const book = loadBookById(userId, bookId);
        if (book) {
          memoryBlock = formatMemoryForPrompt(getMemory(book));
        }
      }
      const contextBlock = renderContextForPrompt(ctx);

      // Auto-escalate analytical actions to deep mode (Sonnet)
      const deep = opts.deep ?? (action ? ANALYTICAL_ACTIONS.includes(action) : false);

      // Set up abort controller so the user can stop generation mid-stream.
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch('/api/ai/book-mind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          voice: VOICE_BLOCK,
          memory: memoryBlock || undefined,
          context: contextBlock,
          messages: [
            ...updatedMessages.slice(-10).map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
            { role: 'user' as const, content: prompt },
          ],
          tier,
          deep,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      if (!response.body) throw new Error('No response body');

      // Streaming: consume SSE, accumulate content, capture meta line.
      const assistantMsgId = generateId();
      const assistantMsg: BookMindMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        action,
      };
      setMessages([...updatedMessages, assistantMsg]);
      setIsLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let messageMeta: BookMindMessage['meta'] | undefined;

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
            if (parsed.meta) {
              messageMeta = parsed.meta;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, meta: messageMeta } : m),
              );
              continue;
            }
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: fullContent } : m),
              );
            }
          } catch (e) {
            // Stream protocol errors thrown from inside the try (parsed.error)
            // propagate so the outer catch can surface them. JSON.parse failures
            // on malformed chunks are silent — Anthropic's SSE format is stable
            // enough that real failures arrive as explicit `error` keys.
            if (e instanceof Error && e.message !== 'Unexpected token' && !e.message.includes('JSON')) throw e;
          }
        }
      }

      const finalMessages = [
        ...updatedMessages,
        { ...assistantMsg, content: fullContent, meta: messageMeta },
      ];
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
  }, [messages, updateCurrentSession, bookId, userId]);

  // quickAction is a thin wrapper that converts a canned action into a
  // sendMessage call with the right action label. Kept for backwards
  // compatibility with the existing BookMindPanel.
  const quickAction = useCallback(async (
    action: BookMindAction,
    contextOrOpts?: BookMindContext | SendMessageOpts,
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
      'ask-question': 'Ask a question',
    };
    return sendMessage(actionLabels[action], contextOrOpts, action);
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

  // Stop a running generation. Aborts the fetch, clears the loading
  // state, and keeps whatever content has streamed in so far. The
  // partial response stays in the message list as a truncated answer.
  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // ── Inline edit (Phase B placeholder) ────────────────────────────────
  //
  // Wired here so call sites can import the method now and the Phase B
  // build only needs to flesh out the implementation. Currently delegates
  // to sendMessage with the spotlight tier; a future revision will spawn
  // 3 parallel calls for branching takes and return all of them.

  const inlineEdit = useCallback(async (args: {
    selectedText: string;
    surroundingParagraph?: string;
    instruction: string;
  }): Promise<string | null> => {
    if (!bookId || !userId) {
      setError('Inline edit requires a saved book');
      return null;
    }
    const book = loadBookById(userId, bookId);
    const brief = book && isBriefFresh(book) ? book.bookmindMemory!.brief! : null;
    const ctx = buildSpotlightContext({
      brief,
      selectedText: args.selectedText,
      surroundingParagraph: args.surroundingParagraph,
    });
    const memoryBlock = book ? formatMemoryForPrompt(getMemory(book)) : '';
    const contextBlock = renderContextForPrompt(ctx);

    try {
      const response = await fetch('/api/ai/book-mind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: INLINE_EDIT_VOICE,
          memory: memoryBlock || undefined,
          context: contextBlock,
          messages: [{ role: 'user' as const, content: args.instruction }],
          tier: 'spotlight',
        }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Inline edit failed');
      }
      const reader = response.body.getReader();
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
            if (parsed.content) fullContent += parsed.content;
            if (parsed.error) throw new Error(parsed.error);
          } catch { /* skip */ }
        }
      }
      return fullContent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inline edit failed');
      return null;
    }
  }, [bookId, userId]);

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
    inlineEdit,
    stop,
    // Chat session management
    chatSessions,
    currentSessionId,
    createSession,
    loadSession,
    renameSession,
    deleteSession,
  };
}
