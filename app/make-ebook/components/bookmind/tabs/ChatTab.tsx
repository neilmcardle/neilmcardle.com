"use client";

// Chat surface inside the inspector panel. Renders a conversational view
// with per-message actions, citation footers, structured analytical
// rendering, history popover, and a reading-view slide-over for long
// responses.

import React, { useState, useRef, useEffect } from "react";
import {
  useBookMind,
  BookMindAction,
  BookMindMessage,
  ChatSession,
} from "../../../hooks/useBookMind";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BookMindIcon as BookIcon,
  ThinkingDots,
  formatBookMindMessage as formatMessage,
  BOOK_MIND_COMPACT_QUICK_ACTIONS as QUICK_ACTIONS,
} from "../../BookMindShared";
import CardRenderer, { tryParseAnalyticalResponse } from "../CardRenderer";
import CitationPill from "../CitationPill";
import MessageActions from "../MessageActions";
import ReadingView from "../ReadingView";
import { addRule } from "../../../utils/bookmindMemory";
import { toast } from "sonner";
import { linkCitations } from "../../../utils/citationLinker";
import { hasUsedTrial, markTrialUsed } from "../../../utils/bookMindTrial";
import type { Chapter } from "../../../types";

interface ChatTabProps {
  bookId?: string;
  userId?: string;
  title?: string;
  author?: string;
  genre?: string;
  chapters: Chapter[];
  selectedChapterIndex: number;
  selectedText?: string;
  onNavigateToChapter?: (chapterIndex: number) => void;
  trialMode?: boolean;
  onUpgrade?: () => void;
  isPro?: boolean;
}

