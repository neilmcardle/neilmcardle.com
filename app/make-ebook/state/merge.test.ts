import { describe, expect, it } from "vitest";
import { newBook, type Book } from "../model/book";
import type { Chapter } from "../types";
import { chapterPrint, fingerprint, mergeBooks, syncBaseOf } from "./merge";

function chapter(id: string, content = `<p>${id}</p>`, title = id): Chapter {
  return { id, title, content, type: "content" };
}

function book(chapters: Chapter[], extra: Partial<Book> = {}): Book {
  return { ...newBook("u1"), id: "b1", title: "Lamp", chapters, ...extra };
}

const base = book([chapter("a"), chapter("b"), chapter("c")]);
const synced = syncBaseOf(base);

function edit(source: Book, id: string, content: string): Book {
  return {
    ...source,
    chapters: source.chapters.map((c) => (c.id === id ? { ...c, content } : c)),
  };
}

function ids(result: ReturnType<typeof mergeBooks>): string[] {
  if (result.status !== "merged") throw new Error(JSON.stringify(result));
  return result.book.chapters.map((c) => c.id);
}

describe("fingerprints", () => {
  it("are stable and short", () => {
    expect(fingerprint("hello")).toBe(fingerprint("hello"));
    expect(fingerprint("hello")).not.toBe(fingerprint("hullo"));
    expect(fingerprint("")).toMatch(/^[0-9a-f]{8}$/);
  });

  it("change when anything a writer sees changes", () => {
    const a = chapter("a");
    expect(chapterPrint({ ...a, title: "New" })).not.toBe(chapterPrint(a));
    expect(chapterPrint({ ...a, completed: true })).not.toBe(chapterPrint(a));
    expect(chapterPrint({ ...a, type: "backmatter" })).not.toBe(
      chapterPrint(a),
    );
  });
});

describe("mergeBooks", () => {
  it("keeps edits to different chapters from both devices", () => {
    const phone = edit(base, "a", "<p>written on the train</p>");
    const desk = edit(base, "c", "<p>written at the desk</p>");
    const result = mergeBooks(phone, desk, synced);
    expect(result.status).toBe("merged");
    if (result.status !== "merged") return;
    expect(result.book.chapters[0].content).toBe("<p>written on the train</p>");
    expect(result.book.chapters[2].content).toBe("<p>written at the desk</p>");
  });

  it("reports a clash when both devices change the same chapter", () => {
    const phone = edit(base, "b", "<p>phone</p>");
    const desk = edit(base, "b", "<p>desk</p>");
    expect(mergeBooks(phone, desk, synced)).toEqual({
      status: "clash",
      chapters: ["b"],
      fields: [],
    });
  });

  it("treats the same change on both devices as no clash", () => {
    const phone = edit(base, "b", "<p>same</p>");
    const desk = edit(base, "b", "<p>same</p>");
    expect(mergeBooks(phone, desk, synced).status).toBe("merged");
  });

  it("keeps chapters added on each device in place", () => {
    const phone = { ...base, chapters: [...base.chapters, chapter("p")] };
    const desk = {
      ...base,
      chapters: [base.chapters[0], chapter("d"), ...base.chapters.slice(1)],
    };
    expect(ids(mergeBooks(phone, desk, synced))).toEqual([
      "a",
      "d",
      "b",
      "c",
      "p",
    ]);
  });

  it("applies a deletion when the other device left that chapter alone", () => {
    const phone = {
      ...base,
      chapters: base.chapters.filter((c) => c.id !== "b"),
    };
    const desk = edit(base, "c", "<p>desk</p>");
    expect(ids(mergeBooks(phone, desk, synced))).toEqual(["a", "c"]);
  });

  it("reports a clash when one device deletes a chapter the other edited", () => {
    const phone = {
      ...base,
      chapters: base.chapters.filter((c) => c.id !== "b"),
    };
    const desk = edit(base, "b", "<p>desk</p>");
    const result = mergeBooks(phone, desk, synced);
    expect(result.status).toBe("clash");
  });

  it("keeps a reorder from one device with edits from the other", () => {
    const desk = { ...base, chapters: [...base.chapters].reverse() };
    const phone = edit(base, "a", "<p>phone</p>");
    const result = mergeBooks(phone, desk, synced);
    expect(ids(result)).toEqual(["c", "b", "a"]);
    if (result.status === "merged") {
      expect(result.book.chapters[2].content).toBe("<p>phone</p>");
    }
  });

  it("reports a clash when both devices reorder differently", () => {
    const phone = {
      ...base,
      chapters: [base.chapters[1], base.chapters[0], base.chapters[2]],
    };
    const desk = { ...base, chapters: [...base.chapters].reverse() };
    expect(mergeBooks(phone, desk, synced)).toEqual({
      status: "clash",
      chapters: [],
      fields: ["order"],
    });
  });

  it("takes book details changed on one device only", () => {
    const phone = edit(base, "a", "<p>phone</p>");
    const desk = { ...base, author: "Mara Quill" };
    const result = mergeBooks(phone, desk, synced);
    expect(result.status).toBe("merged");
    if (result.status === "merged") {
      expect(result.book.author).toBe("Mara Quill");
      expect(result.book.chapters[0].content).toBe("<p>phone</p>");
    }
  });

  it("reports a clash when both devices change the same detail", () => {
    const phone = { ...base, title: "Lamp Light" };
    const desk = { ...base, title: "The Lamp" };
    expect(mergeBooks(phone, desk, synced)).toEqual({
      status: "clash",
      chapters: [],
      fields: ["title"],
    });
  });

  it("keeps the local revision fields so the caller decides them", () => {
    const phone = { ...edit(base, "a", "<p>x</p>"), revision: 7 };
    const desk = { ...edit(base, "c", "<p>y</p>"), revision: 9 };
    const result = mergeBooks(phone, desk, synced);
    expect(result.status === "merged" && result.book.revision).toBe(7);
  });
});
