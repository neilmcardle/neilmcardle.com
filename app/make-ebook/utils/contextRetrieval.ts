// Smart context retrieval for Book Mind.
//
// The user has explicitly prioritized speed of response over full-context
// fidelity. So instead of shipping the entire manuscript on every turn,
// we pre-compute a brief (one Haiku call per book, cached) and at query
// time we send only the chapters that are actually relevant to what the
// user is asking about.
//
// Retrieval is BM25-shaped, pure client-side, no embeddings. Authors ask
// questions that almost always mention distinctive nouns (characters,
// places, objects, scene markers), so keyword + entity overlap with the
// brief's chapterSummaries is a strong signal. Embeddings would help on
// abstract queries ("the moment everything changes") but those are rare
// and the deep-think escape hatch in the chat input handles them.
//
// Three tiers map to three Book Mind surfaces:
//   - Spotlight: selected text + immediate paragraph + brief (~2K)   → Cmd-K, ghost text
//   - Scene:     current chapter + brief + 1-2 retrieved chapters (~6-10K) → conversational chat
//   - Wide:      brief + top-N retrieved chapters by relevance (~8-15K)    → cross-chapter chat
//
// There is no "send the whole manuscript" tier in the live path. Whole-book
// analytical work goes through the pre-computed analytical cache instead.

import { Chapter, ManuscriptBrief, ChapterSummary } from '../types';

export type ContextTier = 'spotlight' | 'scene' | 'wide';

export interface RetrievedContext {
  tier: ContextTier;
  brief: ManuscriptBrief | null;
  currentChapter?: Chapter;
  retrievedChapters: Array<{ chapter: Chapter; reason: string; score: number }>;
  selectedText?: string;
  estimatedTokens: number;
}

// English stop-word list — short on purpose. The retrieval signal lives
// in distinctive nouns (character names, place names, objects), and
// trimming the obvious filler before scoring keeps the math simple and
// the budget tight. Not a comprehensive NLP-grade list; just enough to
// stop common words from dominating the score.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can',
  'could', 'did', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'he',
  'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'just', 'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our',
  'she', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then',
  'there', 'these', 'they', 'this', 'those', 'to', 'up', 'us', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'why', 'will',
  'with', 'would', 'you', 'your', 'about', 'after', 'again', 'all', 'any',
  'because', 'before', 'between', 'both', 'each', 'few', 'more', 'most',
  'other', 'over', 'own', 'same', 'such', 'through', 'under', 'very',
]);

// Pull distinctive tokens out of a query. Lowercases, strips punctuation,
// drops stop-words and very short tokens. Keeps capitalized words from the
// original (likely proper nouns) so the scorer can weight them higher.
function extractTokens(query: string): { all: string[]; proper: string[] } {
  const proper: string[] = [];
  // Capture sequences of capitalized words as proper-noun phrases first
  const properMatches = query.match(/\b[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)*/g) ?? [];
  for (const m of properMatches) proper.push(m.toLowerCase());

  const all = query
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  return { all, proper };
}

// Score a single chapter against a query. Higher = more relevant.
//   +5 per proper-noun match in keyEntities
//   +3 per regular keyword match in keyEntities
//   +2 per keyword match in summary
//   +1 per keyword match in opening/closing line
//   +1 per literal substring match in title
// The exact weights matter less than their order; the goal is to push the
// 1-2 chapters that are clearly about the topic to the top.
function scoreChapter(
  summary: ChapterSummary,
  query: { all: string[]; proper: string[] },
): number {
  let score = 0;

  const entitiesLower = summary.keyEntities.map(e => e.toLowerCase());
  const summaryLower = summary.summary.toLowerCase();
  const openLower = summary.openingLine.toLowerCase();
  const closeLower = summary.closingLine.toLowerCase();
  const titleLower = (summary.title || '').toLowerCase();

  for (const p of query.proper) {
    if (entitiesLower.some(e => e.includes(p) || p.includes(e))) score += 5;
    if (summaryLower.includes(p)) score += 2;
    if (titleLower.includes(p)) score += 2;
  }

  for (const k of query.all) {
    if (entitiesLower.some(e => e === k || e.includes(k))) score += 3;
    if (summaryLower.includes(k)) score += 2;
    if (openLower.includes(k) || closeLower.includes(k)) score += 1;
    if (titleLower.includes(k)) score += 1;
  }

  return score;
}

