"use client";

import { useState, useCallback, useMemo, useReducer, useRef } from "react";
import { track } from "@vercel/analytics";
import { Chapter as BookChapter } from "../types";
import { loadBookById } from "../utils/bookLibrary";
import {
  getMemory,
  formatMemoryForPrompt,
  isBriefFresh,
} from "../utils/bookmindMemory";
import { ensureManuscriptBrief } from "../utils/manuscriptBrief";
import {
  BookMindError,
  bookMindRequest,
  describeBookMindRequest,
  initialBookMindRequest,
} from "../state/bookMindRequest";
import { renderContextForPrompt } from "../utils/contextRetrieval";
import { keys, readLocal, writeLocal } from "../storage/keys";
import {
  ACTION_LABELS,
  ACTION_PROMPTS,
  ANALYTICAL_ACTIONS,
  generateId,
  generateChatId,
} from "./bookMind/actions";
import { useChats } from "./bookMind/useChats";
import { resolveContext } from "./bookMind/resolveContext";
import { readSseData } from "./bookMind/readSse";
import {
  buildInlineEditBody,
  requestInlineEdit,
  type InlineEditArgs,
} from "./bookMind/inlineEdit";
import type {
  BookMindAction,
  BookMindContext,
  BookMindMessage,
  SendMessageOpts,
} from "./bookMind/types";

export type {
  BookMindAction,
  BookMindMessage,
  BookMindContext,
  Chat,
  SendMessageOpts,
  BookMindActivity,
} from "./bookMind/types";

interface UseBookMindOptions {
  bookId?: string;
  userId?: string;
}

