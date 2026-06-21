export type CheckStatus = "pass" | "warn" | "block";

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
}

export interface PreflightInput {
  title: string | undefined;
  author: string | undefined;
  chapters: Array<{ content: string; type?: string }>;
  coverFile: string | null | undefined;
  language?: string;
  genre?: string;
}

export interface PreflightResult {
  checks: CheckResult[];
  blocks: CheckResult[];
  warns: CheckResult[];
  passes: CheckResult[];
  allClear: boolean;
  totalWords: number;
}

const PLACEHOLDER_TITLES = new Set(["untitled", "pasted manuscript", "untitled book"]);

const NOVEL_KEYWORDS = ["novel", "fiction", "romance", "thriller", "mystery", "fantasy", "sci-fi", "science fiction", "horror", "literary fiction"];
const SHORT_FORM_KEYWORDS = ["short story", "short stories", "flash fiction", "novella"];

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function runPreflightChecks(input: PreflightInput): PreflightResult {
  const { title, author, chapters, coverFile, language, genre } = input;

  const totalWords = chapters.reduce((sum, ch) => {
    return sum + ch.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const titleTrim = title?.trim();
  const titleOk = !!titleTrim && !PLACEHOLDER_TITLES.has(titleTrim.toLowerCase());

  // Uniform chapter length check — only content chapters, need at least 5
  const contentChapters = chapters.filter(ch => !ch.type || ch.type === 'content');
  const contentWordCounts = contentChapters.map(ch =>
    ch.content.trim().split(/\s+/).filter(Boolean).length
  );

  let uniformChaptersCheck: CheckResult | null = null;
  if (contentChapters.length >= 5 && contentWordCounts.every(c => c > 0)) {
    const mean = contentWordCounts.reduce((a, b) => a + b, 0) / contentWordCounts.length;
    const cv = mean > 0 ? stddev(contentWordCounts) / mean : 0;
    if (cv < 0.15) {
      uniformChaptersCheck = {
        id: "chapter-uniformity",
        label: "Chapter length variation",
        status: "warn",
        message: `All ${contentChapters.length} chapters are nearly the same length (${Math.round(mean).toLocaleString()} words ±${Math.round(cv * 100)}%). Uniform chapter lengths are a common AI generation pattern that Amazon's spam filter may flag.`,
      };
    }
  }

  // Genre-plausible word count check
  let genrePlausibilityCheck: CheckResult | null = null;
  const genreLower = genre?.trim().toLowerCase() ?? '';
  if (genreLower) {
    const isNovelGenre = NOVEL_KEYWORDS.some(k => genreLower.includes(k));
    const isShortForm = SHORT_FORM_KEYWORDS.some(k => genreLower.includes(k));
    if (isNovelGenre && !isShortForm && totalWords < 40000 && totalWords >= 2500) {
      genrePlausibilityCheck = {
        id: "genre-word-count",
        label: "Word count for genre",
        status: "warn",
        message: `${totalWords.toLocaleString()} words is short for a ${genre}. Most novels on KDP are 50,000+ words — shorter books may be miscategorised as pamphlets.`,
      };
    }
  }

  const checks: CheckResult[] = [
    {
      id: "word-count",
      label: "Word count",
      status: totalWords >= 2500 ? "pass" : "block",
      message: totalWords >= 2500
        ? `${totalWords.toLocaleString()} words. Above the 2,500-word KDP minimum.`
        : `${totalWords.toLocaleString()} words. Amazon requires at least 2,500 words for eBooks.`,
    },
    {
      id: "title",
      label: "Title",
      status: titleOk ? "pass" : "block",
      message: titleTrim ? `"${title}"` : "No title set. Amazon requires a title.",
    },
    {
      id: "author",
      label: "Author",
      status: author?.trim() ? "pass" : "block",
      message: author?.trim() ? `${author}` : "No author name set.",
    },
    {
      id: "cover",
      label: "Cover image",
      status: coverFile ? "pass" : "warn",
      message: coverFile
        ? "Cover image attached."
        : "No cover image. Strongly recommended for KDP listings.",
    },
    {
      id: "language",
      label: "Language",
      status: language?.trim() ? "pass" : "warn",
      message: language?.trim()
        ? `${language}`
        : "No language set. Recommended for metadata completeness.",
    },
    {
      id: "genre",
      label: "Genre",
      status: genre?.trim() ? "pass" : "warn",
      message: genre?.trim()
        ? `${genre}`
        : "No genre set. Helps Amazon categorize your book.",
    },
    {
      id: "chapters",
      label: "Chapter count",
      status: chapters.length >= 1 ? "pass" : "block",
      message: `${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"}.`,
    },
    ...(uniformChaptersCheck ? [uniformChaptersCheck] : []),
    ...(genrePlausibilityCheck ? [genrePlausibilityCheck] : []),
  ];

  const blocks = checks.filter(c => c.status === "block");
  const warns = checks.filter(c => c.status === "warn");
  const passes = checks.filter(c => c.status === "pass");

  return {
    checks,
    blocks,
    warns,
    passes,
    allClear: blocks.length === 0,
    totalWords,
  };
}
