import type { Node as PMNode } from "prosemirror-model";
import { htmlToDoc } from "../editor/html";
import { htmlToText } from "../model/text";
import type { Chapter, Endnote, EndnoteReference } from "../types";
import { normalisePreset, type TypographyPreset } from "./styles";

export type ExportInput = {
  title: string;
  author: string;
  blurb: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  language: string;
  genre: string;
  tags: string[];
  coverFile: string | null;
  chapters: Chapter[];
  endnotes?: Endnote[];
  endnoteReferences: EndnoteReference[];
  typography?: string;
};

export type RenderedImage = {
  name: string;
  mime: string;
  ext: "png" | "jpg" | "gif" | "webp";
  data: string;
};

export type RenderedChapter = {
  id: string;
  file: string;
  title: string;
  kind: Chapter["type"];
  doc: PMNode;
  isEndnotes: boolean;
};

export type RenderedBook = {
  title: string;
  author: string;
  publisher: string;
  blurb: string;
  isbn: string;
  date: string | null;
  language: string;
  subjects: string[];
  typography: TypographyPreset;
  cover: RenderedImage | null;
  chapters: RenderedChapter[];
  images: RenderedImage[];
  notes: Map<number, string>;
  imageName(src: string): string | null;
  href(fromIndex: number, href: string): string;
  noteHref(fromIndex: number, number: number): string;
  backHref(fromIndex: number, number: number): string;
};

const LANGUAGES: Record<string, string> = {
  english: "en",
  "english (uk)": "en-GB",
  "english (us)": "en-US",
  "british english": "en-GB",
  "american english": "en-US",
  french: "fr",
  german: "de",
  spanish: "es",
  italian: "it",
  portuguese: "pt",
  dutch: "nl",
  swedish: "sv",
  norwegian: "no",
  danish: "da",
  finnish: "fi",
  polish: "pl",
  welsh: "cy",
  irish: "ga",
  "scottish gaelic": "gd",
  chinese: "zh",
  japanese: "ja",
  korean: "ko",
  arabic: "ar",
  hebrew: "he",
  hindi: "hi",
  russian: "ru",
  greek: "el",
  turkish: "tr",
};

export function languageTag(value: string): string {
  const raw = value.trim();
  if (!raw) return "en";
  if (/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(raw)) return raw;
  return LANGUAGES[raw.toLowerCase()] ?? "en";
}

export function isoDate(value: string): string | null {
  if (!value.trim()) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
}

const IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=\s]+)$/i;

export function readDataImage(src: string, name: string): RenderedImage | null {
  const match = IMAGE.exec(src.trim());
  if (!match) return null;
  const kind = match[1].toLowerCase();
  const ext = (kind === "jpeg" ? "jpg" : kind) as RenderedImage["ext"];
  const mime = `image/${ext === "jpg" ? "jpeg" : ext}`;
  return {
    name: `${name}.${ext}`,
    mime,
    ext,
    data: match[2].replace(/\s/g, ""),
  };
}

export function displayTitle(chapter: Chapter, contentNumber: number): string {
  const title = chapter.title.trim();
  if (title) return title;
  if (chapter.type === "frontmatter") return "Front matter";
  if (chapter.type === "backmatter") return "Back matter";
  return `Chapter ${contentNumber}`;
}

function holdsEndnotes(doc: PMNode, title: string): boolean {
  let found = false;
  doc.descendants((node) => {
    if (found) return false;
    if (node.type.name === "endnote_back" || node.attrs?.endnoteEntryId) {
      found = true;
    }
    return !found;
  });
  return found || title.trim().toLowerCase() === "endnotes";
}

function collectIds(doc: PMNode): string[] {
  const ids: string[] = [];
  doc.descendants((node) => {
    const id = node.attrs?.id;
    if (typeof id === "string" && id) ids.push(id);
    return true;
  });
  return ids;
}

function refNumbers(doc: PMNode): number[] {
  const numbers: number[] = [];
  doc.descendants((node) => {
    if (node.type.name === "endnote_ref")
      numbers.push(Number(node.attrs.number));
    return true;
  });
  return numbers;
}

