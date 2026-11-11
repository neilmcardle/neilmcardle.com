import { BookRecord } from "../types";
import { hasText as htmlHasText } from "../model/text";
import { newBook, newId, normaliseBook } from "../model/book";
import { bookStore } from "../storage/bookStore";

export function loadBookLibrary(userId: string): BookRecord[] {
  if (typeof window === "undefined") return [];
  return bookStore.list(userId);
}

export function saveBookToLibrary(
  userId: string,
  book: Partial<BookRecord>,
  options: { keepSavedAt?: boolean } = {},
): string {
  if (typeof window === "undefined") return "";
  const id = book.id || newId();
  const existing = bookStore.get(userId, id);
  const base = existing ?? { ...newBook(userId), id };
  const next = normaliseBook(
    {
      id,
      title: book.title || "",
      author: book.author || "",
      blurb: book.blurb || "",
      publisher: book.publisher || "",
      pubDate: book.pubDate || "",
      isbn: book.isbn || "",
      language: book.language || "",
      genre: book.genre || "",
      typography: book.typography,
      chapters: book.chapters || [],
      tags: book.tags || [],
      coverFile: book.coverFile || null,
      endnotes: book.endnotes || [],
      endnoteReferences: book.endnoteReferences || [],
      bookmindMemory: book.bookmindMemory ?? existing?.bookmindMemory,
      savedAt:
        options.keepSavedAt && existing
          ? existing.savedAt
          : (book.savedAt ?? Date.now()),
      revision: Math.max(base.revision, book.revision ?? 0) + 1,
      syncedRevision: existing?.syncedRevision ?? book.syncedRevision ?? 0,
    },
    userId,
  );
  bookStore.put(next);
  return id;
}

export function loadBookById(
  userId: string,
  id: string,
): BookRecord | undefined {
  return bookStore.get(userId, id);
}

export function removeBookFromLibrary(userId: string, id: string) {
  bookStore.remove(userId, id);
}

export function saveLibraryToStorage(userId: string, books: BookRecord[]) {
  try {
    bookStore.replaceAll(
      userId,
      books.map((book) => normaliseBook(book, userId)),
    );
  } catch (e) {
    console.error("Failed to save the library:", e);
  }
}

function hasText(html?: string) {
  return htmlHasText(html);
}

export function isBlankBook(book: Partial<BookRecord>) {
  return (
    !book.title?.trim() &&
    !book.author?.trim() &&
    !book.blurb?.trim() &&
    !book.coverFile &&
    !(book.chapters ?? []).some((ch) => ch.title?.trim() || hasText(ch.content))
  );
}

export function pruneBlankBooks(userId: string): BookRecord[] {
  const library = loadBookLibrary(userId);
  const kept = library.filter((b) => !isBlankBook(b));
  if (kept.length !== library.length) {
    for (const book of library) {
      if (isBlankBook(book)) bookStore.remove(userId, book.id);
    }
  }
  return kept;
}

export function displayTitle(book: {
  title?: string;
  chapters?: { title?: string }[];
}) {
  return (
    book.title?.trim() ||
    book.chapters?.find((ch) => ch.title?.trim())?.title?.trim() ||
    "Untitled book"
  );
}
