const DB_NAME = "makeEbookVersions";
const DB_VERSION = 1;
const STORE_NAME = "versions";

export const LEGACY_PREFIX = "makeebook-versions-";

export function versionKey(userId: string | undefined, bookId: string): string {
  return `${userId ? userId + "_" : ""}${LEGACY_PREFIX}${bookId}`;
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

export async function loadVersions<T>(key: string): Promise<T[]> {
  let stored: T[] | null = null;
  try {
    const db = await openDB();
    stored = await new Promise<T[] | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.versions : null);
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    stored = null;
  }

  if (stored) return stored;

  try {
    const legacy = localStorage.getItem(key);
    if (!legacy) return [];
    const parsed = JSON.parse(legacy) as T[];
    await saveVersions(key, parsed);
    localStorage.removeItem(key);
    return parsed;
  } catch {
    return [];
  }
}

export async function saveVersions<T>(key: string, versions: T[]) {
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

export async function clearVersions(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to clear */
  }
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.error("Failed to clear version history:", e);
  }
}
