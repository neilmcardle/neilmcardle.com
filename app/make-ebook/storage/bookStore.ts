import { isUuid, newId, normaliseBook, type Book } from "../model/book";
import { createSingleFlight } from "../state/singleFlight";
import { moveVersions, versionKey } from "../utils/versionStore";
import { keys, readLocal, writeLocal } from "./keys";

const STORE = "books";
const DB_VERSION = 1;

export type BookChange = {
  id: string;
  before: Book | undefined;
  after: Book | undefined;
};

type Listener = (userId: string, changes: BookChange[]) => void;

interface Backend {
  kind: "indexeddb" | "local";
  readAll(userId: string): Promise<unknown[]>;
  read(userId: string, id: string): Promise<unknown | undefined>;
  write(book: Book): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
}

export interface BookStoreOptions {
  indexedDB?: IDBFactory | null;
  localStorage?: Storage | null;
  broadcast?: boolean;
  onRename?: (userId: string, from: string, to: string) => unknown;
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function openDatabase(
  factory: IDBFactory,
  onGone: () => void,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = factory.open(keys.booksDatabase, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        onGone();
      };
      db.onclose = onGone;
      resolve(db);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("The book database is blocked"));
  });
}

function indexedDbBackend(factory: IDBFactory): Backend {
  let opening: Promise<IDBDatabase> | null = null;
  const db = () => {
    if (!opening) {
      opening = openDatabase(factory, () => {
        opening = null;
      });
      opening.catch(() => {
        opening = null;
      });
    }
    return opening;
  };
  return {
    kind: "indexeddb",
    async readAll(userId) {
      const tx = (await db()).transaction(STORE, "readonly");
      return request(tx.objectStore(STORE).index("userId").getAll(userId));
    },
    async read(_userId, id) {
      const tx = (await db()).transaction(STORE, "readonly");
      return request(tx.objectStore(STORE).get(id));
    },
    async write(book) {
      const tx = (await db()).transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(book);
      await done(tx);
    },
    async remove(_userId, id) {
      const tx = (await db()).transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      await done(tx);
    },
  };
}

function readPrefixed(storage: Storage, prefix: string): unknown[] {
  const found: unknown[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    try {
      found.push(JSON.parse(storage.getItem(key) ?? "null"));
    } catch {}
  }
  return found;
}

function localBackend(storage: Storage): Backend {
  return {
    kind: "local",
    async readAll(userId) {
      return readPrefixed(storage, keys.bookPrefix(userId));
    },
    async read(userId, id) {
      const raw = storage.getItem(keys.book(userId, id));
      return raw ? JSON.parse(raw) : undefined;
    },
    async write(book) {
      storage.setItem(keys.book(book.userId, book.id), JSON.stringify(book));
    },
    async remove(userId, id) {
      storage.removeItem(keys.book(userId, id));
    },
  };
}

function defaultIndexedDb(): IDBFactory | null {
  try {
    return typeof indexedDB === "undefined" ? null : indexedDB;
  } catch {
    return null;
  }
}

function defaultLocalStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readLegacyLibrary(storage: Storage | null, userId: string): unknown[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(keys.legacyLibrary(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createBookStore(options: BookStoreOptions = {}) {
  const factory =
    options.indexedDB === undefined ? defaultIndexedDb() : options.indexedDB;
  const storage =
    options.localStorage === undefined
      ? defaultLocalStorage()
      : options.localStorage;

  const cache = new Map<string, Map<string, Book>>();
  const hydrated = new Set<string>();
  const hydrating = new Map<string, Promise<void>>();
  const listeners = new Set<Listener>();
  const inFlight = new Set<Promise<unknown>>();
  let backend: Backend | null = null;
  let choosing: Promise<Backend | null> | null = null;
  let channel: BroadcastChannel | null = null;

  function books(userId: string) {
    let map = cache.get(userId);
    if (!map) {
      map = new Map();
      cache.set(userId, map);
    }
    return map;
  }

  async function chooseBackend(): Promise<Backend | null> {
    if (backend) return backend;
    if (!choosing) {
      choosing = (async () => {
        if (factory) {
          const idb = indexedDbBackend(factory);
          try {
            await idb.readAll("");
            backend = idb;
            return backend;
          } catch (err) {
            console.error("IndexedDB is unavailable, using localStorage:", err);
          }
        }
        backend = storage ? localBackend(storage) : null;
        return backend;
      })();
    }
    return choosing;
  }

  function notify(userId: string, changes: BookChange[]) {
    if (changes.length === 0) return;
    for (const listener of listeners) listener(userId, changes);
  }

  function openChannel() {
    if (channel || options.broadcast === false) return;
    if (typeof BroadcastChannel === "undefined") return;
    try {
      channel = new BroadcastChannel(keys.booksChannel);
      channel.onmessage = (event: MessageEvent) => {
        const data = event.data as { userId?: string; id?: string } | null;
        if (!data?.userId || !data.id) return;
        void reloadOne(data.userId, data.id);
      };
    } catch {
      channel = null;
    }
  }

  async function reloadOne(userId: string, id: string) {
    if (!hydrated.has(userId)) return;
    const store = await chooseBackend();
    if (!store) return;
    let raw: unknown;
    try {
      raw = await store.read(userId, id);
    } catch {
      return;
    }
    const map = books(userId);
    const before = map.get(id);
    const after = raw ? normaliseBook(raw, userId) : undefined;
    if (after) map.set(id, after);
    else map.delete(id);
    notify(userId, [{ id, before, after }]);
  }

  async function persist(id: string, userId: string): Promise<boolean> {
    const store = await chooseBackend();
    if (!store) return false;
    const book = cache.get(userId)?.get(id);
    try {
      if (book) await store.write(book);
      else await store.remove(userId, id);
    } catch (err) {
      console.error("Failed to store the book:", err);
      return false;
    }
    channel?.postMessage({ userId, id });
    return true;
  }

  const flight = createSingleFlight<string, boolean>({
    run: (id, userId) => persist(id, userId),
    merge: (_previous, next) => next,
    failed: false,
  });

  function schedule(userId: string, id: string) {
    const pending = flight.request(id, userId);
    inFlight.add(pending);
    void pending.finally(() => inFlight.delete(pending));
  }

  function writeNow(book: Book) {
    if (backend?.kind !== "local" || !storage) return false;
    storage.setItem(keys.book(book.userId, book.id), JSON.stringify(book));
    return true;
  }

  async function load(userId: string) {
    const store = await chooseBackend();
    openChannel();
    const map = books(userId);
    const changed = new Map<string, Book>();
    const removedIds: string[] = [];

    const take = (raw: unknown, mark: boolean) => {
      const book = normaliseBook(raw, userId);
      const existing = map.get(book.id);
      if (existing && existing.revision >= book.revision) return;
      map.set(book.id, book);
      if (mark) changed.set(book.id, book);
    };

    let stored: unknown[] = [];
    if (store) {
      try {
        stored = await store.readAll(userId);
      } catch (err) {
        console.error("Failed to read stored books:", err);
      }
    }
    stored
      .map((raw) => normaliseBook(raw, userId))
      .sort((a, b) => a.savedAt - b.savedAt)
      .forEach((book) => take(book, false));

    const legacy = readLegacyLibrary(storage, userId);
    legacy.forEach((raw) => take(raw, true));

    const strayKeys: string[] = [];
    if (store?.kind === "indexeddb" && storage) {
      const prefix = keys.bookPrefix(userId);
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(prefix)) strayKeys.push(key);
      }
      readPrefixed(storage, prefix).forEach((raw) => take(raw, true));
    }

    const renames: Array<[string, string]> = [];
    for (const book of [...map.values()]) {
      if (isUuid(book.id)) continue;
      const id = newId();
      map.delete(book.id);
      changed.delete(book.id);
      removedIds.push(book.id);
      renames.push([book.id, id]);
      const renamed = { ...book, id, syncedRevision: 0 };
      map.set(id, renamed);
      changed.set(id, renamed);
    }
    if (renames.length > 0) {
      const ordered = [...map.values()].sort((a, b) => a.savedAt - b.savedAt);
      map.clear();
      ordered.forEach((book) => map.set(book.id, book));
    }

    let saved = true;
    if (store) {
      for (const book of changed.values()) {
        try {
          await store.write(book);
        } catch (err) {
          saved = false;
          console.error("Failed to import a book:", err);
        }
      }
      for (const id of removedIds) {
        await store.remove(userId, id).catch(() => {});
      }
    } else {
      saved = false;
    }

    for (const [from, to] of renames) {
      try {
        await options.onRename?.(userId, from, to);
      } catch (err) {
        console.error("Failed to move book data to its new id:", err);
      }
    }

    if (saved && storage) {
      try {
        if (legacy.length > 0 || storage.getItem(keys.legacyLibrary(userId))) {
          storage.removeItem(keys.legacyLibrary(userId));
        }
        strayKeys.forEach((key) => storage.removeItem(key));
      } catch {}
    }

    hydrated.add(userId);
  }

  return {
    hydrate(userId: string): Promise<void> {
      if (hydrated.has(userId)) return Promise.resolve();
      let running = hydrating.get(userId);
      if (!running) {
        running = load(userId)
          .catch((err) => {
            console.error("Failed to load the library:", err);
            hydrated.add(userId);
          })
          .finally(() => hydrating.delete(userId));
        hydrating.set(userId, running);
      }
      return running;
    },

    isHydrated(userId: string) {
      return hydrated.has(userId);
    },

    list(userId: string): Book[] {
      return [...(cache.get(userId)?.values() ?? [])];
    },

    get(userId: string, id: string): Book | undefined {
      return cache.get(userId)?.get(id);
    },

    put(book: Book) {
      const map = books(book.userId);
      const before = map.get(book.id);
      map.set(book.id, book);
      try {
        if (writeNow(book)) {
          channel?.postMessage({ userId: book.userId, id: book.id });
          return;
        }
      } catch (err) {
        if (before) map.set(book.id, before);
        else map.delete(book.id);
        throw err;
      }
      schedule(book.userId, book.id);
    },

    replaceAll(userId: string, next: Book[]) {
      const map = books(userId);
      const keep = new Set(next.map((book) => book.id));
      for (const id of [...map.keys()]) {
        if (!keep.has(id)) {
          map.delete(id);
          schedule(userId, id);
        }
      }
      for (const book of next) {
        const owned = book.userId === userId ? book : { ...book, userId };
        map.set(owned.id, owned);
        schedule(userId, owned.id);
      }
    },

    remove(userId: string, id: string) {
      const map = cache.get(userId);
      if (!map?.has(id)) return;
      map.delete(id);
      schedule(userId, id);
    },

    async flush() {
      while (inFlight.size > 0) {
        await Promise.allSettled([...inFlight]);
      }
    },

    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    backendKind() {
      return backend?.kind ?? null;
    },
  };
}

export type BookStore = ReturnType<typeof createBookStore>;

async function moveBookData(userId: string, from: string, to: string) {
  await moveVersions(versionKey(userId, from), versionKey(userId, to));
  const chats = keys.bookMindChats(userId);
  const raw = readLocal(chats);
  if (!raw) return;
  const sessions = JSON.parse(raw) as Array<{ bookId?: string }>;
  if (!Array.isArray(sessions)) return;
  writeLocal(
    chats,
    JSON.stringify(
      sessions.map((s) => (s?.bookId === from ? { ...s, bookId: to } : s)),
    ),
  );
}

export const bookStore = createBookStore({ onRename: moveBookData });
