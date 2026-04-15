// Read, write, and invalidate per-book Book Mind memory.
//
// Memory lives on the BookRecord (BookRecord.bookmindMemory) inside the
// existing book library. One source of truth, one localStorage key, one
// hash to detect when the manuscript has drifted out from under cached
// analyses. No parallel store, no migrations, no second sync layer.
//
// Read paths are synchronous — every Book Mind surface can pull the brief
// and rules without a network round-trip. Write paths are also synchronous
// but always go through saveBookToLibrary so the rest of the BookRecord is
// preserved (cover file, endnotes, etc).

import {
  BookRecord,
  Chapter,
  BookMindMemory,
  ManuscriptBrief,
  AnalyticalCache,
  AnalyticalCacheEntry,
  AnalyticalResponse,
} from '../types';
import { loadBookById, saveBookToLibrary } from './bookLibrary';

// Empty memory shell used when a book has never been touched by Book Mind.
// Always returned by getMemory rather than undefined so callers can dot
// into rules / characters / decisions without nullish guards everywhere.
export function emptyMemory(): BookMindMemory {
  return {
    rules: [],
    characters: {},
    decisions: [],
  };
}

// FNV-1a 32-bit hash. ~1ms even on a 200K-word manuscript; deterministic;
// no dependencies. Hashes title + content of every chapter. Two
// manuscripts with the same title and content produce the same hash; any
// edit changes it. Intentionally not cryptographic — we only need to
// detect drift, not resist tampering.
export function manuscriptHash(chapters: Chapter[]): string {
  const FNV_OFFSET = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;
  let h = FNV_OFFSET;
  for (const ch of chapters) {
    const s = (ch.title || '') + '\u0000' + (ch.content || '') + '\u0001';
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, FNV_PRIME);
    }
  }
  // Convert to unsigned hex, padded so equal-length comparisons are visually obvious in DevTools.
  return (h >>> 0).toString(16).padStart(8, '0');
}

// Pull the memory off a book. Returns the empty shell if the book has
// never been touched by Book Mind, so call sites can always dot into
// rules / characters / decisions without nullish checks.
export function getMemory(book: BookRecord | undefined): BookMindMemory {
  if (!book) return emptyMemory();
  if (!book.bookmindMemory) return emptyMemory();
  // Defensive: legacy memory blobs may be missing newer fields after a
  // schema bump. Fill in the gaps without overwriting existing data.
  return {
    brief: book.bookmindMemory.brief,
    analytical: book.bookmindMemory.analytical,
    rules: book.bookmindMemory.rules ?? [],
    characters: book.bookmindMemory.characters ?? {},
    decisions: book.bookmindMemory.decisions ?? [],
    dismissedIssueIds: book.bookmindMemory.dismissedIssueIds ?? [],
  };
}

// Write a new memory blob for a book. Loads the book fresh, swaps in the
// new memory, persists via saveBookToLibrary so the rest of the record is
// preserved exactly. No-op if the book can't be found (e.g. deleted in
// another tab between read and write).
export function setMemory(userId: string, bookId: string, memory: BookMindMemory): void {
  if (typeof window === 'undefined') return;
  const book = loadBookById(userId, bookId);
  if (!book) return;
  saveBookToLibrary(userId, { ...book, bookmindMemory: memory });
}

// Convenience: shallow-merge a partial update into existing memory and
// persist. Used by every Book Mind surface that needs to flip one field
// (e.g. brief generator after it finishes, memory editor when the user
// adds a rule). The merge is one level deep — pass a fully-built brief
// or analytical entry, not a partial one.
export function patchMemory(
  userId: string,
  bookId: string,
  patch: Partial<BookMindMemory>,
): void {
  if (typeof window === 'undefined') return;
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const next: BookMindMemory = {
    ...getMemory(book),
    ...patch,
  };
  saveBookToLibrary(userId, { ...book, bookmindMemory: next });
}

// ─── Brief helpers ────────────────────────────────────────────────────────

// Is the brief on this book current? True only if it exists AND the
// hash matches the live chapters. Used to decide whether to kick off a
// background regeneration on book open.
export function isBriefFresh(book: BookRecord | undefined): boolean {
  if (!book?.bookmindMemory?.brief) return false;
  return book.bookmindMemory.brief.manuscriptHash === manuscriptHash(book.chapters);
}

