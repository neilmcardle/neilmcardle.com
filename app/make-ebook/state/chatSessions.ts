export interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface StoredSession<M extends StoredMessage = StoredMessage> {
  id: string;
  name: string;
  bookId: string;
  messages: M[];
  createdAt: number;
  updatedAt: number;
}

const PLACEHOLDER_NAME = /^Chat \d+$/;

function nameFrom<M extends StoredMessage>(messages: M[]) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return null;
  const text = first.content.trim();
  if (!text) return null;
  return text.slice(0, 40) + (text.length > 40 ? "…" : "");
}

export function addSession<M extends StoredMessage>(
  stored: StoredSession<M>[],
  session: StoredSession<M>,
): StoredSession<M>[] {
  return [...stored.filter((s) => s.id !== session.id), session];
}

export function removeSession<M extends StoredMessage>(
  stored: StoredSession<M>[],
  sessionId: string,
): StoredSession<M>[] {
  return stored.filter((s) => s.id !== sessionId);
}

export function recordExchange<M extends StoredMessage>(
  stored: StoredSession<M>[],
  {
    sessionId,
    bookId,
    messages,
    now,
  }: { sessionId: string; bookId: string; messages: M[]; now: number },
): StoredSession<M>[] {
  const existing = stored.find((s) => s.id === sessionId);
  const autoName =
    !existing || PLACEHOLDER_NAME.test(existing.name)
      ? nameFrom(messages)
      : null;
  if (!existing) {
    const sameBook = stored.filter((s) => s.bookId === bookId).length;
    return [
      ...stored,
      {
        id: sessionId,
        name: autoName ?? `Chat ${sameBook + 1}`,
        bookId,
        messages,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
  return stored.map((s) =>
    s.id === sessionId
      ? {
          ...s,
          messages,
          updatedAt: now,
          ...(autoName ? { name: autoName } : {}),
        }
      : s,
  );
}
