import {
  BookRecord,
  Chapter,
  BookMindMemory,
  ManuscriptBrief,
  AnalyticalCache,
  AnalyticalCacheEntry,
  AnalyticalResponse,
  BookProfile,
  ProfileCharacter,
  ProfileLocation,
} from '../types';
import { loadBookById, saveBookToLibrary } from './bookLibrary';

export function emptyMemory(): BookMindMemory {
  return {
    rules: [],
    characters: {},
    decisions: [],
  };
}

// FNV-1a 32-bit hash. Deterministic; intentionally not cryptographic.
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
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function getMemory(book: BookRecord | undefined): BookMindMemory {
  if (!book) return emptyMemory();
  if (!book.bookmindMemory) return emptyMemory();
  // Legacy blobs may be missing newer fields; fill gaps without overwriting.
  return {
    brief: book.bookmindMemory.brief,
    analytical: book.bookmindMemory.analytical,
    rules: book.bookmindMemory.rules ?? [],
    characters: book.bookmindMemory.characters ?? {},
    decisions: book.bookmindMemory.decisions ?? [],
    dismissedIssueIds: book.bookmindMemory.dismissedIssueIds ?? [],
  };
}

export function setMemory(userId: string, bookId: string, memory: BookMindMemory): void {
  if (typeof window === 'undefined') return;
  const book = loadBookById(userId, bookId);
  if (!book) return;
  saveBookToLibrary(userId, { ...book, bookmindMemory: memory });
}

// Shallow-merges (one level deep) a partial update into existing memory.
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

export function isBriefFresh(book: BookRecord | undefined): boolean {
  if (!book?.bookmindMemory?.brief) return false;
  return book.bookmindMemory.brief.manuscriptHash === manuscriptHash(book.chapters);
}

export function getFreshBrief(book: BookRecord | undefined): ManuscriptBrief | null {
  if (!book) return null;
  if (!isBriefFresh(book)) return null;
  return book.bookmindMemory!.brief!;
}

export function setBrief(userId: string, bookId: string, brief: ManuscriptBrief): void {
  patchMemory(userId, bookId, { brief });
}

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

// ─── Book Profile helpers ─────────────────────────────────────────────────────

export function getProfile(book: BookRecord | undefined): BookProfile | null {
  return book?.bookmindMemory?.profile ?? null;
}

export function isProfileFresh(book: BookRecord | undefined): boolean {
  const p = book?.bookmindMemory?.profile;
  if (!p) return false;
  return p.manuscriptHash === manuscriptHash(book!.chapters);
}

export function setProfile(userId: string, bookId: string, profile: BookProfile): void {
  patchMemory(userId, bookId, { profile });
}

export function patchProfileCharacter(
  userId: string,
  bookId: string,
  char: ProfileCharacter,
): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  const chars = profile.characters.map(c => c.id === char.id ? char : c);
  setProfile(userId, bookId, { ...profile, characters: chars });
}

export function removeProfileCharacter(userId: string, bookId: string, charId: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  setProfile(userId, bookId, {
    ...profile,
    characters: profile.characters.filter(c => c.id !== charId),
  });
}

export function addProfileCharacter(userId: string, bookId: string, char: Omit<ProfileCharacter, 'id' | 'source'>): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  const newChar: ProfileCharacter = { ...char, id: `char-${Date.now()}`, source: 'user' };
  if (profile) {
    setProfile(userId, bookId, { ...profile, characters: [...profile.characters, newChar] });
  }
}

export function removeProfileLocation(userId: string, bookId: string, locId: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  setProfile(userId, bookId, {
    ...profile,
    locations: profile.locations.filter(l => l.id !== locId),
  });
}

export function patchProfileLocation(
  userId: string,
  bookId: string,
  loc: ProfileLocation,
): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  setProfile(userId, bookId, {
    ...profile,
    locations: profile.locations.map(l => l.id === loc.id ? loc : l),
  });
}

export function addProfileRule(userId: string, bookId: string, rule: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile || profile.writingRules.includes(rule)) return;
  setProfile(userId, bookId, { ...profile, writingRules: [...profile.writingRules, rule] });
}

export function removeProfileRule(userId: string, bookId: string, rule: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  setProfile(userId, bookId, {
    ...profile,
    writingRules: profile.writingRules.filter(r => r !== rule),
  });
}

export function addProfileFact(userId: string, bookId: string, fact: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  setProfile(userId, bookId, { ...profile, keyFacts: [...profile.keyFacts, fact] });
}

export function removeProfileFact(userId: string, bookId: string, fact: string): void {
  const book = loadBookById(userId, bookId);
  if (!book) return;
  const profile = getProfile(book);
  if (!profile) return;
  setProfile(userId, bookId, {
    ...profile,
    keyFacts: profile.keyFacts.filter(f => f !== fact),
  });
}

export function formatMemoryForPrompt(memory: BookMindMemory): string {
  const parts: string[] = [];

  // Prefer profile over legacy fields when both exist.
  const p = memory.profile;
  if (p) {
    if (p.style?.pov || p.style?.tense || p.style?.tone) {
      const styleLines = [
        p.style.pov && `POV: ${p.style.pov}`,
        p.style.tense && `Tense: ${p.style.tense}`,
        p.style.tone && `Tone: ${p.style.tone}`,
      ].filter(Boolean);
      parts.push('Writing style:\n' + styleLines.map(l => `- ${l}`).join('\n'));
    }
    if (p.characters.length > 0) {
      parts.push(
        'Characters:\n' +
        p.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n'),
      );
    }
    if (p.locations.length > 0) {
      parts.push(
        'Locations:\n' +
        p.locations.map(l => `- ${l.name}: ${l.description}`).join('\n'),
      );
    }
    if (p.keyFacts.length > 0) {
      parts.push('Key facts:\n' + p.keyFacts.map(f => `- ${f}`).join('\n'));
    }
    if (p.writingRules.length > 0) {
      parts.push('Writing rules:\n' + p.writingRules.map(r => `- ${r}`).join('\n'));
    }
  } else {
    // Fallback to legacy fields for books not yet profiled.
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
  }

  if (memory.decisions.length > 0) {
    const recent = memory.decisions.slice(-10);
    parts.push(
      'Editorial decisions:\n' +
      recent.map(d => `- ${d.note}`).join('\n'),
    );
  }

  if (parts.length === 0) return '';
  return `BOOK PROFILE\n\n${parts.join('\n\n')}`;
}
