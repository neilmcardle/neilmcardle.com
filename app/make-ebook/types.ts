export type Chapter = {
  id: string;
  title: string;
  content: string;
  type: 'frontmatter' | 'content' | 'backmatter';
  locked?: boolean;
};

export type Endnote = {
  id: string;
  number: number;
  content: string;
  sourceChapterId?: string;
  sourceText?: string;
};

export type EndnoteReference = {
  id: string;
  number: number;
  chapterId: string;
  endnoteId: string;
};

// Reorganized with most common selections at the top
export const CHAPTER_TEMPLATES = {
  common: [
    { title: 'Chapter', description: 'A main content chapter', type: 'content' as const },
    { title: 'Preface', description: 'An introduction by the author', type: 'frontmatter' as const },
    { title: 'Introduction', description: 'An opening section', type: 'frontmatter' as const },
    { title: 'Epilogue', description: 'A concluding section', type: 'backmatter' as const },
  ],
  frontmatter: [
    { title: 'Dedication', description: 'A personal dedication' },
    { title: 'Acknowledgments', description: 'Thank you to contributors' },
    { title: 'Foreword', description: 'An introduction by someone else' },
    { title: 'Prologue', description: 'A preliminary section' },
    { title: 'Custom Front Matter', description: 'Create your own front matter chapter' },
  ],
  content: [
    { title: 'Part', description: 'A major section or part' },
    { title: 'Custom Chapter', description: 'Create your own chapter' },
  ],
  backmatter: [
    { title: 'Endnotes', description: 'Notes and references' },
    { title: 'Bibliography', description: 'List of sources' },
    { title: 'Glossary', description: 'Definitions of terms' },
    { title: 'Index', description: 'Alphabetical list of topics' },
    { title: 'Appendix', description: 'Additional information' },
    { title: 'About the Author', description: 'Author biography' },
    { title: 'Custom Back Matter', description: 'Create your own back matter chapter' },
  ],
} as const;

export interface BookData {
  title: string;
  author: string;
  isbn: string;
  cover: string | null;
  chapters: Chapter[];
  endnotes?: Endnote[];
  endnoteReferences?: EndnoteReference[];
}

export interface BookMetadata {
  title: string;
  author: string;
  blurb: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  language: string;
  genre: string;
}

export interface BookRecord extends BookMetadata {
  id: string;
  chapters: Chapter[];
  tags: string[];
  coverFile: string | null;
  endnotes: Endnote[];
  endnoteReferences: EndnoteReference[];
  savedAt: number;
  // Speed-first Book Mind state. All optional so legacy books continue to
  // load without migration. Generated and refreshed by Book Mind itself,
  // never written by the editor directly. See app/make-ebook/utils/
  // bookmindMemory.ts for read/write helpers.
  bookmindMemory?: BookMindMemory;
}

// ─── Book Mind data shapes ───────────────────────────────────────────────────
//
// The brain of Book Mind lives on the BookRecord itself rather than in a
// parallel store. One source of truth, one localStorage key (the existing
// book library), one hash to invalidate when chapters change. This keeps
// the data model boring and the UI fast: opening a book pulls everything
// Book Mind needs in a single read.
//
// Sizes (worst case for a 200K-word novel):
//   - brief.chapterSummaries:  ~50 chapters × ~400 chars = ~20 KB
//   - analytical caches × 5:   ~30 KB total
//   - rules / characters / decisions: kilobytes, not megabytes
// Total: well under the 5 MB localStorage ceiling per book.

export interface BookMindMemory {
  // Pre-computed manuscript brief — the spine of every fast retrieval.
  // Generated once on book open by a single Haiku call, refreshed in the
  // background after edits settle. Used by every Book Mind surface to
  // ground answers without re-shipping the whole manuscript.
  brief?: ManuscriptBrief;

  // Cached results for analytical actions (themes, characters,
  // inconsistencies, pacing, word frequency). Populated in the background
  // by Sonnet calls with prompt caching, never re-run unless the
  // manuscript hash changes or the user explicitly hits Refresh.
  analytical?: AnalyticalCache;

  // Persistent per-book user-facing memory — the things the author has
  // told Book Mind to remember. Injected into every system prompt.
  rules: string[];
  characters: Record<string, string>;
  decisions: Array<{ date: number; note: string }>;

  // Issues the author has dismissed so they don't reappear on re-analysis.
  dismissedIssueIds?: string[];
}

export interface ManuscriptBrief {
  generatedAt: number;
  manuscriptHash: string;
  totalWords: number;
  chapterSummaries: ChapterSummary[];
}

export interface ChapterSummary {
  chapterId: string;
  chapterIndex: number;
  title: string;
  type: Chapter['type'];
  wordCount: number;
  summary: string;        // 2-3 sentences of what happens
  keyEntities: string[];  // characters, places, objects mentioned
  openingLine: string;
  closingLine: string;
}

// Cached analytical results, one entry per analytical action type.
// Each entry stores the manuscript hash it was generated from, so we can
// detect staleness without comparing payloads.
export interface AnalyticalCache {
  themes?: AnalyticalCacheEntry;
  characters?: AnalyticalCacheEntry;
  inconsistencies?: AnalyticalCacheEntry;
  pacing?: AnalyticalCacheEntry;
  wordFrequency?: AnalyticalCacheEntry;
}

export interface AnalyticalCacheEntry {
  generatedAt: number;
  manuscriptHash: string;
  payload: AnalyticalResponse;
}

// Structured-output schema that analytical Book Mind calls return. Renders
// to scannable cards in the Inspector tabs, never to essay markdown. Each
// card has the claim, an optional grounding quote, and an optional chapter
// reference that resolves to a citation pill.
export interface AnalyticalResponse {
  headline: string;
  summary?: string;
  cards: AnalyticalCard[];
}

export interface AnalyticalCard {
  type: 'theme' | 'character' | 'inconsistency' | 'pacing' | 'note';
  title: string;
  claim: string;
  quote?: string;
  chapterId?: string;
  chapterLabel?: string;
  body: string;
}