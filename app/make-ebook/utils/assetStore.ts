const DB_NAME = "makeEbookAssets";
const DB_VERSION = 1;
const STORE_NAME = "assets";

export const ASSET_PREFIX = "idb:";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function hashOf(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + "-" + value.length.toString(36);
}

export function isAssetRef(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(ASSET_PREFIX);
}

export function isDataUrl(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("data:");
}

export async function putAsset(dataUrl: string): Promise<string> {
  const id = hashOf(dataUrl);
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id, dataUrl, savedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return ASSET_PREFIX + id;
}

export async function getAsset(ref: string): Promise<string | null> {
  if (!isAssetRef(ref)) return null;
  const id = ref.slice(ASSET_PREFIX.length);
  const db = await openDB();
  const result = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function deleteAsset(ref: string): Promise<void> {
  if (!isAssetRef(ref)) return;
  const id = ref.slice(ASSET_PREFIX.length);
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function toStoredCover(
  value: string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (isAssetRef(value)) return value;
  if (!isDataUrl(value)) return value;
  try {
    return await putAsset(value);
  } catch {
    return value;
  }
}

export async function toDisplayCover(
  value: string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (!isAssetRef(value)) return value;
  try {
    return await getAsset(value);
  } catch {
    return null;
  }
}
