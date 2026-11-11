import { getSupabaseBrowserClient } from "@/lib/supabase";
import { needsPush, normaliseBook, type Book } from "../model/book";
import { createSingleFlight } from "../state/singleFlight";
import { toDisplayCover } from "../utils/assetStore";
import { isBlankBook } from "../utils/bookLibrary";
import { bookStore } from "./bookStore";

export const TABLE = "makeebook_books";

type Row = {
  id: string;
  user_id: string;
  data?: unknown;
  revision: number | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type RemoteIndexEntry = {
  id: string;
  revision: number;
  deleted: boolean;
};

export type RemoteBook = RemoteIndexEntry & { book: Book | null };

export type PushResult =
  { status: "pushed"; revision: number } | { status: "conflict" };

export type PushOutcome = "pushed" | "conflict" | "nothing" | "failed";

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase client not initialized");
  return supabase;
}

function toRemote(row: Row, userId: string): RemoteBook {
  const revision = typeof row.revision === "number" ? row.revision : 0;
  const deleted = !!row.deleted_at;
  const book =
    deleted || row.data === undefined
      ? null
      : {
          ...normaliseBook(row.data, userId),
          id: row.id,
          revision,
          syncedRevision: revision,
        };
  return { id: row.id, revision, deleted, book };
}

export async function pullIndex(userId: string): Promise<RemoteIndexEntry[]> {
  const { data, error } = await client()
    .from(TABLE)
    .select("id, user_id, revision, updated_at, deleted_at")
    .eq("user_id", userId);
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => {
    const { book: _book, ...entry } = toRemote(row, userId);
    return entry;
  });
}

export async function pullBooks(
  userId: string,
  ids: string[],
): Promise<RemoteBook[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client()
    .from(TABLE)
    .select("id, user_id, data, revision, updated_at, deleted_at")
    .eq("user_id", userId)
    .in("id", ids);
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => toRemote(row, userId));
}

export async function pull(userId: string): Promise<RemoteBook[]> {
  const { data, error } = await client()
    .from(TABLE)
    .select("id, user_id, data, revision, updated_at, deleted_at")
    .eq("user_id", userId);
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => toRemote(row, userId));
}

export async function push(book: Book): Promise<PushResult> {
  const supabase = client();
  const now = new Date().toISOString();
  const fields = {
    data: book,
    revision: book.revision,
    updated_at: now,
    deleted_at: null,
  };
  const updated = await supabase
    .from(TABLE)
    .update(fields)
    .eq("id", book.id)
    .eq("revision", book.syncedRevision)
    .select("id");
  if (updated.error) throw updated.error;
  if ((updated.data ?? []).length > 0) {
    return { status: "pushed", revision: book.revision };
  }

  const inserted = await supabase
    .from(TABLE)
    .insert({ id: book.id, user_id: book.userId, ...fields })
    .select("id");
  if (!inserted.error) return { status: "pushed", revision: book.revision };
  if (inserted.error.code === "23505") return { status: "conflict" };
  throw inserted.error;
}

export async function remove(id: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await client()
    .from(TABLE)
    .update({ deleted_at: now, updated_at: now })
    .eq("id", id);
  if (error) throw error;
}

const conflictListeners = new Set<(userId: string, id: string) => void>();

export function onConflict(listener: (userId: string, id: string) => void) {
  conflictListeners.add(listener);
  return () => {
    conflictListeners.delete(listener);
  };
}

async function runPush(
  userId: string,
  id: string,
  notify: boolean,
): Promise<PushOutcome> {
  const book = bookStore.get(userId, id);
  if (!book || !needsPush(book)) return "nothing";
  if (book.syncedRevision === 0 && isBlankBook(book)) return "nothing";
  const cover = await toDisplayCover(book.coverFile).catch(() => null);
  const result = await push({ ...book, userId, coverFile: cover });
  if (result.status === "conflict") {
    if (notify) conflictListeners.forEach((listener) => listener(userId, id));
    return "conflict";
  }
  const latest = bookStore.get(userId, id);
  if (latest && latest.syncedRevision < result.revision) {
    bookStore.put({
      ...latest,
      syncedRevision: Math.min(result.revision, latest.revision),
    });
  }
  return "pushed";
}

type PushRequest = { userId: string; notify: boolean };

const pushFlight = createSingleFlight<PushRequest, PushOutcome>({
  run: (id, { userId, notify }) => runPush(userId, id, notify),
  merge: (a, b) => ({ userId: b.userId, notify: a.notify || b.notify }),
  failed: "failed",
});

export function pushStored(
  userId: string,
  id: string,
  options: { notify?: boolean } = {},
): Promise<PushOutcome> {
  return pushFlight.request(id, { userId, notify: options.notify ?? true });
}
