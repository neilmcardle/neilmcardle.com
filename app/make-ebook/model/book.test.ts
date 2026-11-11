import { describe, expect, it } from "vitest";
import {
  bumpRevision,
  isUuid,
  needsPush,
  newBook,
  normaliseBook,
  sameContent,
} from "./book";

const USER = "00000000-0000-4000-8000-000000000001";

const oldRecord = {
  id: "5b0f3c1e-8d2a-4e7b-9a41-2f6c8d9e0a11",
  title: "The Salt Road",
  author: "Agnes Fell",
  blurb: "A caravan crosses the desert.",
  publisher: "Fell Press",
  pubDate: "2026-01-02",
  isbn: "978-0-00-000000-0",
  language: "English",
  genre: "Fiction",
  tags: ["desert", "travel"],
  coverFile: "idb:cover-1",
  chapters: [
    {
      id: "c1",
      title: "Chapter 1",
      content: "<p>The caravan left.</p>",
      type: "content",
      locked: true,
    },
  ],
  endnotes: [{ id: "e1", number: 1, content: "A note", sourceChapterId: "c1" }],
  endnoteReferences: [
    { id: "r1", number: 1, chapterId: "c1", endnoteId: "e1" },
  ],
  savedAt: 1_700_000_000_000,
  cloudSyncedAt: 1_699_000_000_000,
  bookmindMemory: { rules: ["Past tense"], characters: {}, decisions: [] },
};

describe("newBook", () => {
  it("starts with a UUID, schema version 1 and nothing to push", () => {
    const book = newBook(USER);
    expect(isUuid(book.id)).toBe(true);
    expect(book.schemaVersion).toBe(1);
    expect(book.userId).toBe(USER);
    expect(book.revision).toBe(0);
    expect(book.syncedRevision).toBe(0);
    expect(needsPush(book)).toBe(false);
    expect(newBook(USER).id).not.toBe(book.id);
  });
});

