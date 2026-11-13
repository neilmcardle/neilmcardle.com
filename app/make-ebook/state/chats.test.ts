import { describe, expect, it } from "vitest";
import { addChat, recordExchange, removeChat, type StoredChat } from "./chats";

const msg = (id: string, role: "user" | "assistant", content: string) => ({
  id,
  role,
  content,
  timestamp: 1,
});

const chat = (id: string, bookId: string, name = "Chat 1"): StoredChat => ({
  id,
  name,
  bookId,
  messages: [],
  createdAt: 1,
  updatedAt: 1,
});

describe("chats", () => {
  it("creates the chat and saves the first exchange in one step", () => {
    const result = recordExchange([], {
      chatId: "chat-1",
      bookId: "book-1",
      messages: [
        msg("m1", "user", "Who is Ada?"),
        msg("m2", "assistant", "A pilot."),
      ],
      now: 5,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "chat-1",
      bookId: "book-1",
      name: "Who is Ada?",
      createdAt: 5,
    });
    expect(result[0].messages).toHaveLength(2);
  });

  it("updates an existing chat and names it from the first question", () => {
    const stored = [chat("chat-1", "book-1")];
    const result = recordExchange(stored, {
      chatId: "chat-1",
      bookId: "book-1",
      messages: [msg("m1", "user", "x".repeat(50))],
      now: 9,
    });
    expect(result[0].name).toBe(`${"x".repeat(40)}…`);
    expect(result[0].updatedAt).toBe(9);
  });

  it("keeps a chat another window wrote when adding one", () => {
    const stored = [chat("chat-a", "book-1"), chat("chat-b", "book-2")];
    const result = addChat(stored, chat("chat-c", "book-1", "Chat 2"));
    expect(result.map((s) => s.id)).toEqual(["chat-a", "chat-b", "chat-c"]);
  });

  it("removes only the chat asked for", () => {
    const stored = [chat("chat-a", "book-1"), chat("chat-b", "book-1")];
    expect(removeChat(stored, "chat-a").map((s) => s.id)).toEqual(["chat-b"]);
  });
});
