import { normaliseBook, type Book } from "../model/book";

export const BACKUP_KIND = "makeebook-backup";

export type Backup = {
  kind: typeof BACKUP_KIND;
  schemaVersion: 1;
  exportedAt: string;
  books: Book[];
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function backupFileName(now = new Date()) {
  return `makeebook-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

export function makeBackup(books: Book[], now = new Date()): Backup {
  return {
    kind: BACKUP_KIND,
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    books,
  };
}

export class BackupError extends Error {}

export function parseBackup(text: string, userId: string): Book[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError("That file isn't a makeEbook backup.");
  }
  const list = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        (parsed as { kind?: unknown }).kind === BACKUP_KIND &&
        Array.isArray((parsed as { books?: unknown }).books)
      ? (parsed as { books: unknown[] }).books
      : null;
  if (!list) throw new BackupError("That file isn't a makeEbook backup.");
  return list
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "string",
    )
    .map((item) => normaliseBook(item, userId));
}

export function mergeBackup(
  existing: Book[],
  incoming: Book[],
): { books: Book[]; restored: Book[] } {
  const byId = new Map(existing.map((book) => [book.id, book]));
  const restored: Book[] = [];
  for (const book of incoming) {
    const current = byId.get(book.id);
    if (current && current.revision >= book.revision) continue;
    const next: Book = {
      ...book,
      syncedRevision: Math.min(current?.syncedRevision ?? 0, book.revision),
    };
    byId.set(book.id, next);
    const already = restored.findIndex((b) => b.id === book.id);
    if (already >= 0) restored[already] = next;
    else restored.push(next);
  }
  return { books: [...byId.values()], restored };
}
