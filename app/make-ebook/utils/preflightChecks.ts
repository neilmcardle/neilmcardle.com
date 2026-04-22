// Deterministic KDP pre-flight checks. Pure — no API calls, no state.
// Shared between PreflightTab (Inspector surface) and PreflightExportDialog
// (export-time gate). Returning the raw totals alongside the bucketed lists
// lets callers show an "X passing, Y warnings" summary without re-counting.

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
  chapters: Array<{ content: string }>;
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

export function runPreflightChecks(input: PreflightInput): PreflightResult {
  const { title, author, chapters, coverFile, language, genre } = input;

  const totalWords = chapters.reduce((sum, ch) => {
    return sum + ch.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const titleTrim = title?.trim();
  const titleOk = !!titleTrim && !PLACEHOLDER_TITLES.has(titleTrim.toLowerCase());

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
