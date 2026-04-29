import { Chapter } from '../types';

export type CitationSegment =
  | { type: 'text'; value: string }
  | { type: 'chapter'; chapterId: string; chapterIndex: number; label: string };

// Matches "Chapter N" forms but not standalone numbers (avoids false positives).
const CHAPTER_NUMBER_PATTERN = /\b[Cc]hapter\s+(\d+)\b/g;

function buildTitleMatcher(chapters: Chapter[]): { regex: RegExp | null; titleToIndex: Map<string, number> } {
  const titleToIndex = new Map<string, number>();
  const titles: string[] = [];
  chapters.forEach((ch, i) => {
    const t = (ch.title || '').trim();
    if (!t) return;
    if (/^chapter$/i.test(t)) return;
    if (/^untitled/i.test(t)) return;
    if (t.length < 4) return;            // too short → false positive risk
    if (titleToIndex.has(t.toLowerCase())) return; // dedupe
    titleToIndex.set(t.toLowerCase(), i);
    titles.push(t);
  });
  if (titles.length === 0) return { regex: null, titleToIndex };
  // Escape regex special chars in titles
  const escaped = titles
    .sort((a, b) => b.length - a.length) // prefer longer titles first
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return {
    regex: new RegExp(`\\b(${escaped.join('|')})\\b`, 'g'),
    titleToIndex,
  };
}

export function linkCitations(text: string, chapters: Chapter[]): CitationSegment[] {
  if (!text) return [];

  type Match = { start: number; end: number; chapterIndex: number; label: string };
  const matches: Match[] = [];

  // 1. Collect chapter-number matches
  for (const m of text.matchAll(CHAPTER_NUMBER_PATTERN)) {
    if (m.index === undefined) continue;
    const num = parseInt(m[1] ?? '', 10);
    if (Number.isNaN(num) || num < 1) continue;
    // "Chapter N" maps to the Nth content-type chapter in display order.
    const contentChapters = chapters.filter(c => c.type === 'content');
    const target = contentChapters[num - 1];
    if (!target) continue;
    const realIndex = chapters.indexOf(target);
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      chapterIndex: realIndex,
      label: m[0],
    });
  }

  // 2. Collect title matches
  const { regex: titleRegex, titleToIndex } = buildTitleMatcher(chapters);
  if (titleRegex) {
    for (const m of text.matchAll(titleRegex)) {
      if (m.index === undefined) continue;
      const idx = titleToIndex.get(m[1].toLowerCase());
      if (idx === undefined) continue;
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        chapterIndex: idx,
        label: m[0],
      });
    }
  }

  if (matches.length === 0) return [{ type: 'text', value: text }];

  // 3. Sort by start (then by length desc) and dedupe overlaps
  matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const accepted: Match[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue; // overlap, skip
    accepted.push(m);
    cursor = m.end;
  }

  // 4. Stitch segments
  const segments: CitationSegment[] = [];
  let pos = 0;
  for (const m of accepted) {
    if (m.start > pos) {
      segments.push({ type: 'text', value: text.slice(pos, m.start) });
    }
    const chapter = chapters[m.chapterIndex];
    segments.push({
      type: 'chapter',
      chapterId: chapter?.id ?? '',
      chapterIndex: m.chapterIndex,
      label: m.label,
    });
    pos = m.end;
  }
  if (pos < text.length) {
    segments.push({ type: 'text', value: text.slice(pos) });
  }
  return segments;
}

export function hasCitations(text: string, chapters: Chapter[]): boolean {
  return linkCitations(text, chapters).some(s => s.type === 'chapter');
}