// Cheap token estimate. Anthropic counts ~4 chars per token on English
// prose; we use 4 to budget conservatively. Used to decide when to stop
// retrieving more chapters. Not exact; never used to bill anything.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Pick the top-N chapters that match the query, keeping under a token
// budget. Always includes any chapter scoring above zero, ranked by
// score, until budget runs out. Returns the chapters with their reason
// (which entity matched) so the UI can show "reading chapter 14 because
// it mentions R." in the streaming progress channel.
function selectChapters(
  brief: ManuscriptBrief,
  chapters: Chapter[],
  query: { all: string[]; proper: string[] },
  excludeChapterId: string | undefined,
  budgetTokens: number,
  maxChapters: number,
): Array<{ chapter: Chapter; reason: string; score: number }> {
  type Scored = { chapter: Chapter; summary: ChapterSummary; score: number; reason: string };
  const scored: Scored[] = [];

  for (const summary of brief.chapterSummaries) {
    if (summary.chapterId === excludeChapterId) continue;
    const score = scoreChapter(summary, query);
    if (score <= 0) continue;
    const chapter = chapters.find(c => c.id === summary.chapterId);
    if (!chapter) continue;
    const reason = pickReason(summary, query);
    scored.push({ chapter, summary, score, reason });
  }

  scored.sort((a, b) => b.score - a.score);

  const picked: Array<{ chapter: Chapter; reason: string; score: number }> = [];
  let used = 0;
  for (const s of scored) {
    if (picked.length >= maxChapters) break;
    const cost = estimateTokens(s.chapter.content);
    if (used + cost > budgetTokens && picked.length > 0) break;
    picked.push({ chapter: s.chapter, reason: s.reason, score: s.score });
    used += cost;
  }
  return picked;
}

function pickReason(summary: ChapterSummary, query: { all: string[]; proper: string[] }): string {
  for (const p of query.proper) {
    const hit = summary.keyEntities.find(e => e.toLowerCase().includes(p));
    if (hit) return `mentions ${hit}`;
  }
  for (const k of query.all) {
    const hit = summary.keyEntities.find(e => e.toLowerCase() === k);
    if (hit) return `mentions ${hit}`;
  }
  return 'matches your question';
}

// Build a Spotlight context: the smallest tier. Used for Cmd-K inline
// edits, ghost text completion, and grammar nits where the model only
// needs the selection plus its immediate surrounding sentence to do the
// job. Every other piece of context (brief, chapter index) is dropped to
// keep the call sub-second.
export function buildSpotlightContext(args: {
  brief: ManuscriptBrief | null;
  selectedText: string;
  surroundingParagraph?: string;
}): RetrievedContext {
  const text = (args.surroundingParagraph ?? args.selectedText) || '';
  return {
    tier: 'spotlight',
    brief: args.brief,
    retrievedChapters: [],
    selectedText: args.selectedText,
    estimatedTokens: estimateTokens(text) + (args.brief ? 200 : 0),
  };
}

// Build a Scene context: current chapter (in full) + brief + 0-1
// retrieved chapters from elsewhere if the query mentions them. Used for
// conversational chat when the author is asking about their current
// chapter or a scene-level question. Token budget targets 6-10K.
export function buildSceneContext(args: {
  brief: ManuscriptBrief | null;
  chapters: Chapter[];
  currentChapterId: string | undefined;
  query: string;
  selectedText?: string;
}): RetrievedContext {
  const tokens = extractTokens(args.query);
  const currentChapter = args.chapters.find(c => c.id === args.currentChapterId) ?? args.chapters[0];

  const retrieved =
    args.brief && args.chapters.length > 1
      ? selectChapters(
          args.brief,
          args.chapters,
          tokens,
          currentChapter?.id,
          /* budgetTokens */ 4000,
          /* maxChapters */ 1,
        )
      : [];

  return {
    tier: 'scene',
    brief: args.brief,
    currentChapter,
    retrievedChapters: retrieved,
    selectedText: args.selectedText,
    estimatedTokens:
      estimateTokens(currentChapter?.content ?? '') +
      retrieved.reduce((sum, r) => sum + estimateTokens(r.chapter.content), 0) +
      (args.brief ? 1000 : 0),
  };
}

