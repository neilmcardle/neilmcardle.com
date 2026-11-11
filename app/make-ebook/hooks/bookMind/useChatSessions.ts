"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  addSession,
  recordExchange,
  removeSession,
} from "../../state/chatSessions";
import { readLocal, writeLocal, type StorageKey } from "../../storage/keys";
import { generateSessionId } from "./actions";
import type { BookMindMessage, ChatSession } from "./types";

interface UseChatSessionsOptions {
  bookId?: string;
  chatStorage: StorageKey;
  setMessages: (messages: BookMindMessage[]) => void;
}

export function useChatSessions({
  bookId,
  chatStorage,
  setMessages,
}: UseChatSessionsOptions) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = readLocal(chatStorage);
      if (stored) {
        const allSessions: ChatSession[] = JSON.parse(stored);
        const bookSessions = bookId
          ? allSessions.filter((s) => s.bookId === bookId)
          : allSessions;
        setChatSessions(bookSessions);
      }
    } catch (e) {
      console.error("Failed to load chat sessions:", e);
    }
  }, [bookId, chatStorage]);

  const sessionIdRef = useRef<string | null>(null);
  const selectSession = useCallback((id: string | null) => {
    sessionIdRef.current = id;
    setCurrentSessionId(id);
  }, []);

  const readAllSessions = useCallback((): ChatSession[] => {
    try {
      const stored = readLocal(chatStorage);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to read chat sessions:", e);
      return [];
    }
  }, [chatStorage]);

  const writeAllSessions = useCallback(
    (all: ChatSession[]) => {
      if (!writeLocal(chatStorage, JSON.stringify(all))) {
        console.error("Failed to save chat sessions");
      }
      setChatSessions(bookId ? all.filter((s) => s.bookId === bookId) : all);
    },
    [bookId, chatStorage],
  );

  const createSession = useCallback(
    (name?: string): string => {
      const id = generateSessionId();
      const all = readAllSessions();
      const owner = bookId || "unknown";
      const session: ChatSession = {
        id,
        name:
          name || `Chat ${all.filter((s) => s.bookId === owner).length + 1}`,
        bookId: owner,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      writeAllSessions(addSession(all, session));
      selectSession(id);
      setMessages([]);
      return id;
    },
    [bookId, readAllSessions, writeAllSessions, selectSession, setMessages],
  );

  const loadSession = useCallback(
    (sessionId: string) => {
      const session = readAllSessions().find((s) => s.id === sessionId);
      if (session) {
        selectSession(sessionId);
        setMessages(session.messages);
      }
    },
    [readAllSessions, selectSession, setMessages],
  );

  const renameSession = useCallback(
    (sessionId: string, newName: string) => {
      writeAllSessions(
        readAllSessions().map((s) =>
          s.id === sessionId
            ? { ...s, name: newName, updatedAt: Date.now() }
            : s,
        ),
      );
    },
    [readAllSessions, writeAllSessions],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      writeAllSessions(removeSession(readAllSessions(), sessionId));
      if (sessionIdRef.current === sessionId) {
        selectSession(null);
        setMessages([]);
      }
    },
    [readAllSessions, writeAllSessions, selectSession, setMessages],
  );

  const saveExchange = useCallback(
    (sessionId: string | null, newMessages: BookMindMessage[]) => {
      if (!sessionId) return;
      writeAllSessions(
        recordExchange(readAllSessions(), {
          sessionId,
          bookId: bookId || "unknown",
          messages: newMessages,
          now: Date.now(),
        }),
      );
    },
    [bookId, readAllSessions, writeAllSessions],
  );

  return {
    chatSessions,
    currentSessionId,
    sessionIdRef,
    selectSession,
    createSession,
    loadSession,
    renameSession,
    deleteSession,
    saveExchange,
  };
}
