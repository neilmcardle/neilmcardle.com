// Background analytical cache generator.
//
// Called on book open for Pro users, after the manuscript brief is
// ready. Checks each analytical kind (themes, characters,
// inconsistencies, pacing, wordFrequency) and regenerates any whose
// manuscriptHash doesn't match the current chapters. Fresh entries
// are skipped, so a second call is essentially free.
//
// Each kind fires a separate API call. Calls run sequentially (not in
// parallel) to benefit from Anthropic's prompt caching: the manuscript
// block is cached on the first call and subsequent calls within 5
// minutes pay 10% input cost. Sequential ordering means the cache is
// always warm for call 2–5.
//
// Results are stored in bookmindMemory.analytical via the setAnalytical
// helper. The Inspector tabs read from there on every render, so the
// moment a kind completes it's visible in the UI without a separate
// fetch or re-render trigger — React state flows from localStorage
// reads in the hook.

import { BookRecord, AnalyticalResponse } from '../types';
import {
  manuscriptHash,
  isAnalyticalFresh,
  setAnalytical,
  AnalyticalKind,
} from './bookmindMemory';

const KINDS: AnalyticalKind[] = [
  'themes',
  'characters',
  'inconsistencies',
  'pacing',
  'wordFrequency',
];

export interface AnalyticalCacheProgress {
  kind: AnalyticalKind;
  status: 'generating' | 'done' | 'error';
  error?: string;
}

// In-flight tracker so duplicate calls (e.g. from React strict mode
// double-mount or rapid tab switches) don't spawn parallel runs.
let inFlight: Promise<void> | null = null;

export async function ensureAnalyticalCache(args: {
  userId: string;
  book: BookRecord;
  onProgress?: (progress: AnalyticalCacheProgress) => void;
}): Promise<void> {
  if (inFlight) return inFlight;

  const promise = (async () => {
    const { userId, book, onProgress } = args;
    const hash = manuscriptHash(book.chapters);

    for (const kind of KINDS) {
      // Skip if the cache entry is fresh (hash matches current chapters).
      if (isAnalyticalFresh(book, kind)) continue;

      onProgress?.({ kind, status: 'generating' });

      try {
        const response = await fetch('/api/ai/book-mind/analytical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            kind,
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

        if (!response.ok) {
          let errorText = `Analysis failed (${response.status})`;
          try {
            const data = await response.json();
            if (data?.error) errorText = data.error;
          } catch { /* ignore */ }
          onProgress?.({ kind, status: 'error', error: errorText });
          continue;
        }

        // Accumulate the streamed response and parse at the end.
        const reader = response.body?.getReader();
        if (!reader) {
          onProgress?.({ kind, status: 'error', error: 'No response body' });
          continue;
        }

        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
        }

        const parsed = extractAnalyticalResponse(full);
        if (!parsed) {
          onProgress?.({ kind, status: 'error', error: 'Could not parse response' });
          continue;
        }

        setAnalytical(userId, book.id, kind, parsed, hash);
        onProgress?.({ kind, status: 'done' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        onProgress?.({ kind, status: 'error', error: message });
      }
    }
  })();

  inFlight = promise;
  try {
    await promise;
  } finally {
    inFlight = null;
  }
}

// Best-effort JSON extraction for analytical responses. Same shape as
// the refine endpoint's parser: try the whole string first, then scan
// for the first { ... } span.
function extractAnalyticalResponse(text: string): AnalyticalResponse | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (isAnalyticalShape(parsed)) return parsed;
  } catch { /* fall through */ }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    const parsed = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    if (isAnalyticalShape(parsed)) return parsed;
  } catch { /* fall through */ }

  return null;
}

function isAnalyticalShape(obj: unknown): obj is AnalyticalResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as AnalyticalResponse).headline === 'string' &&
    Array.isArray((obj as AnalyticalResponse).cards)
  );
}