// Build a Wide context: brief + top-N retrieved chapters across the
// whole manuscript. Used for cross-chapter chat ("where does the boy
// slip on algae scum?"). Token budget targets 8-15K. If the brief is
// missing (book just opened, brief still generating), falls back to the
// first few chapters by index.
export function buildWideContext(args: {
  brief: ManuscriptBrief | null;
  chapters: Chapter[];
  query: string;
  selectedText?: string;
}): RetrievedContext {
  const tokens = extractTokens(args.query);

  // No brief yet: cold start. Send the first few chapters by index so we
  // have *some* grounding. The brief will be ready by the next turn.
  if (!args.brief) {
    const fallback = args.chapters.slice(0, 3).map(chapter => ({
      chapter,
      reason: 'manuscript brief still generating',
      score: 0,
    }));
    return {
      tier: 'wide',
      brief: null,
      retrievedChapters: fallback,
      selectedText: args.selectedText,
      estimatedTokens: fallback.reduce((sum, r) => sum + estimateTokens(r.chapter.content), 0),
    };
  }

  const retrieved = selectChapters(
    args.brief,
    args.chapters,
    tokens,
    /* exclude */ undefined,
    /* budgetTokens */ 12000,
    /* maxChapters */ 6,
  );

  // If retrieval missed entirely (no entity matches), fall back to the
  // first chapter and the most recent chapter so we have grounding.
  if (retrieved.length === 0 && args.chapters.length > 0) {
    const first = args.chapters[0];
    const last = args.chapters[args.chapters.length - 1];
    if (first) retrieved.push({ chapter: first, reason: 'opening of the book', score: 0 });
    if (last && last.id !== first?.id) retrieved.push({ chapter: last, reason: 'most recent chapter', score: 0 });
  }

  return {
    tier: 'wide',
    brief: args.brief,
    retrievedChapters: retrieved,
    selectedText: args.selectedText,
    estimatedTokens:
      retrieved.reduce((sum, r) => sum + estimateTokens(r.chapter.content), 0) +
      (args.brief ? 1500 : 0),
  };
}

// Decide which tier a chat query should run at. Heuristic: if the query
// mentions distinctive proper nouns and the current chapter doesn't
// contain them, escalate to Wide. Otherwise stay in Scene. Spotlight is
// only invoked explicitly by Cmd-K and ghost-text surfaces, never auto-
// selected from a chat input.
export function pickContextTier(args: {
  query: string;
  currentChapter: Chapter | undefined;
}): 'scene' | 'wide' {
  const tokens = extractTokens(args.query);
  if (tokens.proper.length === 0 && tokens.all.length < 3) return 'scene';
  if (!args.currentChapter) return 'wide';

  const currentLower = args.currentChapter.content.toLowerCase();
  const matchedInCurrent =
    tokens.proper.some(p => currentLower.includes(p)) ||
    tokens.all.some(k => currentLower.includes(k));

  return matchedInCurrent ? 'scene' : 'wide';
}

// Render a retrieved context as the system-prompt block that gets sent to
// the model. Includes the brief (always), the current chapter (if any),
// and the retrieved chapters. The model sees this as plain text — no
// metadata channel, no XML tags beyond simple === markers.
export function renderContextForPrompt(ctx: RetrievedContext): string {
  const sections: string[] = [];

  // Only include the brief if we have retrieved chapters or a
  // non-spotlight tier. For spotlight (Cmd-K, ghost text) and light
  // (meta questions), the brief adds tokens without grounding value
  // since the model already has the specific text it needs.
  const includeBrief = ctx.brief && (
    ctx.tier === 'scene' || ctx.tier === 'wide' || ctx.retrievedChapters.length > 0
  );

  if (includeBrief && ctx.brief) {
    const briefBlock = ctx.brief.chapterSummaries
      .map(s => {
        const entities = s.keyEntities.length > 0 ? ` · ${s.keyEntities.join(', ')}` : '';
        return `${s.chapterIndex + 1}. [${s.type}] ${s.title || `Chapter ${s.chapterIndex + 1}`} (${s.wordCount.toLocaleString()} words${entities})\n   ${s.summary}`;
      })
      .join('\n\n');
    sections.push(`=== MANUSCRIPT BRIEF (all ${ctx.brief.chapterSummaries.length} chapters) ===\n${briefBlock}\n=== END BRIEF ===`);
  }

  if (ctx.selectedText) {
    sections.push(`=== AUTHOR SELECTION ===\n"""\n${ctx.selectedText}\n"""\n=== END SELECTION ===`);
  }

  if (ctx.currentChapter) {
    sections.push(`=== CURRENTLY OPEN CHAPTER (full text) ===\n[${ctx.currentChapter.type.toUpperCase()}] ${ctx.currentChapter.title || 'Untitled'}\n${ctx.currentChapter.content}\n=== END ===`);
  }

  if (ctx.retrievedChapters.length > 0) {
    const block = ctx.retrievedChapters
      .map(r => {
        return `[${r.chapter.type.toUpperCase()}] ${r.chapter.title || 'Untitled'} (retrieved: ${r.reason})\n${r.chapter.content}`;
      })
      .join('\n\n---\n\n');
    sections.push(`=== RETRIEVED CHAPTERS ===\n${block}\n=== END RETRIEVED ===`);
  }

  return sections.join('\n\n');
}