// The brief if fresh; null otherwise. Stale briefs still render in the UI
// (with a "may be out of date" indicator) — call sites that want strict
// freshness should use this; call sites that prefer stale-while-revalidate
// should read book.bookmindMemory.brief directly.
export function getFreshBrief(book: BookRecord | undefined): ManuscriptBrief | null {
  if (!book) return null;
  if (!isBriefFresh(book)) return null;
  return book.bookmindMemory!.brief!;
}

export function setBrief(userId: string, bookId: string, brief: ManuscriptBrief): void {
  patchMemory(userId, bookId, { brief });
}

// ─── Analytical cache helpers ─────────────────────────────────────────────

export type AnalyticalKind = keyof AnalyticalCache;

export function getAnalytical(
  book: BookRecord | undefined,
  kind: AnalyticalKind,
): AnalyticalCacheEntry | null {
  return book?.bookmindMemory?.analytical?.[kind] ?? null;
}

export function isAnalyticalFresh(
  book: BookRecord | undefined,
  kind: AnalyticalKind,
): boolean {
  const entry = getAnalytical(book, kind);
  if (!entry || !book) return false;
  return entry.manuscriptHash === manuscriptHash(book.chapters);
}

export function setAnalytical(
  userId: string,
  bookId: string,
  kind: AnalyticalKind,
  payload: AnalyticalResponse,
  hash: string,
): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  const nextAnalytical: AnalyticalCache = {
    ...(memory.analytical ?? {}),
    [kind]: {
      generatedAt: Date.now(),
      manuscriptHash: hash,
      payload,
    } as AnalyticalCacheEntry,
  };
  patchMemory(userId, bookId, { analytical: nextAnalytical });
}

// ─── User-facing memory helpers (rules / characters / decisions) ──────────

export function addRule(userId: string, bookId: string, rule: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  if (memory.rules.includes(rule)) return;
  patchMemory(userId, bookId, { rules: [...memory.rules, rule] });
}

export function removeRule(userId: string, bookId: string, rule: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  patchMemory(userId, bookId, { rules: memory.rules.filter(r => r !== rule) });
}

export function setCharacter(userId: string, bookId: string, name: string, description: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  patchMemory(userId, bookId, {
    characters: { ...memory.characters, [name]: description },
  });
}

export function removeCharacter(userId: string, bookId: string, name: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  const next = { ...memory.characters };
  delete next[name];
  patchMemory(userId, bookId, { characters: next });
}

export function addDecision(userId: string, bookId: string, note: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  patchMemory(userId, bookId, {
    decisions: [...memory.decisions, { date: Date.now(), note }],
  });
}

export function dismissIssue(userId: string, bookId: string, issueId: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const memory = getMemory(book);
  if ((memory.dismissedIssueIds ?? []).includes(issueId)) return;
  patchMemory(userId, bookId, {
    dismissedIssueIds: [...(memory.dismissedIssueIds ?? []), issueId],
  });
}

// Format the user-facing memory as a system-prompt block. Injected into
// every Book Mind call so the model never forgets the author's standing
// rules and decisions. Returns an empty string if there is nothing to
// remember, so the prompt stays clean for new books.
export function formatMemoryForPrompt(memory: BookMindMemory): string {
  const parts: string[] = [];
  if (memory.rules.length > 0) {
    parts.push('Rules the author has set:\n' + memory.rules.map(r => `- ${r}`).join('\n'));
  }
  const charNames = Object.keys(memory.characters);
  if (charNames.length > 0) {
    parts.push(
      'Characters the author has confirmed:\n' +
      charNames.map(n => `- ${n}: ${memory.characters[n]}`).join('\n'),
    );
  }
  if (memory.decisions.length > 0) {
    const recent = memory.decisions.slice(-10);
    parts.push(
      'Recent editorial decisions:\n' +
      recent.map(d => `- ${d.note}`).join('\n'),
    );
  }
  if (parts.length === 0) return '';
  return `THINGS BOOK MIND KNOWS ABOUT THIS BOOK\n\n${parts.join('\n\n')}`;
}
