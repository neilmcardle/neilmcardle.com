export type Chapter = {
  id: string;
  title: string;
  content: string;
  type: "frontmatter" | "content" | "backmatter";
  locked?: boolean;
  completed?: boolean;
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

export const CHAPTER_TEMPLATES = {
  common: [
    {
      title: "Chapter",
      description: "A main content chapter",
      type: "content" as const,
    },
    {
      title: "Preface",
      description: "An introduction by the author",
      type: "frontmatter" as const,
    },
    {
      title: "Introduction",
      description: "An opening section",
      type: "frontmatter" as const,
    },
    {
      title: "Epilogue",
      description: "A concluding section",
      type: "backmatter" as const,
    },
  ],
  frontmatter: [
    { title: "Dedication", description: "A personal dedication" },
    { title: "Acknowledgments", description: "Thank you to contributors" },
    { title: "Foreword", description: "An introduction by someone else" },
    { title: "Prologue", description: "A preliminary section" },
    {
      title: "Custom Front Matter",
      description: "Create your own front matter chapter",
    },
  ],
  content: [
    { title: "Part", description: "A major section or part" },
    { title: "Custom Chapter", description: "Create your own chapter" },
  ],
  backmatter: [
    { title: "Endnotes", description: "Notes and references" },
    { title: "Bibliography", description: "List of sources" },
    { title: "Glossary", description: "Definitions of terms" },
    { title: "Index", description: "Alphabetical list of topics" },
    { title: "Appendix", description: "Additional information" },
    { title: "About the Author", description: "Author biography" },
    {
      title: "Custom Back Matter",
      description: "Create your own back matter chapter",
    },
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

  bookmindMemory?: BookMindMemory;
}

export interface BookMindMemory {
  brief?: ManuscriptBrief;

  analytical?: AnalyticalCache;

  profile?: BookProfile;

  rules: string[];
  characters: Record<string, string>;
  decisions: Array<{ date: number; note: string }>;

  dismissedIssueIds?: string[];
}

export interface ProfileCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  source: "auto" | "user";
}

export interface ProfileLocation {
  id: string;
  name: string;
  description: string;
  source: "auto" | "user";
}

export interface ProfileStyle {
  pov: string;
  tense: string;
  tone: string;
}

export interface BookProfile {
  generatedAt: number;
  manuscriptHash: string;
  characters: ProfileCharacter[];
  locations: ProfileLocation[];
  style: ProfileStyle;
  keyFacts: string[];
  writingRules: string[];
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
  type: Chapter["type"];
  wordCount: number;
  summary: string;
  keyEntities: string[];
  openingLine: string;
  closingLine: string;
}

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

export interface AnalyticalResponse {
  headline: string;
  summary?: string;
  cards: AnalyticalCard[];
}

export interface AnalyticalCard {
  type: "theme" | "character" | "inconsistency" | "pacing" | "note";
  title: string;
  claim: string;
  quote?: string;
  chapterId?: string;
  chapterLabel?: string;
  body: string;
}
