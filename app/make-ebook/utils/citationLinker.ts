// Turn plain Book Mind responses into segmented text with clickable
// chapter citations.
//
// Book Mind streams natural prose like "In Chapter 14, the boy slips on
// algae scum…". We want every "Chapter 14" reference to render as a
// clickable pill that scrolls the editor to the right chapter and briefly
// highlights it. Doing this at render time on the client keeps the API
// route boring (no special tokens) and lets us re-resolve references if
// chapters get renamed.
//
// The linker is pure: it takes a string + a chapter index and returns an
// array of segments. Renderers (CardRenderer, ChatTab message bubble,
// ReadingView prose) can map over the segments and turn citations into
// CitationPill components.

import { Chapter } from '../types';

export type CitationSegment =
  | { type: 'text'; value: string }
  | { type: 'chapter'; chapterId: string; chapterIndex: number; label: string };

// Match patterns the model commonly produces when referencing chapters:
//   - "Chapter 14"
//   - "chapter 14"
//   - "Chapter 14:"
//   - "in Chapter 14,"
// We deliberately do NOT match standalone numbers because they create
// false positives ("3 characters", "page 12"). Title-based references
// ("the prologue", "the dedication") also resolve when the title is a
// distinctive single word — handled by buildTitleMatcher below.
const CHAPTER_NUMBER_PATTERN = /\b[Cc]hapter\s+(\d+)\b/g;

// Build a regex that matches any non-generic chapter title in the book.
// Generic titles like "Chapter", "Untitled", or empty strings are skipped
// so we don't pillify every appearance of the word "chapter".
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

// Walk the text once, collect every match (chapter-number and title),
// then stitch the segments back together. Segments are returned in
// document order. Overlapping matches are resolved by preferring the
// match that starts first; if two start at the same position, the longer
// one wins (so a title that contains the word "chapter" doesn't get
// split by the number pattern).
export function linkCitations(text: string, chapters: Chapter[]): CitationSegment[] {
  if (!text) return [];

  type Match = { start: number; end: number; chapterIndex: number; label: string };
  const matches: Match[] = [];

  // 1. Collect chapter-number matches
  for (const m of text.matchAll(CHAPTER_NUMBER_PATTERN)) {
    if (m.index === undefined) continue;
    const num = parseInt(m[1] ?? '', 10);
    if (Number.isNaN(num) || num < 1) continue;
    // Resolve "Chapter N" against content-type chapters in display order.
    // Only count chapters of type 'content' so that "Chapter 1" maps to
    // the first content chapter, not the prologue.
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

// Convenience: run linkCitations and join the text portions of the
// segments back together. Used in places where we want a quick check of
// whether a string contains any citations (e.g. should we render a
// CitationFooter?) without emitting React children.
export function hasCitations(text: string, chapters: Chapter[]): boolean {
  return linkCitations(text, chapters).some(s => s.type === 'chapter');
}
