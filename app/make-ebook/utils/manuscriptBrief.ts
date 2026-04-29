import { BookRecord, ManuscriptBrief, ChapterSummary, Chapter } from '../types';
import { manuscriptHash, isBriefFresh, setBrief } from './bookmindMemory';

export interface GenerateBriefResult {
  ok: boolean;
  brief?: ManuscriptBrief;
  error?: string;
  reason?: 'fresh' | 'no-chapters' | 'in-flight' | 'http' | 'parse';
}

const inFlight = new Map<string, Promise<GenerateBriefResult>>();

// Idempotent: returns immediately if fresh, joins in-flight, or kicks off new.
export async function ensureManuscriptBrief(args: {
  userId: string;
  book: BookRecord;
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

  // Best-effort NDJSON parse: malformed lines are skipped.
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
        // Skip malformed line
      }
    }
  }

  // Pad to one summary per chapter so callers can index 1:1.
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
  const parts = cleaned.split(/(?<=[.!?])\s+/);
  const last = (parts[parts.length - 1] ?? '').trim();
  return last.length > 200 ? last.slice(0, 200) + '…' : last;
}

export type { Chapter };
