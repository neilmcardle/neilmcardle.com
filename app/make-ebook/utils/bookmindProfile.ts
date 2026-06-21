// Idempotent book profile generation. Returns immediately if fresh,
// joins in-flight if already running, otherwise kicks off a new extraction.
// The profile is generated from the manuscript brief (cheap: summaries only,
// not the full manuscript text).

import { BookRecord, BookProfile, ChapterSummary } from '../types';
import { manuscriptHash, isProfileFresh, setProfile, getFreshBrief } from './bookmindMemory';

export interface ProfileResult {
  ok: boolean;
  profile?: BookProfile;
  newCharacters?: string[];
  newLocations?: string[];
  error?: string;
  reason?: 'fresh' | 'no-brief' | 'in-flight' | 'http' | 'parse';
}

const inFlight = new Map<string, Promise<ProfileResult>>();

export async function ensureBookProfile(args: {
  userId: string;
  book: BookRecord;
  force?: boolean;
}): Promise<ProfileResult> {
  const { userId, book, force = false } = args;

  if (!force && isProfileFresh(book)) {
    return { ok: true, profile: book.bookmindMemory!.profile!, newCharacters: [], newLocations: [] };
  }

  const brief = getFreshBrief(book);
  if (!brief) {
    return { ok: false, reason: 'no-brief', error: 'Brief not ready yet' };
  }

  const existing = inFlight.get(book.id);
  if (existing) return existing;

  const promise = (async (): Promise<ProfileResult> => {
    try {
      return await extractProfile(userId, book, brief.chapterSummaries);
    } finally {
      inFlight.delete(book.id);
    }
  })();

  inFlight.set(book.id, promise);
  return promise;
}

async function extractProfile(
  userId: string,
  book: BookRecord,
  chapterSummaries: ChapterSummary[],
): Promise<ProfileResult> {
  const hash = manuscriptHash(book.chapters);
  const oldProfile = book.bookmindMemory?.profile;

  let response: Response;
  try {
    response = await fetch('/api/ai/book-mind/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        genre: book.genre,
        manuscriptHash: hash,
        chapterSummaries: chapterSummaries.map(s => ({
          title: s.title,
          type: s.type,
          summary: s.summary,
          keyEntities: s.keyEntities,
        })),
      }),
    });
  } catch (err) {
    return { ok: false, reason: 'http', error: err instanceof Error ? err.message : 'Network error' };
  }

  if (!response.ok) {
    let errorText = `Profile extraction failed (${response.status})`;
    try { const d = await response.json(); if (d?.error) errorText = d.error; } catch { /* ignore */ }
    return { ok: false, reason: 'http', error: errorText };
  }

  let data: { ok: boolean; profile?: BookProfile; error?: string };
  try {
    data = await response.json();
  } catch {
    return { ok: false, reason: 'parse', error: 'Could not parse profile response' };
  }

  if (!data.ok || !data.profile) {
    return { ok: false, reason: 'parse', error: data.error ?? 'Empty profile' };
  }

  // Merge: preserve any user-added items and user-curated writing rules.
  const merged = mergeWithExisting(data.profile, oldProfile, hash);

  setProfile(userId, book.id, merged);

  // Diff to surface what's new for the toast notification.
  const oldCharNames = new Set((oldProfile?.characters ?? []).map(c => c.name.toLowerCase()));
  const oldLocNames  = new Set((oldProfile?.locations  ?? []).map(l => l.name.toLowerCase()));

  const newCharacters = merged.characters
    .filter(c => c.source === 'auto' && !oldCharNames.has(c.name.toLowerCase()))
    .map(c => c.name);
  const newLocations = merged.locations
    .filter(l => l.source === 'auto' && !oldLocNames.has(l.name.toLowerCase()))
    .map(l => l.name);

  return { ok: true, profile: merged, newCharacters, newLocations };
}

// Keep user-added items and user-curated rules; replace auto-extracted ones.
function mergeWithExisting(
  fresh: BookProfile,
  old: BookProfile | undefined,
  hash: string,
): BookProfile {
  const userChars = (old?.characters ?? []).filter(c => c.source === 'user');
  const userLocs  = (old?.locations  ?? []).filter(l => l.source === 'user');

  return {
    ...fresh,
    generatedAt: Date.now(),
    manuscriptHash: hash,
    characters: [...fresh.characters, ...userChars],
    locations:  [...fresh.locations,  ...userLocs],
    // Preserve user-curated writing rules across re-extractions.
    writingRules: old?.writingRules ?? [],
  };
}
