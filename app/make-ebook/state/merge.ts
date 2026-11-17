import type { Book } from "../model/book";
import type { Chapter } from "../types";

export type SyncBase = {
  order: string[];
  chapters: Record<string, string>;
  fields: Record<string, string>;
};

const FIELDS = [
  "title",
  "author",
  "blurb",
  "publisher",
  "pubDate",
  "isbn",
  "language",
  "genre",
  "typography",
  "tags",
  "coverFile",
  "notes",
  "bookmindMemory",
] as const;

type Field = (typeof FIELDS)[number];

export function fingerprint(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function chapterPrint(chapter: Chapter): string {
  return fingerprint(
    [
      chapter.type,
      chapter.title,
      chapter.content,
      chapter.completed ? "1" : "0",
      chapter.locked ? "1" : "0",
    ].join("\u0000"),
  );
}

function fieldValue(book: Book, field: Field): unknown {
  if (field === "notes") return [book.endnotes, book.endnoteReferences];
  return book[field] ?? null;
}

function fieldPrint(book: Book, field: Field): string {
  return fingerprint(JSON.stringify(fieldValue(book, field)));
}

export function syncBaseOf(book: Book): SyncBase {
  const chapters: Record<string, string> = {};
  for (const chapter of book.chapters)
    chapters[chapter.id] = chapterPrint(chapter);
  const fields: Record<string, string> = {};
  for (const field of FIELDS) fields[field] = fieldPrint(book, field);
  return { order: book.chapters.map((c) => c.id), chapters, fields };
}

export function isSyncBase(value: unknown): value is SyncBase {
  if (!value || typeof value !== "object") return false;
  const base = value as Partial<SyncBase>;
  return (
    Array.isArray(base.order) &&
    base.order.every((id) => typeof id === "string") &&
    !!base.chapters &&
    typeof base.chapters === "object" &&
    !!base.fields &&
    typeof base.fields === "object"
  );
}

function sameSequence(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

function sharedOrder(ids: string[], keep: Set<string>): string[] {
  return ids.filter((id) => keep.has(id));
}

function mergeOrder(
  base: string[],
  local: string[],
  remote: string[],
  kept: Set<string>,
): string[] | null {
  const common = new Set(
    base.filter((id) => local.includes(id) && remote.includes(id)),
  );
  const baseShared = sharedOrder(base, common);
  const localShared = sharedOrder(local, common);
  const remoteShared = sharedOrder(remote, common);
  const localMoved = !sameSequence(localShared, baseShared);
  const remoteMoved = !sameSequence(remoteShared, baseShared);
  if (localMoved && remoteMoved && !sameSequence(localShared, remoteShared)) {
    return null;
  }
  const [primary, secondary] = localMoved ? [local, remote] : [remote, local];
  const result = primary.filter((id) => kept.has(id));
  for (let i = 0; i < secondary.length; i++) {
    const id = secondary[i];
    if (!kept.has(id) || result.includes(id)) continue;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const before = result.indexOf(secondary[j]);
      if (before >= 0) {
        at = before + 1;
        break;
      }
    }
    result.splice(at, 0, id);
  }
  for (const id of kept) if (!result.includes(id)) result.push(id);
  return result;
}

export type MergeResult =
  | { status: "merged"; book: Book }
  | { status: "clash"; chapters: string[]; fields: string[] };

export function mergeBooks(
  local: Book,
  remote: Book,
  base: SyncBase,
): MergeResult {
  const localById = new Map(local.chapters.map((c) => [c.id, c]));
  const remoteById = new Map(remote.chapters.map((c) => [c.id, c]));
  const ids = new Set([
    ...base.order,
    ...localById.keys(),
    ...remoteById.keys(),
  ]);

  const clashChapters: string[] = [];
  const chosen = new Map<string, Chapter>();

  for (const id of ids) {
    const was = base.chapters[id];
    const mine = localById.get(id);
    const theirs = remoteById.get(id);
    const minePrint = mine ? chapterPrint(mine) : undefined;
    const theirsPrint = theirs ? chapterPrint(theirs) : undefined;
    const mineChanged = minePrint !== was;
    const theirsChanged = theirsPrint !== was;

    if (mineChanged && theirsChanged && minePrint !== theirsPrint) {
      clashChapters.push(id);
      continue;
    }
    const pick = mineChanged ? mine : theirsChanged ? theirs : mine;
    if (pick) chosen.set(id, pick);
  }

  const clashFields: string[] = [];
  const merged: Book = { ...local };
  for (const field of FIELDS) {
    const was = base.fields[field];
    const minePrint = fieldPrint(local, field);
    const theirsPrint = fieldPrint(remote, field);
    const mineChanged = minePrint !== was;
    const theirsChanged = theirsPrint !== was;
    if (mineChanged && theirsChanged && minePrint !== theirsPrint) {
      clashFields.push(field);
      continue;
    }
    if (!mineChanged && theirsChanged) {
      if (field === "notes") {
        merged.endnotes = remote.endnotes;
        merged.endnoteReferences = remote.endnoteReferences;
      } else if (field === "bookmindMemory") {
        if (remote.bookmindMemory)
          merged.bookmindMemory = remote.bookmindMemory;
        else delete merged.bookmindMemory;
      } else {
        (merged as Record<string, unknown>)[field] = remote[field];
      }
    }
  }

  if (clashChapters.length || clashFields.length) {
    return { status: "clash", chapters: clashChapters, fields: clashFields };
  }

  const order = mergeOrder(
    base.order,
    local.chapters.map((c) => c.id),
    remote.chapters.map((c) => c.id),
    new Set(chosen.keys()),
  );
  if (!order) return { status: "clash", chapters: [], fields: ["order"] };

  merged.chapters = order.map((id) => chosen.get(id) as Chapter);
  return { status: "merged", book: merged };
}
