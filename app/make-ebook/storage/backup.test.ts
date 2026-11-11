import { describe, expect, it } from "vitest";
import { normaliseBook } from "../model/book";
import {
  BackupError,
  backupFileName,
  makeBackup,
  mergeBackup,
  parseBackup,
} from "./backup";

const USER = "00000000-0000-4000-8000-000000000001";
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";

function book(id: string, revision: number, title: string, syncedRevision = 0) {
  return normaliseBook({ id, title, revision, syncedRevision }, USER);
}

describe("backupFileName", () => {
  it("names the file by the day", () => {
    expect(backupFileName(new Date(2026, 10, 9, 23, 0))).toBe(
      "makeebook-backup-2026-11-09.json",
    );
  });
});

describe("parseBackup", () => {
  it("reads back every book in a backup", () => {
    const backup = makeBackup([book(A, 2, "One"), book(B, 1, "Two")]);
    const books = parseBackup(JSON.stringify(backup), USER);
    expect(books.map((b) => [b.id, b.title, b.revision])).toEqual([
      [A, "One", 2],
      [B, "Two", 1],
    ]);
  });

  it("gives restored books to the person restoring them", () => {
    const other = normaliseBook({ id: A, title: "Theirs" }, "someone-else");
    const books = parseBackup(JSON.stringify(makeBackup([other])), USER);
    expect(books[0].userId).toBe(USER);
  });

  it("skips entries without an id", () => {
    const text = JSON.stringify({
      ...makeBackup([book(A, 1, "One")]),
      books: [{ id: A, title: "One" }, { title: "No id" }, 4, null],
    });
    expect(parseBackup(text, USER).map((b) => b.id)).toEqual([A]);
  });

  it("rejects a file that is not a backup", () => {
    expect(() => parseBackup("not json", USER)).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ books: [] }), USER)).toThrow(
      BackupError,
    );
  });
});

describe("mergeBackup", () => {
  it("adds books the library does not have", () => {
    const { books, restored } = mergeBackup(
      [book(A, 1, "One")],
      [book(B, 1, "Two")],
    );
    expect(books.map((b) => b.id)).toEqual([A, B]);
    expect(restored.map((b) => b.id)).toEqual([B]);
  });

  it("keeps the higher revision when a book is in both", () => {
    const { books, restored } = mergeBackup(
      [book(A, 5, "Library newer"), book(B, 1, "Library older", 1)],
      [book(A, 3, "Backup older"), book(B, 4, "Backup newer", 4)],
    );
    expect(books.find((b) => b.id === A)?.title).toBe("Library newer");
    expect(books.find((b) => b.id === B)?.title).toBe("Backup newer");
    expect(restored.map((b) => b.id)).toEqual([B]);
  });

  it("keeps the library copy on a tie", () => {
    const { books, restored } = mergeBackup(
      [book(A, 2, "Library")],
      [book(A, 2, "Backup")],
    );
    expect(books[0].title).toBe("Library");
    expect(restored).toEqual([]);
  });

  it("keeps this device's synced revision so the cloud is not fooled", () => {
    const { restored } = mergeBackup(
      [book(B, 1, "Library", 1)],
      [book(B, 4, "Backup", 4), book(C, 2, "New", 2)],
    );
    expect(restored.find((b) => b.id === B)?.syncedRevision).toBe(1);
    expect(restored.find((b) => b.id === C)?.syncedRevision).toBe(0);
  });

  it("counts a book once when the backup repeats it", () => {
    const { restored } = mergeBackup(
      [],
      [book(A, 1, "First"), book(A, 3, "Second")],
    );
    expect(restored).toHaveLength(1);
    expect(restored[0].title).toBe("Second");
  });
});
