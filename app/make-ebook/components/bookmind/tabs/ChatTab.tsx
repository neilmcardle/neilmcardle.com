"use client";

// ChatTab — the new Book Mind chat surface inside InspectorPanel.
//
// Replaces BookMindPanel.tsx (which still exists during the migration
// but is no longer reachable via LayoutSwitcher once the wiring flip
// lands). Structurally similar to the old panel but with:
//
//   - New useBookMind call shape (opts object, no legacy BookMindContext)
//   - Per-message CitationPill footer (post-stream citation linker)
//   - Structured CardRenderer for analytical responses (falls back to
//     formatBookMindMessage markdown if the content isn't structured)
//   - Per-message MessageActions with Copy / Regenerate / Continue /
//     Open in Reading View
//   - ReadingView slide-over for long content
//   - History popover for session switching (same shape as before)
//   - Transparency strip at the bottom showing context reach
//   - Sonner toasts for apply confirmations

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
import MemoryEditor from "../MemoryEditor";
import { linkCitations } from "../../../utils/citationLinker";
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
  // When Chat wants to jump the editor to a chapter (via a citation
  // pill), it calls this. The parent (EditorRightPanel → page.tsx) is
  // responsible for changing the selected chapter and scrolling the
  // editor to the source.
  onNavigateToChapter?: (chapterIndex: number) => void;
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
}: ChatTabProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    quickAction,
    clearMessages,
    createSession,
    currentSessionId,
    stop,
    chatSessions,
    loadSession,
    deleteSession,
  } = useBookMind({ bookId, userId });

  const [input, setInput] = useState("");
  const [dismissedText, setDismissedText] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [readingView, setReadingView] = useState<{ open: boolean; content: string }>({
    open: false,
    content: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Track the last user message per assistant message, so Regenerate
  // and Continue know which prompt to re-send.
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

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 260);
  }, []);

  // Total word count for the transparency strip at the bottom.
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

  // Regenerate: find the last user message before this assistant
  // message and re-send it with the same opts. Clears the assistant
  // message from state first so the user sees the new stream replace
  // the old one. We re-run by building a new session-like flow.
  const handleRegenerate = async (assistantMsgId: string) => {
    const idx = messages.findIndex(m => m.id === assistantMsgId);
    if (idx <= 0) return;
    const prior = [...messages].slice(0, idx).reverse();
    const lastUser = prior.find(m => m.role === "user");
    if (!lastUser) return;

    // Rebuild messages state up to (but not including) the old
    // assistant turn, then re-send the user message.
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

  // Navigation callback passed to CitationPill inside messages and
  // inside ReadingView. Delegates to the parent which knows how to
  // change selectedChapter and scroll the editor.
  const handleNavigate = (chapterIndex: number) => {
    if (chapterIndex < 0) return;
    onNavigateToChapter?.(chapterIndex);
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

  // ─── Header ────────────────────────────────────────────────────────
  const Header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
      <div className="flex items-center gap-2">
        <BookIcon className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Chat</span>
      </div>
      <div className="flex items-center gap-0.5">
        {sortedSessions.length > 0 && (
          <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
                title="Chat history"
                aria-label="Chat history"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={6}
              className="w-72 p-0 max-h-96 overflow-y-auto bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2f2f2f]"
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide">Recent chats</span>
                <span className="text-2xs text-gray-400 dark:text-[#737373]">{sortedSessions.length}</span>
              </div>
              <ul className="py-1">
                {sortedSessions.map(session => {
                  const isCurrent = session.id === currentSessionId;
                  const preview = session.messages.find(m => m.role === "user")?.content ?? "";
                  return (
                    <li
                      key={session.id}
                      className={`group relative flex items-start gap-2 px-3 py-2 transition-colors ${
                        isCurrent ? "bg-gray-100 dark:bg-[#262626]" : "hover:bg-gray-50 dark:hover:bg-[#232323]"
                      }`}
                    >
                      <button
                        onClick={() => handleLoadSession(session.id)}
                        className="flex-1 min-w-0 text-left pr-7"
                        aria-label={`Load ${session.name}`}
                      >
                        <p className={`text-sm font-medium truncate ${isCurrent ? "text-[#4070ff]" : "text-gray-900 dark:text-white"}`}>
                          {session.name}
                        </p>
                        {preview && (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] truncate mt-0.5">
                            {preview}
                          </p>
                        )}
                        <p className="text-2xs text-gray-400 dark:text-[#737373] mt-0.5">
                          {formatSessionTimestamp(session.updatedAt)}
                        </p>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-all"
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            title="New chat"
            aria-label="New chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      {Header}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-3 pt-2">
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Open a book to get started.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 dark:text-[#737373] text-center pb-1">
                  {chapters.length} chapters · ask anything
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_ACTIONS.map(({ action, label, description }) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="flex flex-col gap-0.5 p-3 rounded-xl bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors text-left disabled:opacity-50"
                    >
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{label}</span>
                      <span className="text-2xs text-gray-500 dark:text-[#737373]">{description}</span>
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
                disabled={isLoading}
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-[#262626] rounded-2xl rounded-bl-sm px-4 py-3">
                  <ThinkingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Context transparency strip */}
      {chapters.length > 0 && (
        <div className="flex-shrink-0 px-4 py-1.5 border-t border-gray-100 dark:border-[#262626]">
          <p className="text-2xs text-gray-400 dark:text-[#737373] leading-tight">
            Reading all {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
            {totalWords > 0 ? ` · ${totalWords.toLocaleString()} words` : ""}
          </p>
        </div>
      )}

      {/* Book Mind memory — collapsible panel showing persistent
          per-book rules, characters, and decisions. Anything stored
          here is injected into every Book Mind call. */}
      <MemoryEditor bookId={bookId} userId={userId} />

      {/* Input */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2">
        {activeSelectedText && (
          <div className="px-1 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs font-medium uppercase tracking-wider text-[#4070ff] dark:text-[#4070ff]">
                Discussing your selection
              </span>
              <button
                onClick={() => setDismissedText(externalSelectedText ?? null)}
                className="flex items-center gap-1 text-2xs text-gray-400 hover:text-gray-600 dark:hover:text-[#d4d4d4] transition-colors"
                aria-label="Remove selection context"
              >
                <span>Clear</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] italic leading-relaxed line-clamp-2">
              &quot;{activeSelectedText.length > 120 ? activeSelectedText.slice(0, 120) + "…" : activeSelectedText}&quot;
            </p>
            <p className="text-2xs text-gray-400 dark:text-[#737373] mt-1">
              Your next message will be about this passage.
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-3xl bg-gray-100 dark:bg-[#262626] px-4 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={chapters.length > 0 ? "Ask about your book…" : "Open a book first…"}
            disabled={chapters.length === 0}
            rows={1}
            className="flex-1 appearance-none bg-transparent border-0 outline-none ring-0 shadow-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#888] focus:outline-none focus:ring-0 focus:shadow-none resize-none max-h-[120px] leading-relaxed disabled:opacity-50"
          />
          {isLoading ? (
            <button
              onClick={stop}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
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
              className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-700 dark:hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

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

// ─── MessageBubble ────────────────────────────────────────────────────
// Split out so each message owns its own hover state for MessageActions
// without re-rendering the whole message list on hover.

interface MessageBubbleProps {
  message: BookMindMessage;
  chapters: Chapter[];
  onNavigate: (chapterIndex: number) => void;
  onRegenerate: () => void;
  onContinue: () => void;
  onOpenReadingView: () => void;
  disabled: boolean;
}

function MessageBubble({
  message,
  chapters,
  onNavigate,
  onRegenerate,
  onContinue,
  onOpenReadingView,
  disabled,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  // For assistant messages, try to parse as structured. If that works,
  // render via CardRenderer. Otherwise render via the existing markdown
  // helper and append a citation footer.
  const structured = isAssistant ? tryParseAnalyticalResponse(message.content) : null;
  const citationSegments =
    isAssistant && !structured && message.content
      ? linkCitations(message.content, chapters)
      : [];
  const chapterRefs = citationSegments.filter(s => s.type === "chapter");
  // Dedupe by chapterIndex so the footer shows each chapter only once.
  const uniqueRefs = Array.from(
    new Map(
      chapterRefs
        .filter((s): s is Extract<typeof s, { type: "chapter" }> => s.type === "chapter")
        .map(s => [s.chapterIndex, s]),
    ).values(),
  );

  return (
    <div className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gray-900 dark:bg-[#2a2a2a] text-white rounded-br-sm"
            : "bg-gray-100 dark:bg-[#262626] text-gray-800 dark:text-[#f5f5f5] rounded-bl-sm"
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
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-[#3a3a3a]">
            <p className="text-2xs uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium mb-1.5">
              Sources
            </p>
            <div className="flex flex-wrap gap-1">
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
          <div className="mt-2 -mb-1">
            <MessageActions
              content={message.content}
              onRegenerate={onRegenerate}
              onContinue={onContinue}
              onOpenReadingView={onOpenReadingView}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
