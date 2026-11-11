import type {
  BookMindMemory,
  Chapter,
  Endnote,
  EndnoteReference,
} from "../types";
import { uuidv4 } from "../utils/uuid";
import { normalisePreset, type TypographyPreset } from "../export/styles";

export const SCHEMA_VERSION = 1;

export type Book = {
  id: string;
  schemaVersion: 1;
  userId: string;
  title: string;
  author: string;
  blurb: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  language: string;
  genre: string;
  typography: TypographyPreset;
  tags: string[];
  coverFile: string | null;
  chapters: Chapter[];
  endnotes: Endnote[];
  endnoteReferences: EndnoteReference[];
  bookmindMemory?: BookMindMemory;
  savedAt: number;
  revision: number;
  syncedRevision: number;
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {}
  return uuidv4();
}

export function newBook(userId: string): Book {
  return {
    id: newId(),
    schemaVersion: SCHEMA_VERSION,
    userId,
    title: "",
    author: "",
    blurb: "",
    publisher: "",
    pubDate: "",
    isbn: "",
    language: "",
    genre: "",
    typography: "default",
    tags: [],
    coverFile: null,
    chapters: [],
    endnotes: [],
    endnoteReferences: [],
    savedAt: Date.now(),
    revision: 0,
    syncedRevision: 0,
  };
}

type Loose = Record<string, unknown>;

function isObject(value: unknown): value is Loose {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(...values: unknown[]): string {
  for (const value of values) if (typeof value === "string") return value;
  return "";
}

function count(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : null;
}

function time(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && value) {
    const zoned = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
    const ms = new Date(zoned).getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

const CHAPTER_TYPES = new Set<Chapter["type"]>([
  "frontmatter",
  "content",
  "backmatter",
]);

function normaliseChapter(value: unknown): Chapter | null {
  if (!isObject(value)) return null;
  const type = CHAPTER_TYPES.has(value.type as Chapter["type"])
    ? (value.type as Chapter["type"])
    : "content";
  const chapter: Chapter = {
    id: text(value.id),
    title: text(value.title),
    content: text(value.content),
    type,
  };
  if (value.locked === true) chapter.locked = true;
  if (value.completed === true) chapter.completed = true;
  return chapter;
}

function normaliseEndnote(value: unknown): Endnote | null {
  if (!isObject(value)) return null;
  const note: Endnote = {
    id: text(value.id),
    number: count(value.number) ?? 0,
    content: text(value.content),
  };
  const source = text(value.sourceChapterId, value.source_chapter_id);
  if (source) note.sourceChapterId = source;
  if (typeof value.sourceText === "string") note.sourceText = value.sourceText;
  return note;
}

function normaliseReference(value: unknown): EndnoteReference | null {
  if (!isObject(value)) return null;
  return {
    id: text(value.id),
    number: count(value.number) ?? 0,
    chapterId: text(value.chapterId, value.chapter_id),
    endnoteId: text(value.endnoteId, value.endnote_id),
  };
}

function list<T>(value: unknown, item: (v: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (const entry of value) {
    const next = item(entry);
    if (next !== null) out.push(next);
  }
  return out;
}

function normaliseMemory(value: unknown): BookMindMemory | undefined {
  if (!isObject(value)) return undefined;
  return {
    ...(value as Partial<BookMindMemory>),
    rules: list(value.rules, (r) => (typeof r === "string" ? r : null)),
    characters: isObject(value.characters)
      ? Object.fromEntries(
          Object.entries(value.characters).filter(
            ([, v]) => typeof v === "string",
          ),
        )
      : {},
    decisions: list(value.decisions, (d) =>
      isObject(d) && typeof d.note === "string"
        ? { date: count(d.date) ?? 0, note: d.note }
        : null,
    ),
  } as BookMindMemory;
}

export function normaliseBook(value: unknown, userId: string): Book {
  const raw: Loose = isObject(value) ? value : {};
  const revision = count(raw.revision);
  const synced = count(raw.syncedRevision);
  const hasRevision = revision !== null;
  const nextRevision = hasRevision ? revision : 1;
  const book: Book = {
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    schemaVersion: SCHEMA_VERSION,
    userId,
    title: text(raw.title),
    author: text(raw.author),
    blurb: text(raw.blurb, raw.description),
    publisher: text(raw.publisher),
    pubDate: text(raw.pubDate, raw.pub_date),
    isbn: text(raw.isbn),
    language: text(raw.language),
    genre: text(raw.genre),
    typography: normalisePreset(raw.typography),
    tags: list(raw.tags, (t) => (typeof t === "string" ? t : null)),
    coverFile: text(raw.coverFile, raw.cover_image_url, raw.coverImage) || null,
    chapters: list(raw.chapters, normaliseChapter),
    endnotes: list(raw.endnotes, normaliseEndnote),
    endnoteReferences: list(
      raw.endnoteReferences ?? raw.endnote_references,
      normaliseReference,
    ),
    savedAt: time(raw.savedAt) ?? time(raw.updated_at) ?? Date.now(),
    revision: nextRevision,
    syncedRevision: Math.min(synced ?? 0, nextRevision),
  };
  const memory = normaliseMemory(raw.bookmindMemory);
  if (memory) book.bookmindMemory = memory;
  return book;
}

export function bumpRevision(book: Book, savedAt = Date.now()): Book {
  return { ...book, revision: book.revision + 1, savedAt };
}

export function needsPush(book: Pick<Book, "revision" | "syncedRevision">) {
  return book.revision > book.syncedRevision;
}

export function sameContent(a: Book, b: Book): boolean {
  const pick = (book: Book) =>
    JSON.stringify([
      book.title,
      book.author,
      book.blurb,
      book.publisher,
      book.pubDate,
      book.isbn,
      book.language,
      book.genre,
      book.tags,
      book.chapters,
      book.endnotes,
      book.endnoteReferences,
    ]);
  return pick(a) === pick(b);
}
