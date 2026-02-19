import { BookRecord, Chapter, Endnote, EndnoteReference } from '../types';

function libraryKey(userId: string) {
  return `makeebook_library_${userId}`;
}

export function loadBookLibrary(userId: string): BookRecord[] {
  if (typeof window === "undefined") return [];
  const str = localStorage.getItem(libraryKey(userId));
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error('Failed to parse book library from localStorage:', e);
      return [];
    }
  }
  return [];
}

export function saveBookToLibrary(userId: string, book: Partial<BookRecord>): string {
  if (typeof window === "undefined") return "";
  let library = loadBookLibrary(userId);
  const id = book.id || "book-" + Date.now();
  const bookToSave: BookRecord = {
    id,
    title: book.title || '',
    author: book.author || '',
    blurb: book.blurb || '',
    publisher: book.publisher || '',
    pubDate: book.pubDate || '',
    isbn: book.isbn || '',
    language: book.language || '',
    genre: book.genre || '',
    chapters: book.chapters || [],
    tags: book.tags || [],
    coverFile: book.coverFile || null,
    endnotes: book.endnotes || [],
    endnoteReferences: book.endnoteReferences || [],
    savedAt: Date.now(),
  };
  const idx = library.findIndex((b) => b.id === id);
  if (idx >= 0) library[idx] = bookToSave;
  else library.push(bookToSave);
  // Throws on quota exceeded — caller should catch and notify user
  localStorage.setItem(libraryKey(userId), JSON.stringify(library));
  return id;
}

export function loadBookById(userId: string, id: string): BookRecord | undefined {
  const library = loadBookLibrary(userId);
  return library.find((b) => b.id === id);
}

export function removeBookFromLibrary(userId: string, id: string) {
  let library = loadBookLibrary(userId);
  library = library.filter((b) => b.id !== id);
  try {
    localStorage.setItem(libraryKey(userId), JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save library after removing book:', e);
  }
}

/**
 * Normalize a book from Supabase (snake_case) to the app's camelCase format.
 * Handles both camelCase and snake_case fields so it works with already-normalized data too.
 */
export function normalizeBookFromSupabase(book: Record<string, unknown>): BookRecord {
  return {
    id: (book.id as string) || '',
    title: (book.title as string) || '',
    author: (book.author as string) || '',
    blurb: (book.blurb as string) || '',
    publisher: (book.publisher as string) || '',
    pubDate: (book.pubDate as string) || (book.pub_date as string) || '',
    isbn: (book.isbn as string) || '',
    language: (book.language as string) || '',
    genre: (book.genre as string) || '',
    chapters: normalizeChapters(book.chapters),
    tags: Array.isArray(book.tags) ? book.tags : [],
    coverFile: (book.coverFile as string) || (book.cover_image_url as string) || null,
    endnotes: Array.isArray(book.endnotes) ? book.endnotes : [],
    endnoteReferences: normalizeEndnoteReferences(book.endnoteReferences || book.endnote_references),
    savedAt: (book.savedAt as number) || (book.updated_at ? new Date(book.updated_at as string).getTime() : Date.now()),
  };
}

function normalizeChapters(raw: unknown): Chapter[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((ch: Record<string, unknown>) => ({
    id: (ch.id as string) || '',
    title: (ch.title as string) || '',
    content: (ch.content as string) || '',
    type: (ch.type as Chapter['type']) || 'content',
  }));
}

function normalizeEndnoteReferences(raw: unknown): EndnoteReference[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((ref: Record<string, unknown>) => ({
    id: (ref.id as string) || '',
    number: (ref.number as number) || 0,
    chapterId: (ref.chapterId as string) || (ref.chapter_id as string) || '',
    endnoteId: (ref.endnoteId as string) || (ref.endnote_id as string) || '',
  }));
}

export function saveLibraryToStorage(userId: string, books: BookRecord[]) {
  try {
    localStorage.setItem(libraryKey(userId), JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save library to localStorage:', e);
  }
}
