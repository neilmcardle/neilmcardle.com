import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";
import { Chapter } from "../types";

interface ExportDocxOptions {
  title: string;
  author: string;
  publisher?: string;
  chapters: Chapter[];
}

function parseInlineHtml(html: string): TextRun[] {
  if (!html) return [];

  const runs: TextRun[] = [];

  const text = html.replace(/<br\s*\/?>/gi, "\n");

  const TOKEN = /(<\/?(?:strong|b|em|i|u|s|strike|a)[^>]*>|[^<]+|<[^>]+>)/gi;
  let bold = false;
  let italic = false;
  let underline = false;
  let strike = false;

  let match: RegExpExecArray | null;
  while ((match = TOKEN.exec(text)) !== null) {
    const token = match[1];

    if (/^<(strong|b)>/i.test(token)) {
      bold = true;
      continue;
    }
    if (/^<\/(strong|b)>/i.test(token)) {
      bold = false;
      continue;
    }
    if (/^<(em|i)>/i.test(token)) {
      italic = true;
      continue;
    }
    if (/^<\/(em|i)>/i.test(token)) {
      italic = false;
      continue;
    }
    if (/^<u>/i.test(token)) {
      underline = true;
      continue;
    }
    if (/^<\/u>/i.test(token)) {
      underline = false;
      continue;
    }
    if (/^<(s|strike)>/i.test(token)) {
      strike = true;
      continue;
    }
    if (/^<\/(s|strike)>/i.test(token)) {
      strike = false;
      continue;
    }
    if (/^<[^>]+>$/.test(token)) continue;

    const decoded = token
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#160;/g, "\u00a0")
      .replace(/&nbsp;/g, "\u00a0")
      .replace(/&#8211;/g, "\u2013")
      .replace(/&#8212;/g, "\u2014")
      .replace(/&#8216;/g, "\u2018")
      .replace(/&#8217;/g, "\u2019")
      .replace(/&#8220;/g, "\u201c")
      .replace(/&#8221;/g, "\u201d")
      .replace(/&#8230;/g, "\u2026");

    if (decoded.trim() === "" && !decoded.includes("\n")) continue;

    runs.push(
      new TextRun({
        text: decoded,
        bold,
        italics: italic,
        underline: underline ? {} : undefined,
        strike,
      }),
    );
  }

  return runs.length > 0 ? runs : [new TextRun({ text: "" })];
}

function tagToHeadingLevel(
  tag: string,
): (typeof HeadingLevel)[keyof typeof HeadingLevel] | null {
  switch (tag.toLowerCase()) {
    case "h1":
      return HeadingLevel.HEADING_1;
    case "h2":
      return HeadingLevel.HEADING_2;
    case "h3":
      return HeadingLevel.HEADING_3;
    default:
      return null;
  }
}

function htmlToParagraphs(html: string): Paragraph[] {
  if (!html.trim()) return [];

  const paragraphs: Paragraph[] = [];

  const BLOCK =
    /<(h[1-3]|p|li|blockquote|hr)([^>]*)>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = BLOCK.exec(html)) !== null) {
    lastIndex = match.index + match[0].length;

    const tag = match[1] ?? "hr";
    const inner = match[3] ?? "";

    if (tag.toLowerCase() === "hr") {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "* * *" })],
          spacing: { before: 200, after: 200 },
        }),
      );
      continue;
    }

    const headingLevel = tagToHeadingLevel(tag);
    const runs = parseInlineHtml(inner);

    if (headingLevel) {
      paragraphs.push(
        new Paragraph({
          heading: headingLevel,
          children: runs,
        }),
      );
    } else if (tag.toLowerCase() === "blockquote") {
      paragraphs.push(
        new Paragraph({
          indent: {
            left: convertInchesToTwip(0.5),
            right: convertInchesToTwip(0.5),
          },
          children: runs,
          spacing: { before: 100, after: 100 },
        }),
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { after: 120 },
        }),
      );
    }
  }

  const tail = html.slice(lastIndex).trim();
  if (tail && !/^</.test(tail)) {
    paragraphs.push(
      new Paragraph({
        children: parseInlineHtml(tail),
        spacing: { after: 120 },
      }),
    );
  }

  return paragraphs.length > 0
    ? paragraphs
    : [new Paragraph({ children: [new TextRun({ text: "" })] })];
}

export async function exportDocx({
  title,
  author,
  publisher,
  chapters,
}: ExportDocxOptions): Promise<void> {
  const safeName = (title || "ebook").replace(/[^a-z0-9]+/gi, "_");

  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: title || "Untitled", bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: convertInchesToTwip(2), after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: author || "" })],
      spacing: { after: 120 },
    }),
  );

  if (publisher) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: publisher, italics: true })],
        spacing: { after: 120 },
      }),
    );
  }

  for (const chapter of chapters) {
    sections.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
    );

    if (chapter.title) {
      sections.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: chapter.title, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 240 },
        }),
      );
    }

    const bodyParagraphs = htmlToParagraphs(chapter.content || "");
    sections.push(...bodyParagraphs);
  }

  const doc = new Document({
    creator: author || "makeEbook",
    title: title || "Untitled",
    description: publisher || "",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1.25),
            },
          },
        },
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeName}.docx`);
}
