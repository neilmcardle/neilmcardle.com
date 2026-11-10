"use client";

import mammoth from "mammoth";
import DOMPurify from "dompurify";

export interface ParsedChapter {
  title: string;
  content: string;
  type: "frontmatter" | "content" | "backmatter";
}

export interface ParsedBook {
  title: string;
  author: string;
  chapters: ParsedChapter[];
}

const CHAPTER_PATTERNS = [
  /^chapter\s*(\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)[\s:.\-–—]*(.*)?$/i,

  /^chapter[\s:.\-–—]+(.+)$/i,
  /^part\s*(\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten)[\s:.\-–—]*(.*)?$/i,
  /^section\s*(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)?$/i,
  /^prologue[\s:.\-–—]*(.*)?$/i,
  /^epilogue[\s:.\-–—]*(.*)?$/i,
  /^introduction[\s:.\-–—]*(.*)?$/i,
  /^foreword[\s:.\-–—]*(.*)?$/i,
  /^preface[\s:.\-–—]*(.*)?$/i,
  /^acknowledgements?[\s:.\-–—]*(.*)?$/i,
  /^dedication[\s:.\-–—]*(.*)?$/i,
  /^afterword[\s:.\-–—]*(.*)?$/i,
  /^appendix[\s:.\-–—]*([a-z]|\d+)?[\s:.\-–—]*(.*)?$/i,
  /^glossary[\s:.\-–—]*(.*)?$/i,
  /^bibliography[\s:.\-–—]*(.*)?$/i,
  /^about\s+the\s+author[\s:.\-–—]*(.*)?$/i,
  /^notes[\s:.\-–—]*(.*)?$/i,

  /^(\d{1,2})[\s:.\-–—]+(.+)$/,

  /^([ivxlcdm]+)[\s:.\-–—]+(.+)$/i,
];

const FRONTMATTER_TITLES = [
  "prologue",
  "introduction",
  "foreword",
  "preface",
  "acknowledgements",
  "acknowledgments",
  "dedication",
  "title page",
  "copyright",
];

const BACKMATTER_TITLES = [
  "epilogue",
  "afterword",
  "appendix",
  "glossary",
  "bibliography",
  "about the author",
  "notes",
  "index",
];

function determineChapterType(
  title: string,
): "frontmatter" | "content" | "backmatter" {
  const lowerTitle = title.toLowerCase();

  if (FRONTMATTER_TITLES.some((fm) => lowerTitle.includes(fm))) {
    return "frontmatter";
  }

  if (BACKMATTER_TITLES.some((bm) => lowerTitle.includes(bm))) {
    return "backmatter";
  }

  return "content";
}

function isChapterTitle(line: string): boolean {
  const trimmed = line.trim();
  return CHAPTER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function extractChapterTitle(line: string): string {
  const trimmed = line.trim();

  for (const pattern of CHAPTER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return trimmed;
    }
  }

  return trimmed;
}

function splitIntoChapters(text: string): ParsedChapter[] {
  const lines = text.split(/\n/);
  const chapters: ParsedChapter[] = [];
  let currentChapter: ParsedChapter | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (isChapterTitle(trimmed)) {
      if (currentChapter || contentLines.length > 0) {
        const content = contentLines.join("\n").trim();
        if (currentChapter) {
          currentChapter.content = formatContentAsHtml(content);
          chapters.push(currentChapter);
        } else if (content) {
          chapters.push({
            title: "Introduction",
            content: formatContentAsHtml(content),
            type: "frontmatter",
          });
        }
      }

      const title = extractChapterTitle(trimmed);
      currentChapter = {
        title,
        content: "",
        type: determineChapterType(title),
      };
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }

  if (currentChapter || contentLines.length > 0) {
    const content = contentLines.join("\n").trim();
    if (currentChapter) {
      currentChapter.content = formatContentAsHtml(content);
      chapters.push(currentChapter);
    } else if (content) {
      chapters.push({
        title: "Chapter 1",
        content: formatContentAsHtml(content),
        type: "content",
      });
    }
  }

  return chapters;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatContentAsHtml(text: string): string {
  if (!text) return "";

  const paragraphs = text.split(/\n\s*\n/);

  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";

      const normalized = escapeHtml(
        trimmed.replace(/\n/g, " ").replace(/\s+/g, " "),
      );
      return `<p>${normalized}</p>`;
    })
    .filter((p) => p)
    .join("\n");
}

