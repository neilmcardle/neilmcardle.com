// Generate the ManuscriptBrief — Book Mind's pre-computed spine.
//
// Runs once when a book is opened (or after edits settle) and persists
// the result to bookmindMemory.brief. From that point on, every Book
// Mind interaction reads the brief locally without an API call. This is
// the single change that makes large-book responses feel instant: we
// pay the indexing cost once per manuscript-edit cycle, then every
// subsequent turn reuses the brief for free.
//
// Generation uses a single Sonnet call with the whole manuscript and
// prompt caching. The response is structured JSON matching the
// ChapterSummary shape. Streaming is on so the user can see the brief
// arrive chapter by chapter in the Inspector status strip.

import { BookRecord, ManuscriptBrief, ChapterSummary, Chapter } from '../types';
import { manuscriptHash, isBriefFresh, setBrief } from './bookmindMemory';

export interface GenerateBriefResult {
  ok: boolean;
  brief?: ManuscriptBrief;
  error?: string;
  reason?: 'fresh' | 'no-chapters' | 'in-flight' | 'http' | 'parse';
}

// In-flight tracker so two surfaces opening at the same time don't kick
// off duplicate generation calls. Keyed per book id. Cleared on
// completion regardless of success.
const inFlight = new Map<string, Promise<GenerateBriefResult>>();

// Public entry point. Idempotent and safe to call from anywhere on book
// open: returns immediately if the brief is fresh, joins an existing
// in-flight call if one is running, otherwise kicks one off.
export async function ensureManuscriptBrief(args: {
  userId: string;
  book: BookRecord;
  // Optional callback fired after each chapter summary streams in,
  // useful for live-updating the Inspector status strip during gen.
  onProgress?: (summariesSoFar: ChapterSummary[]) => void;
}): Promise<GenerateBriefResult> {
  const { userId, book } = args;

  if (book.chapters.length === 0) {
    return { ok: false, reason: 'no-chapters', error: 'Book has no chapters' };
  }

  if (isBriefFresh(book)) {
    return { ok: true, brief: book.bookmindMemory!.brief! };
  }

  const existing = inFlight.get(book.id);
  if (existing) return existing;

  const promise = (async (): Promise<GenerateBriefResult> => {
    try {
      const result = await generateBrief(book, args.onProgress);
      if (result.ok && result.brief) {
        setBrief(userId, book.id, result.brief);
      }
      return result;
    } finally {
      inFlight.delete(book.id);
    }
  })();

  inFlight.set(book.id, promise);
  return promise;
}

// Low-level: actually call the API. Streams JSON so the caller can show
// partial progress. The model is instructed to emit one ChapterSummary
// JSON object per chapter, separated by a sentinel newline, so we can
// parse incrementally rather than waiting for the whole document.
async function generateBrief(
  book: BookRecord,
  onProgress?: (summariesSoFar: ChapterSummary[]) => void,
): Promise<GenerateBriefResult> {
  const hash = manuscriptHash(book.chapters);
  const totalWords = book.chapters.reduce((sum, ch) => sum + countWords(ch.content), 0);

  let response: Response;
  try {
    response = await fetch('/api/ai/book-mind/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        chapters: book.chapters.map(c => ({
          id: c.id,
          title: c.title,
          content: c.content,
          type: c.type,
        })),
        title: book.title,
        author: book.author,
        genre: book.genre,
      }),
    });
  } catch (err) {
    return { ok: false, reason: 'http', error: err instanceof Error ? err.message : 'Network error' };
  }

  if (!response.ok || !response.body) {
    let errorText = `Brief generation failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) errorText = data.error;
    } catch { /* ignore */ }
    return { ok: false, reason: 'http', error: errorText };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const summaries: ChapterSummary[] = [];

  // Stream parser. The brief endpoint streams one JSON object per line
  // (NDJSON). We accumulate bytes, split on newlines, parse each line.
  // Malformed lines are skipped — the brief is best-effort, missing one
  // chapter summary doesn't invalidate the whole brief.
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.type === 'chapter' && parsed.summary) {
          const idx = summaries.length;
          const ch = book.chapters[idx];
          if (!ch) continue;
          const summary: ChapterSummary = {
            chapterId: ch.id,
            chapterIndex: idx,
            title: ch.title,
            type: ch.type,
            wordCount: countWords(ch.content),
            summary: String(parsed.summary?.summary ?? '').trim(),
            keyEntities: Array.isArray(parsed.summary?.keyEntities)
              ? parsed.summary.keyEntities.filter((e: unknown): e is string => typeof e === 'string')
              : [],
            openingLine: firstSentence(ch.content),
            closingLine: lastSentence(ch.content),
          };
          summaries.push(summary);
          onProgress?.([...summaries]);
        }
      } catch {
        // Skip malformed line — the brief is best-effort
      }
    }
  }

  // Pad summaries for any chapters the model skipped, so the brief always
  // has one entry per chapter (call sites assume one-to-one indexing).
  while (summaries.length < book.chapters.length) {
    const idx = summaries.length;
    const ch = book.chapters[idx];
    summaries.push({
      chapterId: ch.id,
      chapterIndex: idx,
      title: ch.title,
      type: ch.type,
      wordCount: countWords(ch.content),
      summary: '',
      keyEntities: [],
      openingLine: firstSentence(ch.content),
      closingLine: lastSentence(ch.content),
    });
  }

  const brief: ManuscriptBrief = {
    generatedAt: Date.now(),
    manuscriptHash: hash,
    totalWords,
    chapterSummaries: summaries,
  };

  return { ok: true, brief };
}

// Word count using the same loose split the rest of the editor uses.
// Cheap, off-by-one tolerant.
function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function firstSentence(text: string): string {
  if (!text) return '';
  const cleaned = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^.*?[.!?](?:\s|$)/);
  const sentence = (match?.[0] ?? cleaned).trim();
  return sentence.length > 200 ? sentence.slice(0, 200) + '…' : sentence;
}

function lastSentence(text: string): string {
  if (!text) return '';
  const cleaned = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  // Walk backwards from the end to find the start of the last sentence.
  // Cheap: split on sentence punctuation followed by a space.
  const parts = cleaned.split(/(?<=[.!?])\s+/);
  const last = (parts[parts.length - 1] ?? '').trim();
  return last.length > 200 ? last.slice(0, 200) + '…' : last;
}

// Used by Chapter type, but only this file needs it as a helper. Re-exported
// so the `Chapter` shape is available without importing `../types` everywhere.
export type { Chapter };
