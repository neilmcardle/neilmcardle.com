import { keys, type StorageKey } from "../storage/keys";

const DB_NAME = "makeEbookVersions";
const DB_VERSION = 1;
const STORE_NAME = "versions";

export function versionKey(
  userId: string | undefined,
  bookId: string,
): StorageKey {
  return keys.versions(userId, bookId);
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readRecord<T>(key: string): Promise<T[] | null> {
  try {
    const db = await openDB();
    const found = await new Promise<T[] | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.versions : null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return found;
  } catch {
    return null;
  }
}

async function deleteRecord(key: string) {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function readLegacyLocal<T>(key: string): T[] | null {
  try {
    const legacy = localStorage.getItem(key);
    return legacy ? (JSON.parse(legacy) as T[]) : null;
  } catch {
    return null;
  }
}

export async function loadVersions<T>(name: StorageKey): Promise<T[]> {
  const stored = await readRecord<T>(name.key);
  if (stored) return stored;

  for (const old of name.legacy) {
    const found = (await readRecord<T>(old)) ?? readLegacyLocal<T>(old);
    if (!found) continue;
    await saveVersions(name, found);
    try {
      localStorage.removeItem(old);
    } catch {}
    await deleteRecord(old).catch(() => {});
    return found;
  }
  return [];
}

export async function moveVersions(from: StorageKey, to: StorageKey) {
  const found = await loadVersions(from);
  if (found.length === 0) return;
  await saveVersions(to, found);
  await clearVersions(from);
}

export async function saveVersions<T>(name: StorageKey, versions: T[]) {
  const key = name.key;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ key, versions, savedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.error("Failed to persist version history:", e);
  }
}

export async function clearVersions(name: StorageKey) {
  for (const key of [name.key, ...name.legacy]) {
    try {
      localStorage.removeItem(key);
    } catch {}
    try {
      await deleteRecord(key);
    } catch (e) {
      console.error("Failed to clear version history:", e);
    }
  }
}