describe("normaliseBook", () => {
  it("keeps every field of a book saved before the change", () => {
    const book = normaliseBook(oldRecord, USER);
    expect(book).toMatchObject({
      id: oldRecord.id,
      schemaVersion: 1,
      userId: USER,
      title: "The Salt Road",
      author: "Agnes Fell",
      blurb: "A caravan crosses the desert.",
      publisher: "Fell Press",
      pubDate: "2026-01-02",
      isbn: "978-0-00-000000-0",
      language: "English",
      genre: "Fiction",
      tags: ["desert", "travel"],
      coverFile: "idb:cover-1",
      savedAt: 1_700_000_000_000,
    });
    expect(book.chapters).toEqual([
      {
        id: "c1",
        title: "Chapter 1",
        content: "<p>The caravan left.</p>",
        type: "content",
        locked: true,
      },
    ]);
    expect(book.endnotes[0]).toEqual({
      id: "e1",
      number: 1,
      content: "A note",
      sourceChapterId: "c1",
    });
    expect(book.endnoteReferences).toEqual(oldRecord.endnoteReferences);
    expect(book.bookmindMemory?.rules).toEqual(["Past tense"]);
    expect(book).not.toHaveProperty("cloudSyncedAt");
  });

  it("gives an old book a revision that still needs pushing to the new table", () => {
    const book = normaliseBook(oldRecord, USER);
    expect(book.revision).toBe(1);
    expect(book.syncedRevision).toBe(0);
    expect(needsPush(book)).toBe(true);
  });

  it("keeps the revisions of a current book", () => {
    const book = normaliseBook(
      { ...oldRecord, revision: 7, syncedRevision: 5 },
      USER,
    );
    expect(book.revision).toBe(7);
    expect(book.syncedRevision).toBe(5);
  });

  it("never lets the synced revision run ahead of the revision", () => {
    const book = normaliseBook(
      { ...oldRecord, revision: 2, syncedRevision: 9 },
      USER,
    );
    expect(book.syncedRevision).toBe(2);
  });

  it("reads the old Supabase row names", () => {
    const book = normaliseBook(
      {
        id: oldRecord.id,
        pub_date: "2025-05-05",
        cover_image_url: "https://example.test/cover.jpg",
        endnote_references: [
          { id: "r", number: 2, chapter_id: "c", endnote_id: "e" },
        ],
        updated_at: "2026-01-01T00:00:00",
      },
      USER,
    );
    expect(book.pubDate).toBe("2025-05-05");
    expect(book.coverFile).toBe("https://example.test/cover.jpg");
    expect(book.endnoteReferences).toEqual([
      { id: "r", number: 2, chapterId: "c", endnoteId: "e" },
    ]);
    expect(book.savedAt).toBe(Date.UTC(2026, 0, 1));
  });

  it("uses the given user, not the stored one", () => {
    const book = normaliseBook({ ...oldRecord, userId: "someone-else" }, USER);
    expect(book.userId).toBe(USER);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["a number", 42],
    ["a string", "book"],
    ["an array", [1, 2, 3]],
    ["an empty object", {}],
  ])("turns %s into a valid empty book", (_label, value) => {
    const book = normaliseBook(value, USER);
    expect(isUuid(book.id)).toBe(true);
    expect(book.userId).toBe(USER);
    expect(book.title).toBe("");
    expect(book.chapters).toEqual([]);
    expect(book.tags).toEqual([]);
    expect(book.coverFile).toBeNull();
    expect(Number.isFinite(book.savedAt)).toBe(true);
    expect(book.schemaVersion).toBe(1);
  });

  it("drops fields of the wrong type", () => {
    const book = normaliseBook(
      {
        id: 12,
        title: { nested: true },
        tags: ["ok", 3, null],
        chapters: [
          null,
          "chapter",
          { id: 4, title: "Kept", content: 9, type: "nonsense" },
        ],
        endnotes: "none",
        endnoteReferences: [{ number: "one" }],
        savedAt: "not a date",
        revision: -4,
        syncedRevision: "2",
        bookmindMemory: { rules: ["a", 1], characters: { x: "y", z: 2 } },
      },
      USER,
    );
    expect(isUuid(book.id)).toBe(true);
    expect(book.title).toBe("");
    expect(book.tags).toEqual(["ok"]);
    expect(book.chapters).toEqual([
      { id: "", title: "Kept", content: "", type: "content" },
    ]);
    expect(book.endnotes).toEqual([]);
    expect(book.endnoteReferences).toEqual([
      { id: "", number: 0, chapterId: "", endnoteId: "" },
    ]);
    expect(Number.isFinite(book.savedAt)).toBe(true);
    expect(book.revision).toBe(1);
    expect(book.syncedRevision).toBe(0);
    expect(book.bookmindMemory).toEqual({
      rules: ["a"],
      characters: { x: "y" },
      decisions: [],
    });
  });

  it("never throws on a hostile object", () => {
    const hostile = new Proxy(
      {},
      {
        get() {
          return undefined;
        },
      },
    );
    expect(() => normaliseBook(hostile, USER)).not.toThrow();
  });
});

describe("bumpRevision", () => {
  it("adds one to the revision and stamps the save", () => {
    const book = normaliseBook({ ...oldRecord, revision: 3 }, USER);
    const next = bumpRevision(book, 123);
    expect(next.revision).toBe(4);
    expect(next.savedAt).toBe(123);
    expect(book.revision).toBe(3);
  });
});

describe("sameContent", () => {
  it("ignores revisions and save times but not the text", () => {
    const a = normaliseBook(oldRecord, USER);
    const b = { ...a, revision: 9, savedAt: 1 };
    expect(sameContent(a, b)).toBe(true);
    const c = {
      ...a,
      chapters: [{ ...a.chapters[0], content: "<p>Changed</p>" }],
    };
    expect(sameContent(a, c)).toBe(false);
  });
});