export function useBookMind(options: UseBookMindOptions = {}) {
  const { bookId, userId } = options;
  const chatStorage = useMemo(() => keys.bookMindChats(userId), [userId]);

  const [messages, setMessages] = useState<BookMindMessage[]>([]);
  const [request, dispatch] = useReducer(
    bookMindRequest,
    initialBookMindRequest,
  );
  const { isLoading, isStreaming, activity, error, errorCode } =
    describeBookMindRequest(request);
  const [isOpen, setIsOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const {
    chats,
    currentChatId,
    chatIdRef,
    selectChat,
    createChat,
    loadChat,
    renameChat,
    deleteChat,
    saveExchange,
  } = useChats({ bookId, chatStorage, setMessages });

  const sendMessage = useCallback(
    async (
      userMessage: string,
      contextOrOpts?: BookMindContext | SendMessageOpts,
      legacyAction?: BookMindAction,
    ): Promise<string | null> => {
      if (userId && typeof window !== "undefined") {
        const flag = keys.bookMindFirstSent(userId);
        if (!readLocal(flag)) {
          writeLocal(flag, "1");
          track("book_mind_first_message_sent");
        }
      }

      dispatch({ type: "send" });

      let chatId = chatIdRef.current;
      if (!chatId) {
        chatId = generateChatId();
        selectChat(chatId);
      }

      const isLegacy = !!contextOrOpts && "allChapters" in contextOrOpts;
      const legacy = isLegacy ? (contextOrOpts as BookMindContext) : undefined;
      const opts: SendMessageOpts = isLegacy
        ? { action: legacyAction, selectedText: legacy?.selectedText }
        : ((contextOrOpts as SendMessageOpts) ?? {});
      const action = opts.action ?? legacyAction;

      const userMsgId = generateId();
      const userMsg: BookMindMessage = {
        id: userMsgId,
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
        action,
      };
      const cut = opts.replaceFrom
        ? messages.findIndex((m) => m.id === opts.replaceFrom)
        : -1;
      const base = cut >= 0 ? messages.slice(0, cut) : messages;
      const updatedMessages = [...base, userMsg];
      setMessages(updatedMessages);

      try {
        let prompt = userMessage;
        if (action && action !== "ask-question" && ACTION_PROMPTS[action]) {
          prompt = ACTION_PROMPTS[action];
        }

        const deep =
          opts.deep ?? (action ? ANALYTICAL_ACTIONS.includes(action) : false);

        if (deep && bookId && userId) {
          const book = loadBookById(userId, bookId);
          if (book && book.chapters.length > 0 && !isBriefFresh(book)) {
            dispatch({
              type: "read",
              activity: {
                read: ["the whole book"],
                deep: true,
                startedAt: Date.now(),
              },
            });
            await ensureManuscriptBrief({ userId, book }).catch(() => null);
          }
        }

        const {
          ctx,
          tier,
          chapters: bookChapters,
        } = resolveContext({ bookId, userId }, prompt, opts, legacy);
        const labelOf = (c: BookChapter) => {
          const i = bookChapters.findIndex((b) => b.id === c.id);
          return c.title?.trim() || `Chapter ${i + 1}`;
        };
        const read = [
          ...(ctx.currentChapter ? [ctx.currentChapter] : []),
          ...ctx.retrievedChapters.map((r) => r.chapter),
        ].map(labelOf);

        let memoryBlock = "";
        if (bookId && userId) {
          const book = loadBookById(userId, bookId);
          if (book) {
            memoryBlock = formatMemoryForPrompt(getMemory(book));
          }
        }
        const contextBlock = renderContextForPrompt(ctx);

        dispatch({
          type: "read",
          activity: { read, deep, startedAt: Date.now() },
        });

        const recent = base
          .slice(-10)
          .filter((m) => m.content.trim())
          .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          }));
        const firstUser = recent.findIndex((m) => m.role === "user");
        const history = firstUser >= 0 ? recent.slice(firstUser) : [];

        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch("/api/ai/book-mind", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            voice: "chat",
            memory: memoryBlock || undefined,
            context: contextBlock,
            messages: [...history, { role: "user" as const, content: prompt }],
            tier,
            deep,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new BookMindError(
            errorData.error || `Request failed with status ${response.status}`,
            errorData.freeQuestionSpent ? "free_question_spent" : undefined,
          );
        }
        if (!response.body) throw new Error("No response body");

        const assistantMsgId = generateId();
        const assistantMsg: BookMindMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          action,
          meta: { read, deep },
        };
        setMessages([...updatedMessages, assistantMsg]);
        dispatch({ type: "stream" });

        let fullContent = "";
        let messageMeta: BookMindMessage["meta"] | undefined;

        await readSseData(response.body, (data) => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.meta) {
              messageMeta = { ...parsed.meta, read, deep };
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, meta: messageMeta } : m,
                ),
              );
              return;
            }
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: fullContent } : m,
                ),
              );
            }
          } catch (e) {
            if (
              e instanceof Error &&
              e.message !== "Unexpected token" &&
              !e.message.includes("JSON")
            )
              throw e;
          }
        });

        const finalMessages = [
          ...updatedMessages,
          {
            ...assistantMsg,
            content: fullContent,
            meta: messageMeta ?? assistantMsg.meta,
          },
        ];
        dispatch({ type: "done" });
        saveExchange(chatId, finalMessages);
        return fullContent;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          dispatch({ type: "stopped" });
          setMessages((prev) => {
            const kept = prev.filter(
              (m) => m.role !== "assistant" || m.content.trim(),
            );
            saveExchange(chatId, kept);
            return kept;
          });
          return null;
        }

        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        dispatch({
          type: "failed",
          error: errorMessage,
          code: err instanceof BookMindError ? err.code : undefined,
        });

        const errorMsg: BookMindMessage = {
          id: generateId(),
          role: "assistant",
          content: `Something went wrong: ${errorMessage}`,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, errorMsg];
        setMessages(finalMessages);
        saveExchange(chatId, finalMessages);
        return null;
      }
    },
    [messages, saveExchange, selectChat, chatIdRef, bookId, userId],
  );

  const quickAction = useCallback(
    async (
      action: BookMindAction,
      contextOrOpts?: BookMindContext | SendMessageOpts,
    ): Promise<string | null> => {
      return sendMessage(ACTION_LABELS[action], contextOrOpts, action);
    },
    [sendMessage],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    dispatch({ type: "clearError" });
    saveExchange(chatIdRef.current, []);
  }, [saveExchange, chatIdRef]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: "stopped" });
  }, []);

  const inlineEdit = useCallback(
    async (args: InlineEditArgs): Promise<string> => {
      if (!bookId || !userId) {
        const msg =
          "Save the book first — Book Mind needs a saved book to generate from.";
        dispatch({ type: "sideFailed", error: msg });
        throw new Error(msg);
      }
      const body = buildInlineEditBody(userId, bookId, args);

      try {
        return await requestInlineEdit(body);
      } catch (err) {
        dispatch({
          type: "sideFailed",
          error: err instanceof Error ? err.message : "Inline edit failed",
        });
        throw err;
      }
    },
    [bookId, userId],
  );

  return {
    messages,
    isLoading,
    isStreaming,
    activity,
    error,
    errorCode,
    isOpen,
    setIsOpen,
    toggleOpen,
    sendMessage,
    quickAction,
    clearMessages,
    inlineEdit,
    stop,

    chats,
    currentChatId,
    createChat,
    loadChat,
    renameChat,
    deleteChat,
  };
}