export async function parseTextFile(file: File): Promise<ParsedBook> {
  const text = await file.text();
  const chapters = splitIntoChapters(text);

  const lines = text.split("\n").filter((l) => l.trim());
  const possibleTitle = lines[0]?.trim() || file.name.replace(/\.[^.]+$/, "");

  return {
    title:
      possibleTitle.length < 100
        ? possibleTitle
        : file.name.replace(/\.[^.]+$/, ""),
    author: "",
    chapters:
      chapters.length > 0
        ? chapters
        : [
            {
              title: "Chapter 1",
              content: formatContentAsHtml(text),
              type: "content",
            },
          ],
  };
}

export async function parseDocxFile(file: File): Promise<ParsedBook> {
  const arrayBuffer = await file.arrayBuffer();

  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const html = htmlResult.value;

  const textResult = await mammoth.extractRawText({ arrayBuffer });
  const text = textResult.value;

  const chaptersFromHtml = splitByHtmlHeadings(html);

  let chapters: ParsedChapter[];
  if (chaptersFromHtml.length > 1) {
    chapters = chaptersFromHtml;
  } else {
    chapters = splitIntoChapters(text);
  }

  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const possibleTitle = titleMatch
    ? titleMatch[1].trim()
    : file.name.replace(/\.docx?$/i, "");

  return {
    title: possibleTitle,
    author: "",
    chapters:
      chapters.length > 0
        ? chapters
        : [
            {
              title: "Chapter 1",
              content: formatContentAsHtml(text),
              type: "content",
            },
          ],
  };
}

function splitByHtmlHeadings(html: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];

  const headingRegex = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { level: number; title: string; index: number }[] = [];

  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    if (title) {
      headings.push({
        level: parseInt(match[1]),
        title,
        index: match.index,
      });
    }
  }

  if (headings.length === 0) {
    return [];
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];

    const headingEndMatch = html.substring(heading.index).match(/<\/h[1-3]>/i);
    if (!headingEndMatch) continue;

    const contentStart =
      heading.index + headingEndMatch.index! + headingEndMatch[0].length;
    const contentEnd = nextHeading ? nextHeading.index : html.length;

    let content = html.substring(contentStart, contentEnd).trim();

    content = content.replace(/^(\s*<p>\s*<\/p>\s*)+/, "");
    content = content.replace(/(\s*<p>\s*<\/p>\s*)+$/, "");

    const looksLikeChapter =
      isChapterTitle(heading.title) || heading.level <= 2;

    if (looksLikeChapter || chapters.length === 0) {
      chapters.push({
        title: heading.title,
        content: content,
        type: determineChapterType(heading.title),
      });
    } else {
      if (chapters.length > 0) {
        const lastChapter = chapters[chapters.length - 1];
        lastChapter.content += `<h${heading.level}>${heading.title}</h${heading.level}>${content}`;
      }
    }
  }

  if (headings.length > 0 && headings[0].index > 0) {
    const beforeFirstHeading = html.substring(0, headings[0].index).trim();
    const cleanedContent = beforeFirstHeading
      .replace(/^(\s*<p>\s*<\/p>\s*)+/, "")
      .replace(/(\s*<p>\s*<\/p>\s*)+$/, "");
    if (
      cleanedContent &&
      cleanedContent.replace(/<[^>]+>/g, "").trim().length > 50
    ) {
      chapters.unshift({
        title: "Introduction",
        content: cleanedContent,
        type: "frontmatter",
      });
    }
  }

  return chapters;
}

export async function parsePdfFile(file: File): Promise<ParsedBook> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  const chapters = splitIntoChapters(fullText);

  return {
    title: file.name.replace(/\.pdf$/i, ""),
    author: "",
    chapters:
      chapters.length > 0
        ? chapters
        : [
            {
              title: "Chapter 1",
              content: formatContentAsHtml(fullText),
              type: "content",
            },
          ],
  };
}

export async function parseDocument(file: File): Promise<ParsedBook> {
  const book = await parseByType(file);
  return {
    ...book,
    chapters: book.chapters.map((chapter) => ({
      ...chapter,
      content: DOMPurify.sanitize(chapter.content),
    })),
  };
}

async function parseByType(file: File): Promise<ParsedBook> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "txt":
      return parseTextFile(file);
    case "doc":
    case "docx":
      return parseDocxFile(file);
    case "pdf":
      return parsePdfFile(file);
    default:
      throw new Error(`Unsupported file format: .${extension}`);
  }
}

export function getSupportedFormats(): string[] {
  return [".txt", ".doc", ".docx", ".pdf"];
}
