import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isUuid, normaliseBook } from "../model/book";
import { createBookStore } from "./bookStore";
import { keys } from "./keys";

const USER = "00000000-0000-4000-8000-000000000001";
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

let factory: IDBFactory;

function store(options: Parameters<typeof createBookStore>[0] = {}) {
  return createBookStore({
    indexedDB: factory,
    localStorage: window.localStorage,
    broadcast: false,
    ...options,
  });
}

function book(id: string, title: string, revision = 1) {
  return normaliseBook({ id, title, revision, savedAt: revision }, USER);
}

async function storedIds(db: IDBFactory) {
  const open = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = db.open("makeebook", 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const all = await new Promise<Array<{ id: string; title: string }>>(
    (resolve, reject) => {
      const req = open
        .transaction("books", "readonly")
        .objectStore("books")
        .getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    },
  );
  open.close();
  return all;
}

beforeEach(() => {
  factory = new IDBFactory();
  window.localStorage.clear();
});

describe("bookStore", () => {
  it("hydrates an empty library", async () => {
    const books = store();
    await books.hydrate(USER);
    expect(books.isHydrated(USER)).toBe(true);
    expect(books.list(USER)).toEqual([]);
    expect(books.backendKind()).toBe("indexeddb");
  });

  it("updates the cache at once and persists in the background", async () => {
    const books = store();
    await books.hydrate(USER);
    books.put(book(A, "One"));
    expect(books.get(USER, A)?.title).toBe("One");
    await books.flush();
    expect((await storedIds(factory)).map((b) => b.title)).toEqual(["One"]);

    const reopened = store();
    await reopened.hydrate(USER);
    expect(reopened.get(USER, A)?.title).toBe("One");
  });

  it("writes the latest version when saves pile up", async () => {
    const books = store();
    await books.hydrate(USER);
    for (let i = 1; i <= 5; i++) books.put(book(A, `Draft ${i}`, i));
    await books.flush();
    const stored = await storedIds(factory);
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Draft 5");
  });

  it("removes a book from the cache and the database", async () => {
    const books = store();
    await books.hydrate(USER);
    books.put(book(A, "One"));
    books.put(book(B, "Two"));
    await books.flush();
    books.remove(USER, A);
    expect(books.get(USER, A)).toBeUndefined();
    await books.flush();
    expect((await storedIds(factory)).map((b) => b.id)).toEqual([B]);
  });

  it("keeps each user's books apart", async () => {
    const books = store();
    await books.hydrate(USER);
    await books.hydrate("other-user");
    books.put(book(A, "Mine"));
    books.put(normaliseBook({ id: B, title: "Theirs" }, "other-user"));
    await books.flush();
    const reopened = store();
    await reopened.hydrate(USER);
    expect(reopened.list(USER).map((b) => b.id)).toEqual([A]);
  });

  it("imports the old library blob, persists it and then removes it", async () => {
    const legacyId = "book-1700000000000";
    window.localStorage.setItem(
      keys.legacyLibrary(USER),
      JSON.stringify([
        {
          id: A,
          title: "Old book",
          author: "Agnes",
          chapters: [
            { id: "c1", title: "One", content: "<p>Kept</p>", type: "content" },
          ],
          savedAt: 10,
          cloudSyncedAt: 5,
        },
        { id: legacyId, title: "Very old book", savedAt: 20 },
      ]),
    );
    const onRename = vi.fn();
    const books = store({ onRename });
    await books.hydrate(USER);

    expect(window.localStorage.getItem(keys.legacyLibrary(USER))).toBeNull();
    const list = books.list(USER);
    expect(list).toHaveLength(2);
    expect(books.get(USER, A)?.chapters[0].content).toBe("<p>Kept</p>");
    const renamed = list.find((b) => b.title === "Very old book");
    expect(renamed && isUuid(renamed.id)).toBe(true);
    expect(onRename).toHaveBeenCalledWith(USER, legacyId, renamed?.id);

    const stored = await storedIds(factory);
    expect(stored.map((b) => b.title).sort()).toEqual([
      "Old book",
      "Very old book",
    ]);

    const reopened = store();
    await reopened.hydrate(USER);
    expect(reopened.list(USER)).toHaveLength(2);
  });

  it("keeps the old blob when the import cannot be stored", async () => {
    window.localStorage.setItem(
      keys.legacyLibrary(USER),
      JSON.stringify([{ id: A, title: "Old book" }]),
    );
    const original = Storage.prototype.setItem;
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (key.startsWith(keys.bookPrefix(USER))) throw new Error("full");
        original.call(this, key, value);
      });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const books = store({ indexedDB: null });
    await books.hydrate(USER);
    setItem.mockRestore();
    errors.mockRestore();
    expect(books.get(USER, A)?.title).toBe("Old book");
    expect(
      window.localStorage.getItem(keys.legacyLibrary(USER)),
    ).not.toBeNull();
  });

  it("does not let an older blob copy replace a newer stored book", async () => {
    const first = store();
    await first.hydrate(USER);
    first.put(book(A, "Newer", 4));
    await first.flush();
    window.localStorage.setItem(
      keys.legacyLibrary(USER),
      JSON.stringify([{ id: A, title: "Older", revision: 2 }]),
    );
    const books = store();
    await books.hydrate(USER);
    expect(books.get(USER, A)?.title).toBe("Newer");
    expect(window.localStorage.getItem(keys.legacyLibrary(USER))).toBeNull();
  });

  it("falls back to one localStorage key per book without IndexedDB", async () => {
    window.localStorage.setItem(
      keys.legacyLibrary(USER),
      JSON.stringify([{ id: A, title: "Old book" }]),
    );
    const books = store({ indexedDB: null });
    await books.hydrate(USER);
    expect(books.backendKind()).toBe("local");
    expect(window.localStorage.getItem(keys.legacyLibrary(USER))).toBeNull();
    expect(
      JSON.parse(window.localStorage.getItem(keys.book(USER, A)) ?? "{}").title,
    ).toBe("Old book");

    books.put(book(B, "Two"));
    expect(
      JSON.parse(window.localStorage.getItem(keys.book(USER, B)) ?? "{}").title,
    ).toBe("Two");
    books.remove(USER, A);
    await books.flush();
    expect(window.localStorage.getItem(keys.book(USER, A))).toBeNull();

    const reopened = store({ indexedDB: null });
    await reopened.hydrate(USER);
    expect(reopened.list(USER).map((b) => b.id)).toEqual([B]);
  });

  it("falls back to localStorage when IndexedDB will not open", async () => {
    const broken = {
      open() {
        throw new Error("blocked");
      },
    } as unknown as IDBFactory;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const books = store({ indexedDB: broken });
    await books.hydrate(USER);
    errors.mockRestore();
    expect(books.backendKind()).toBe("local");
    books.put(book(A, "One"));
    expect(window.localStorage.getItem(keys.book(USER, A))).not.toBeNull();
  });

  it("surfaces a full localStorage on save and keeps the cache honest", async () => {
    const books = store({ indexedDB: null });
    await books.hydrate(USER);
    books.put(book(A, "One"));
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    expect(() => books.put(book(A, "Two", 2))).toThrow("QuotaExceededError");
    setItem.mockRestore();
    expect(books.get(USER, A)?.title).toBe("One");
  });

  it("moves books left in localStorage into IndexedDB", async () => {
    window.localStorage.setItem(
      keys.book(USER, A),
      JSON.stringify(book(A, "Stray")),
    );
    const books = store();
    await books.hydrate(USER);
    expect(books.get(USER, A)?.title).toBe("Stray");
    expect(window.localStorage.getItem(keys.book(USER, A))).toBeNull();
    expect((await storedIds(factory)).map((b) => b.title)).toEqual(["Stray"]);
  });

  it("hydrates once for concurrent callers", async () => {
    const books = store();
    await Promise.all([books.hydrate(USER), books.hydrate(USER)]);
    expect(books.isHydrated(USER)).toBe(true);
  });
});