export default function ChatTab({
  bookId,
  userId,
  title,
  author,
  genre,
  chapters,
  selectedChapterIndex,
  selectedText: externalSelectedText,
  onNavigateToChapter,
  trialMode = false,
  onUpgrade,
  isPro = true,
}: ChatTabProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage: _sendMessage,
    quickAction: _quickAction,
    clearMessages,
    createSession,
    currentSessionId,
    stop,
    chatSessions,
    loadSession,
    deleteSession,
  } = useBookMind({ bookId, userId });

  // Trial gate: one trial message per book. Subsequent calls route to
  // the upgrade CTA.
  const [trialExhausted, setTrialExhausted] = useState(() => hasUsedTrial(userId, bookId));
  useEffect(() => {
    setTrialExhausted(hasUsedTrial(userId, bookId));
  }, [userId, bookId]);

  const markTrialDone = () => {
    if (!trialMode) return;
    markTrialUsed(userId, bookId);
    setTrialExhausted(true);
  };

  const sendMessage: typeof _sendMessage = async (...args) => {
    if (trialMode && trialExhausted) { onUpgrade?.(); return null; }
    const result = await _sendMessage(...args);
    markTrialDone();
    return result;
  };

  const quickAction: typeof _quickAction = async (...args) => {
    if (trialMode && trialExhausted) { onUpgrade?.(); return null; }
    const result = await _quickAction(...args);
    markTrialDone();
    return result;
  };

  const [input, setInput] = useState("");
  const [dismissedText, setDismissedText] = useState<string | null>(null);
  const [hasSeenFirstResponse, setHasSeenFirstResponse] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('me_bm_first_response') === '1';
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [readingView, setReadingView] = useState<{ open: boolean; content: string }>({
    open: false,
    content: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSelectedText =
    externalSelectedText && externalSelectedText !== dismissedText
      ? externalSelectedText
      : undefined;

  useEffect(() => {
    if (externalSelectedText) setDismissedText(null);
  }, [externalSelectedText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fires once on the first completed assistant message.
  useEffect(() => {
    if (hasSeenFirstResponse) return;
    const firstAssistant = messages.find(m => m.role === 'assistant' && m.content && m.content.length > 20);
    if (firstAssistant) {
      setHasSeenFirstResponse(true);
      try { localStorage.setItem('me_bm_first_response', '1'); } catch { /* quota */ }
      toast('Book Mind just read your book.', {
        description: 'Ask anything, or try the quick actions.',
      });
    }
  }, [messages, hasSeenFirstResponse]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 260);
  }, []);

  const totalWords = chapters.reduce((sum, ch) => {
    const words = ch.content.split(/\s+/).filter(Boolean).length;
    return sum + words;
  }, 0);

  const ensureSession = () => {
    if (!currentSessionId) createSession();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    ensureSession();
    await sendMessage(msg, {
      selectedChapterIndex,
      selectedText: activeSelectedText,
      action: "ask-question",
    });
  };

  const handleQuickAction = async (action: BookMindAction) => {
    ensureSession();
    await quickAction(action, {
      selectedChapterIndex,
      selectedText: activeSelectedText,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRegenerate = async (assistantMsgId: string) => {
    const idx = messages.findIndex(m => m.id === assistantMsgId);
    if (idx <= 0) return;
    const prior = [...messages].slice(0, idx).reverse();
    const lastUser = prior.find(m => m.role === "user");
    if (!lastUser) return;

    clearMessages();
    await sendMessage(lastUser.content, {
      selectedChapterIndex,
      selectedText: activeSelectedText,
      action: lastUser.action,
    });
  };

  const handleContinue = async (assistantMsgId: string) => {
    const msg = messages.find(m => m.id === assistantMsgId);
    if (!msg) return;
    ensureSession();
    await sendMessage("Continue from where you left off.", {
      selectedChapterIndex,
      selectedText: activeSelectedText,
      action: "ask-question",
    });
  };

  // Slash-command menu in the chat input. Shows when the user types
  // "/" as the first character.
  const showSlashMenu = input.trimStart() === '/' || (input.trimStart().startsWith('/') && input.trimStart().length < 12);
  const SLASH_COMMANDS = [
    { cmd: '/summarize', label: 'Summarize the current chapter', action: 'summarize-chapter' as BookMindAction },
    { cmd: '/themes', label: 'Analyze the major themes in this book', action: 'analyze-themes' as BookMindAction },
    { cmd: '/characters', label: 'List all characters in this book', action: 'list-characters' as BookMindAction },
    { cmd: '/issues', label: 'Find inconsistencies and plot holes', action: 'find-inconsistencies' as BookMindAction },
    { cmd: '/grammar', label: 'Check grammar in this chapter', action: 'check-grammar' as BookMindAction },
    { cmd: '/timeline', label: 'Review the timeline', action: 'timeline-review' as BookMindAction },
  ];
  const slashFilter = input.trimStart().slice(1).toLowerCase();
  const filteredSlash = slashFilter
    ? SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().includes(slashFilter) || c.label.toLowerCase().includes(slashFilter))
    : SLASH_COMMANDS;

  const handleSlashSelect = (cmd: typeof SLASH_COMMANDS[0]) => {
    setInput('');
    ensureSession();
    sendMessage(cmd.label, {
      selectedChapterIndex,
      selectedText: activeSelectedText,
      action: cmd.action,
    });
  };

  const handleNavigate = (chapterIndex: number) => {
    if (chapterIndex < 0) return;
    onNavigateToChapter?.(chapterIndex);
  };

  const handleRemember = (content: string) => {
    if (!bookId || !userId) return;
    const firstSentence = content.match(/^[^.!?]+[.!?]/)?.[0]?.trim() ?? content.slice(0, 80);
    const rule = window.prompt("What should Book Mind remember from this?", firstSentence);
    if (rule?.trim()) {
      addRule(userId, bookId, rule.trim());
      toast.success("Saved to Book Mind memory");
    }
  };

  // History popover data
  const sortedSessions: ChatSession[] = [...chatSessions].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const formatSessionTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    setHistoryOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const Header = (
    <div className="flex items-center justify-end px-2 py-1.5 flex-shrink-0 border-b border-gray-100 dark:border-[#2f2f2f]">
      <div className="flex items-center gap-1">
        {sortedSessions.length > 0 && (
          <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
            <PopoverTrigger asChild>
              <button
                className="size-6 rounded-control flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
                title="Chat history"
                aria-label="Chat history"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={4}
              className="w-64 p-0 max-h-96 overflow-y-auto bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2f2f2f] rounded-card shadow-lg"
            >
              <div className="px-2.5 py-2 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between sticky top-0 bg-white dark:bg-[#1e1e1e]">
                <span className="text-10 font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide">Recent</span>
                <span className="text-10 text-gray-400 dark:text-[#737373]">{sortedSessions.length}</span>
              </div>
              <ul className="py-1">
                {sortedSessions.map((session, idx) => {
                  const isCurrent = session.id === currentSessionId;
                  const preview = session.messages.find(m => m.role === "user")?.content ?? "";
                  return (
                    <li
                      key={session.id}
                      className={`group relative flex items-start gap-1.5 px-2 py-1.5 transition-colors ${
                        isCurrent ? "bg-gray-50 dark:bg-[#262626]" : "hover:bg-gray-50 dark:hover:bg-[#232323]"
                      }`}
                      style={{ animation: `fade-up 300ms cubic-bezier(0.23,1,0.32,1) ${idx * 40}ms both` }}
                    >
                      <button
                        onClick={() => handleLoadSession(session.id)}
                        className="flex-1 min-w-0 text-left pr-6"
                        aria-label={`Load ${session.name}`}
                      >
                        <p className={`text-12 font-medium truncate ${isCurrent ? "text-[#008ff0]" : "text-gray-900 dark:text-white"}`}>
                          {session.name}
                        </p>
                        {preview && (
                          <p className="text-10 text-gray-500 dark:text-[#a3a3a3] truncate mt-0.5">
                            {preview}
                          </p>
                        )}
                        <p className="text-10 text-gray-400 dark:text-[#737373] mt-0.5">
                          {formatSessionTimestamp(session.updatedAt)}
                        </p>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 size-5 rounded-control flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-all"
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>
        )}
        {messages.length > 0 && (
          <button
            onClick={() => { clearMessages(); createSession(); }}
            className="size-6 rounded-control flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="New chat"
            aria-label="New chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-white overflow-hidden">
      {Header}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2.5 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-3 pt-1">
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <BookIcon className="w-6 h-6 text-gray-300 dark:text-[#737373] mx-auto mb-2.5" />
                <p className="text-12 text-gray-500 dark:text-[#a3a3a3]">Open a book to get started.</p>
              </div>
            ) : (
              <>
                {/* Welcome message and quick actions. */}
                <div className="text-center pt-4 pb-2">
                  <h3
                    className="text-125 font-medium text-gray-900 dark:text-white mb-0.5"
                    style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, letterSpacing: '-0.01em' }}
                  >
                    Ask anything about your book.
                  </h3>
                  <p className="text-11 text-gray-500 dark:text-[#a3a3a3] leading-snug max-w-xs mx-auto">
                    Or pick a quick action to get started.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_ACTIONS.slice(0, isPro ? 4 : 2).map(({ action, label, description }, idx) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="group flex items-start gap-1.5 p-2.5 rounded-control border border-gray-200 dark:border-[#2f2f2f] hover:border-gray-300 dark:hover:border-[#3a3a3a] hover:bg-gray-50 dark:hover:bg-[#232323] transition-colors text-left disabled:opacity-50"
                      style={{ animation: `fade-up 350ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms both` }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-12 font-medium text-gray-900 dark:text-white block">{label}</span>
                        <span className="text-10 text-gray-500 dark:text-[#737373] mt-0.5 block">{description}</span>
                      </div>
                      <svg className="w-3 h-3 text-gray-300 dark:text-[#525252] group-hover:text-gray-500 dark:group-hover:text-[#a3a3a3] transition-colors mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>

              </>
            )}
          </div>
        ) : (
          <>
            {messages.map((message: BookMindMessage) => (
              <MessageBubble
                key={message.id}
                message={message}
                chapters={chapters}
                onNavigate={handleNavigate}
                onRegenerate={() => handleRegenerate(message.id)}
                onContinue={() => handleContinue(message.id)}
                onOpenReadingView={() => setReadingView({ open: true, content: message.content })}
                onRemember={handleRemember}
                disabled={isLoading}
                isPro={isPro}
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start" style={{ animation: 'fade-up 300ms cubic-bezier(0.23,1,0.32,1) both' }}>
                <div className="bg-gray-100 dark:bg-[#262626] rounded-card rounded-tl-sm px-3 py-2.5">
                  <ThinkingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="text-11 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-control px-2.5 py-2">
                {error}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>


      {/* Input — replaced with an upgrade CTA when the trial is spent */}
      {trialMode && trialExhausted ? (
        <div className="flex-shrink-0 px-2 pb-2.5 pt-2">
          <div className="rounded-card border border-[#d6dcff] dark:border-[#2a2f45] bg-[#f5f7ff] dark:bg-[#1a1d2e] px-3 py-3 text-center">
            <p className="text-12 font-semibold text-gray-900 dark:text-white mb-1">
              You&apos;ve used your free Book Mind analysis
            </p>
            <p className="text-11 text-gray-600 dark:text-[#a3a3a3] mb-3 leading-relaxed">
              Upgrade to Pro for unlimited chat, insights, issues, and the KDP pre-flight check.
            </p>
            <button
              onClick={onUpgrade}
              className="px-4 py-1.5 text-125 font-semibold bg-action-primary-500 dark:bg-action-primary-dark text-white dark:text-gray-900 rounded-pill hover:bg-action-primary-600 dark:hover:bg-orange-400 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      ) : (
      <div className="flex-shrink-0 mx-2 mb-2 mt-1.5 space-y-1.5">
        {activeSelectedText && (
          <div className="rounded-control bg-gray-50 dark:bg-[#232323] border border-gray-200 dark:border-[#2f2f2f] px-2.5 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-10 font-medium uppercase tracking-wider text-[#008ff0]">
                Discussing selection
              </span>
              <button
                onClick={() => setDismissedText(externalSelectedText ?? null)}
                className="flex items-center gap-0.5 text-10 text-gray-400 hover:text-gray-600 dark:hover:text-[#d4d4d4] transition-colors"
                aria-label="Remove selection context"
              >
                <span>Clear</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-11 text-gray-600 dark:text-[#a3a3a3] italic leading-snug line-clamp-2">
              "{activeSelectedText.length > 120 ? activeSelectedText.slice(0, 120) + "…" : activeSelectedText}"
            </p>
          </div>
        )}
        {showSlashMenu && filteredSlash.length > 0 && (
          <div className="rounded-card bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#2f2f2f] shadow-md overflow-hidden" style={{ animation: 'pop-in 200ms cubic-bezier(0.23,1,0.32,1) both' }}>
            <div className="px-2.5 py-1.5 border-b border-gray-100 dark:border-[#3a3a3a] sticky top-0 bg-white dark:bg-[#252525]">
              <span className="text-10 text-gray-400 dark:text-[#737373] font-medium uppercase tracking-wide">Commands</span>
            </div>
            {filteredSlash.map((cmd, idx) => (
              <button
                key={cmd.cmd}
                onClick={() => handleSlashSelect(cmd)}
                className="w-full flex items-start gap-2 px-2.5 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-[#2f2f2f] transition-colors"
                style={{ animation: `fade-up 250ms cubic-bezier(0.23,1,0.32,1) ${idx * 40}ms both` }}
              >
                <span className="text-11 font-mono text-[#008ff0] whitespace-nowrap flex-shrink-0">{cmd.cmd}</span>
                <span className="text-11 text-gray-600 dark:text-[#a3a3a3] min-w-0">{cmd.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-1.5 rounded-card bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#2f2f2f] px-2.5 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={chapters.length > 0 ? "Ask anything…" : "Open a book first…"}
            disabled={chapters.length === 0}
            rows={1}
            className="flex-1 bg-transparent text-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#888] resize-none max-h-[100px] leading-relaxed disabled:opacity-50 py-0.5"
            style={{ border: 'none', outline: 'none', boxShadow: 'none', appearance: 'none', WebkitAppearance: 'none' }}
          />
          {isLoading ? (
            <button
              onClick={stop}
              className="flex-shrink-0 size-6 rounded-control bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
              aria-label="Stop generating"
              title="Stop generating"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || chapters.length === 0}
              className="flex-shrink-0 size-6 rounded-control bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors disabled:hover:bg-gray-900 dark:disabled:hover:bg-white"
              aria-label="Send message"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      )}

      {/* Reading view slide-over */}
      <ReadingView
        open={readingView.open}
        onOpenChange={(open) => setReadingView(rv => ({ ...rv, open }))}
        content={readingView.content}
        bookTitle={title}
        chapters={chapters.map(c => ({ id: c.id, title: c.title }))}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

// MessageBubble is split out so each message owns its own hover state
// without re-rendering the whole list.

interface MessageBubbleProps {
  message: BookMindMessage;
  chapters: Chapter[];
  onNavigate: (chapterIndex: number) => void;
  onRegenerate: () => void;
  onContinue: () => void;
  onOpenReadingView: () => void;
  onRemember: (content: string) => void;
  disabled: boolean;
  isPro?: boolean;
}

function MessageBubble({
  message,
  chapters,
  onNavigate,
  onRegenerate,
  onContinue,
  onOpenReadingView,
  onRemember,
  disabled,
  isPro = true,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const structured = isAssistant ? tryParseAnalyticalResponse(message.content) : null;
  const citationSegments =
    isAssistant && !structured && message.content
      ? linkCitations(message.content, chapters)
      : [];
  const chapterRefs = citationSegments.filter(s => s.type === "chapter");
  const uniqueRefs = Array.from(
    new Map(
      chapterRefs
        .filter((s): s is Extract<typeof s, { type: "chapter" }> => s.type === "chapter")
        .map(s => [s.chapterIndex, s]),
    ).values(),
  );

  return (
    <div className={`group flex ${isUser ? "justify-end" : "justify-start"}`} style={{ animation: 'fade-up 300ms cubic-bezier(0.23,1,0.32,1) both' }}>
      <div
        className={`max-w-[88%] rounded-card px-3 py-2.5 text-125 leading-relaxed ${
          isUser
            ? "bg-gray-900 dark:bg-[#2a2a2a] text-white rounded-tr-sm"
            : "bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-[#f5f5f5] rounded-tl-sm"
        }`}
      >
        {!message.content ? (
          <ThinkingDots />
        ) : structured ? (
          <CardRenderer
            response={structured}
            chapters={chapters.map(c => ({ id: c.id, title: c.title }))}
            onNavigate={onNavigate}
          />
        ) : (
          <div
            className="[&>p+p]:mt-3 [&>p]:m-0"
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        )}

        {/* Citation footer for conversational assistant messages */}
        {isAssistant && message.content && !structured && uniqueRefs.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-gray-200 dark:border-[#3a3a3a]">
            <p className="text-10 uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium mb-1">
              Sources
            </p>
            <div className="flex flex-wrap gap-0.5">
              {uniqueRefs.map((ref, i) => (
                <CitationPill
                  key={i}
                  label={ref.label}
                  chapterIndex={ref.chapterIndex}
                  chapterId={ref.chapterId}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Per-message actions for assistant bubbles */}
        {isAssistant && message.content && (
          <div className="mt-1.5 -mb-0.5">
            <MessageActions
              content={message.content}
              onRegenerate={onRegenerate}
              onContinue={onContinue}
              onOpenReadingView={isPro ? onOpenReadingView : undefined}
              onRemember={isPro ? onRemember : undefined}
              disabled={disabled}
              isPro={isPro}
            />
          </div>
        )}
      </div>
    </div>
  );
}