function notesFromChapter(doc: PMNode): Map<number, string> {
  const notes = new Map<number, string>();
  doc.forEach((block) => {
    if (block.type.name !== "paragraph") return;
    let number: number | null = null;
    let text = "";
    block.forEach((child) => {
      if (child.type.name === "endnote_back") {
        number = Number(child.attrs.number);
      } else if (child.isText) {
        text += child.text;
      }
    });
    if (number === null) return;
    notes.set(number, text.replace(/^\s*\d+[.)]\s*/, "").trim());
  });
  return notes;
}

export function renderBook(input: ExportInput): RenderedBook {
  let contentNumber = 0;
  const chapters: RenderedChapter[] = input.chapters.map((chapter, index) => {
    if (chapter.type === "content") contentNumber++;
    const doc = htmlToDoc(chapter.content || "");
    const title = displayTitle(chapter, contentNumber);
    return {
      id: chapter.id,
      file: `chapter${index + 1}.xhtml`,
      title,
      kind: chapter.type,
      doc,
      isEndnotes: holdsEndnotes(doc, chapter.title),
    };
  });

  const images: RenderedImage[] = [];
  const names = new Map<string, string>();
  for (const chapter of chapters) {
    chapter.doc.descendants((node) => {
      if (node.type.name !== "image" && node.type.name !== "figure_image")
        return true;
      const src = String(node.attrs.src ?? "");
      if (!src || names.has(src)) return true;
      const image = readDataImage(src, `image${images.length + 1}`);
      if (image) {
        images.push(image);
        names.set(src, image.name);
      }
      return true;
    });
  }

  const idFile = new Map<string, string>();
  chapters.forEach((chapter) => {
    for (const id of collectIds(chapter.doc)) {
      if (!idFile.has(id)) idFile.set(id, chapter.file);
    }
  });

  const endnotesChapter = chapters.find((c) => c.isEndnotes) ?? null;
  const refFile = new Map<number, string>();
  chapters.forEach((chapter) => {
    for (const n of refNumbers(chapter.doc)) {
      if (!refFile.has(n)) refFile.set(n, chapter.file);
    }
  });
  for (const ref of input.endnoteReferences) {
    const chapter = chapters.find((c) => c.id === ref.chapterId);
    if (chapter && !refFile.has(ref.number))
      refFile.set(ref.number, chapter.file);
  }

  const notes = endnotesChapter
    ? notesFromChapter(endnotesChapter.doc)
    : new Map<number, string>();
  for (const note of input.endnotes ?? []) {
    const text = htmlToText(note.content);
    if (text && !notes.get(note.number)) notes.set(note.number, text);
  }

  const local = (fromIndex: number, file: string, fragment: string) =>
    chapters[fromIndex]?.file === file ? `#${fragment}` : `${file}#${fragment}`;

  const subjects = [input.genre, ...input.tags]
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: input.title.trim() || "Untitled",
    author: input.author.trim() || "Unknown author",
    publisher: input.publisher.trim(),
    blurb: input.blurb.trim(),
    isbn: input.isbn.trim(),
    date: isoDate(input.pubDate),
    language: languageTag(input.language),
    subjects: Array.from(new Set(subjects)),
    typography: normalisePreset(input.typography),
    cover: input.coverFile ? readDataImage(input.coverFile, "cover") : null,
    chapters,
    images,
    notes,
    imageName: (src) => names.get(src) ?? null,
    href(fromIndex, href) {
      if (!href.startsWith("#")) return href;
      const fragment = href.slice(1);
      const file = idFile.get(fragment);
      return file ? local(fromIndex, file, fragment) : href;
    },
    noteHref(fromIndex, number) {
      return endnotesChapter
        ? local(fromIndex, endnotesChapter.file, `end${number}`)
        : `#end${number}`;
    },
    backHref(fromIndex, number) {
      const file = refFile.get(number);
      return file ? local(fromIndex, file, `ref${number}`) : `#ref${number}`;
    },
  };
}
