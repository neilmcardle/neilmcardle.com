import { describe, expect, it } from "vitest";
import {
  addSession,
  recordExchange,
  removeSession,
  type StoredSession,
} from "./chatSessions";

const msg = (id: string, role: "user" | "assistant", content: string) => ({
  id,
  role,
  content,
  timestamp: 1,
});

const session = (
  id: string,
  bookId: string,
  name = "Chat 1",
): StoredSession => ({
  id,
  name,
  bookId,
  messages: [],
  createdAt: 1,
  updatedAt: 1,
});

describe("chatSessions", () => {
  it("creates the session and saves the first exchange in one step", () => {
    const result = recordExchange([], {
      sessionId: "chat-1",
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

  it("updates an existing session and names it from the first question", () => {
    const stored = [session("chat-1", "book-1")];
    const result = recordExchange(stored, {
      sessionId: "chat-1",
      bookId: "book-1",
      messages: [msg("m1", "user", "x".repeat(50))],
      now: 9,
    });
    expect(result[0].name).toBe(`${"x".repeat(40)}…`);
    expect(result[0].updatedAt).toBe(9);
  });

  it("keeps a session another window wrote when adding one", () => {
    const stored = [session("chat-a", "book-1"), session("chat-b", "book-2")];
    const result = addSession(stored, session("chat-c", "book-1", "Chat 2"));
    expect(result.map((s) => s.id)).toEqual(["chat-a", "chat-b", "chat-c"]);
  });

  it("removes only the session asked for", () => {
    const stored = [session("chat-a", "book-1"), session("chat-b", "book-1")];
    expect(removeSession(stored, "chat-a").map((s) => s.id)).toEqual([
      "chat-b",
    ]);
  });
});
