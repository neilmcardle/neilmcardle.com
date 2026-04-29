// Background analytical-cache generator. Calls run sequentially so the
// prompt-cache stays warm between kinds. Results are persisted client-side
// and consumed by the Inspector tabs on render.

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
