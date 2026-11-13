"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { addChat, recordExchange, removeChat } from "../../state/chats";
import { readLocal, writeLocal, type StorageKey } from "../../storage/keys";
import { useLocalValue } from "../../storage/useLocalValue";
import { generateChatId } from "./actions";
import type { BookMindMessage, Chat } from "./types";

interface UseChatsOptions {
  bookId?: string;
  chatStorage: StorageKey;
  setMessages: (messages: BookMindMessage[]) => void;
}

export function useChats({
  bookId,
  chatStorage,
  setMessages,
}: UseChatsOptions) {
  const stored = useLocalValue(chatStorage);
  const chats = useMemo((): Chat[] => {
    if (!stored) return [];
    try {
      const allChats: Chat[] = JSON.parse(stored);
      return bookId ? allChats.filter((s) => s.bookId === bookId) : allChats;
    } catch (e) {
      console.error("Failed to load chats:", e);
      return [];
    }
  }, [stored, bookId]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const chatIdRef = useRef<string | null>(null);
  const selectChat = useCallback((id: string | null) => {
    chatIdRef.current = id;
    setCurrentChatId(id);
  }, []);

  const readAllChats = useCallback((): Chat[] => {
    try {
      const stored = readLocal(chatStorage);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to read chats:", e);
      return [];
    }
  }, [chatStorage]);

  const writeAllChats = useCallback(
    (all: Chat[]) => {
      if (!writeLocal(chatStorage, JSON.stringify(all))) {
        console.error("Failed to save chats");
      }
    },
    [chatStorage],
  );

  const createChat = useCallback(
    (name?: string): string => {
      const id = generateChatId();
      const all = readAllChats();
      const owner = bookId || "unknown";
      const chat: Chat = {
        id,
        name:
          name || `Chat ${all.filter((s) => s.bookId === owner).length + 1}`,
        bookId: owner,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      writeAllChats(addChat(all, chat));
      selectChat(id);
      setMessages([]);
      return id;
    },
    [bookId, readAllChats, writeAllChats, selectChat, setMessages],
  );

  const loadChat = useCallback(
    (chatId: string) => {
      const chat = readAllChats().find((s) => s.id === chatId);
      if (chat) {
        selectChat(chatId);
        setMessages(chat.messages);
      }
    },
    [readAllChats, selectChat, setMessages],
  );

  const renameChat = useCallback(
    (chatId: string, newName: string) => {
      writeAllChats(
        readAllChats().map((s) =>
          s.id === chatId ? { ...s, name: newName, updatedAt: Date.now() } : s,
        ),
      );
    },
    [readAllChats, writeAllChats],
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      writeAllChats(removeChat(readAllChats(), chatId));
      if (chatIdRef.current === chatId) {
        selectChat(null);
        setMessages([]);
      }
    },
    [readAllChats, writeAllChats, selectChat, setMessages],
  );

  const saveExchange = useCallback(
    (chatId: string | null, newMessages: BookMindMessage[]) => {
      if (!chatId) return;
      writeAllChats(
        recordExchange(readAllChats(), {
          chatId,
          bookId: bookId || "unknown",
          messages: newMessages,
          now: Date.now(),
        }),
      );
    },
    [bookId, readAllChats, writeAllChats],
  );

  return {
    chats,
    currentChatId,
    chatIdRef,
    selectChat,
    createChat,
    loadChat,
    renameChat,
    deleteChat,
    saveExchange,
  };
}
