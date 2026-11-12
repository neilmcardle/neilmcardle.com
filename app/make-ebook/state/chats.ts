export interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface StoredChat<M extends StoredMessage = StoredMessage> {
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

export function addChat<M extends StoredMessage>(
  stored: StoredChat<M>[],
  chat: StoredChat<M>,
): StoredChat<M>[] {
  return [...stored.filter((s) => s.id !== chat.id), chat];
}

export function removeChat<M extends StoredMessage>(
  stored: StoredChat<M>[],
  chatId: string,
): StoredChat<M>[] {
  return stored.filter((s) => s.id !== chatId);
}

export function recordExchange<M extends StoredMessage>(
  stored: StoredChat<M>[],
  {
    chatId,
    bookId,
    messages,
    now,
  }: { chatId: string; bookId: string; messages: M[]; now: number },
): StoredChat<M>[] {
  const existing = stored.find((s) => s.id === chatId);
  const autoName =
    !existing || PLACEHOLDER_NAME.test(existing.name)
      ? nameFrom(messages)
      : null;
  if (!existing) {
    const sameBook = stored.filter((s) => s.bookId === bookId).length;
    return [
      ...stored,
      {
        id: chatId,
        name: autoName ?? `Chat ${sameBook + 1}`,
        bookId,
        messages,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
  return stored.map((s) =>
    s.id === chatId
      ? {
          ...s,
          messages,
          updatedAt: now,
          ...(autoName ? { name: autoName } : {}),
        }
      : s,
  );
}
