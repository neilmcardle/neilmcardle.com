"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const DB_NAME = "makeEbookExports";
const DB_VERSION = 1;
const STORE_NAME = "exports";

export interface EPUBExport {
  id: string;
  bookId: string;
  timestamp: number;
  title: string;
  author: string;
  wordCount: number;
  chapterCount: number;
  fileSize: number;
  blob: Blob;
}

export interface EPUBExportMeta {
  id: string;
  bookId: string;
  timestamp: number;
  title: string;
  author: string;
  wordCount: number;
  chapterCount: number;
  fileSize: number;
}

interface UseExportHistoryOptions {
  bookId: string | null | undefined;
  maxExports?: number;
}

interface UseExportHistoryReturn {
  exports: EPUBExportMeta[];
  isLoading: boolean;
  saveExport: (params: {
    title: string;
    author: string;
    wordCount: number;
    chapterCount: number;
    blob: Blob;
  }) => Promise<EPUBExport | null>;
  getExportBlob: (exportId: string) => Promise<Blob | null>;
  deleteExport: (exportId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  formatTimestamp: (timestamp: number) => string;
  formatFileSize: (bytes: number) => string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("bookId", "bookId", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

const EMPTY_EXPORTS: EPUBExportMeta[] = [];

export function useExportHistory({
  bookId,
  maxExports = 5,
}: UseExportHistoryOptions): UseExportHistoryReturn {
  const [loadedExports, setLoadedExports] = useState<EPUBExportMeta[]>([]);
  const [loadedBookId, setLoadedBookId] = useState<string | null>(null);
  const ready = !!bookId && loadedBookId === bookId;
  const exports = ready ? loadedExports : EMPTY_EXPORTS;
  const isLoading = !!bookId && !ready;
  const dbRef = useRef<IDBDatabase | null>(null);

  const loadExports = useCallback(async () => {
    if (!bookId) return;

    try {
      if (!dbRef.current) {
        dbRef.current = await openDB();
      }

      const tx = dbRef.current.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("bookId");
      const request = index.getAll(IDBKeyRange.only(bookId));

      request.onsuccess = () => {
        const allExports = request.result as EPUBExport[];

        const metadata: EPUBExportMeta[] = allExports
          .map(
            ({
              id,
              bookId,
              timestamp,
              title,
              author,
              wordCount,
              chapterCount,
              fileSize,
            }) => ({
              id,
              bookId,
              timestamp,
              title,
              author,
              wordCount,
              chapterCount,
              fileSize,
            }),
          )
          .sort((a, b) => b.timestamp - a.timestamp);

        setLoadedExports(metadata);
        setLoadedBookId(bookId);
      };

      request.onerror = () => {
        console.error("Error loading exports");
        setLoadedExports([]);
        setLoadedBookId(bookId);
      };
    } catch (error) {
      console.error("Failed to load export history:", error);
      setLoadedExports([]);
      setLoadedBookId(bookId);
    }
  }, [bookId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadExports is async; every setState runs in an IndexedDB request callback, which the compiler cannot see past
    loadExports();
  }, [loadExports]);

  const saveExport = useCallback(
    async ({
      title,
      author,
      wordCount,
      chapterCount,
      blob,
    }: {
      title: string;
      author: string;
      wordCount: number;
      chapterCount: number;
      blob: Blob;
    }): Promise<EPUBExport | null> => {
      if (!bookId) return null;

      try {
        if (!dbRef.current) {
          dbRef.current = await openDB();
        }

        const newExport: EPUBExport = {
          id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          bookId,
          timestamp: Date.now(),
          title: title || "Untitled",
          author: author || "Unknown",
          wordCount,
          chapterCount,
          fileSize: blob.size,
          blob,
        };

        await new Promise<void>((resolve, reject) => {
          const tx = dbRef.current!.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const request = store.put(newExport);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        const tx = dbRef.current.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const index = store.index("bookId");
        const getAllRequest = index.getAll(IDBKeyRange.only(bookId));

        getAllRequest.onsuccess = () => {
          const allExports = getAllRequest.result as EPUBExport[];

          if (allExports.length > maxExports) {
            const sorted = allExports.sort((a, b) => b.timestamp - a.timestamp);
            const toDelete = sorted.slice(maxExports);

            for (const exp of toDelete) {
              store.delete(exp.id);
            }
          }
        };

        await loadExports();

        return newExport;
      } catch (error) {
        console.error("Failed to save export:", error);
        return null;
      }
    },
    [bookId, maxExports, loadExports],
  );

  const getExportBlob = useCallback(
    async (exportId: string): Promise<Blob | null> => {
      try {
        if (!dbRef.current) {
          dbRef.current = await openDB();
        }

        return new Promise((resolve, reject) => {
          const tx = dbRef.current!.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const request = store.get(exportId);

          request.onsuccess = () => {
            const result = request.result as EPUBExport | undefined;
            resolve(result?.blob || null);
          };
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Failed to get export blob:", error);
        return null;
      }
    },
    [],
  );

  const deleteExport = useCallback(
    async (exportId: string): Promise<void> => {
      try {
        if (!dbRef.current) {
          dbRef.current = await openDB();
        }

        await new Promise<void>((resolve, reject) => {
          const tx = dbRef.current!.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const request = store.delete(exportId);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        await loadExports();
      } catch (error) {
        console.error("Failed to delete export:", error);
      }
    },
    [loadExports],
  );

  const clearHistory = useCallback(async (): Promise<void> => {
    if (!bookId) return;

    try {
      if (!dbRef.current) {
        dbRef.current = await openDB();
      }

      const tx = dbRef.current.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("bookId");
      const request = index.getAllKeys(IDBKeyRange.only(bookId));

      request.onsuccess = () => {
        const keys = request.result;
        for (const key of keys) {
          store.delete(key);
        }
      };

      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
      });

      await loadExports();
    } catch (error) {
      console.error("Failed to clear export history:", error);
    }
  }, [bookId, loadExports]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return {
    exports,
    isLoading,
    saveExport,
    getExportBlob,
    deleteExport,
    clearHistory,
    formatTimestamp,
    formatFileSize,
  };
}

export default useExportHistory;
