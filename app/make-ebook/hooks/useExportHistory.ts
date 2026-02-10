'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// IndexedDB configuration
const DB_NAME = 'makeEbookExports';
const DB_VERSION = 1;
const STORE_NAME = 'exports';

export interface EPUBExport {
  id: string;
  bookId: string;
  timestamp: number;
  title: string;
  author: string;
  wordCount: number;
  chapterCount: number;
  fileSize: number; // bytes
  blob: Blob;
}

// Metadata-only version for listing (without the blob)
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

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create exports store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('bookId', 'bookId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export function useExportHistory({
  bookId,
  maxExports = 5
}: UseExportHistoryOptions): UseExportHistoryReturn {
  const [exports, setExports] = useState<EPUBExportMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dbRef = useRef<IDBDatabase | null>(null);

  // Load exports metadata from IndexedDB
  const loadExports = useCallback(async () => {
    if (!bookId) {
      setExports([]);
      setIsLoading(false);
      return;
    }

    try {
      if (!dbRef.current) {
        dbRef.current = await openDB();
      }

      const tx = dbRef.current.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('bookId');
      const request = index.getAll(IDBKeyRange.only(bookId));

      request.onsuccess = () => {
        const allExports = request.result as EPUBExport[];

        // Map to metadata only (exclude blob for memory efficiency)
        const metadata: EPUBExportMeta[] = allExports
          .map(({ id, bookId, timestamp, title, author, wordCount, chapterCount, fileSize }) => ({
            id, bookId, timestamp, title, author, wordCount, chapterCount, fileSize
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        setExports(metadata);
        setIsLoading(false);
      };

      request.onerror = () => {
        console.error('Error loading exports');
        setExports([]);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Failed to load export history:', error);
      setExports([]);
      setIsLoading(false);
    }
  }, [bookId]);

  // Initialize and load exports
  useEffect(() => {
    loadExports();

    return () => {
      // Don't close the DB on unmount as it may be reused
    };
  }, [loadExports]);

  // Save a new export
  const saveExport = useCallback(async ({
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
        title: title || 'Untitled',
        author: author || 'Unknown',
        wordCount,
        chapterCount,
        fileSize: blob.size,
        blob,
      };

      // Save to IndexedDB
      await new Promise<void>((resolve, reject) => {
        const tx = dbRef.current!.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(newExport);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Enforce max exports limit - delete oldest if over limit
      const tx = dbRef.current.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('bookId');
      const getAllRequest = index.getAll(IDBKeyRange.only(bookId));

      getAllRequest.onsuccess = () => {
        const allExports = getAllRequest.result as EPUBExport[];

        if (allExports.length > maxExports) {
          // Sort by timestamp, delete oldest
          const sorted = allExports.sort((a, b) => b.timestamp - a.timestamp);
          const toDelete = sorted.slice(maxExports);

          for (const exp of toDelete) {
            store.delete(exp.id);
          }
        }
      };

      // Reload exports list
      await loadExports();

      return newExport;
    } catch (error) {
      console.error('Failed to save export:', error);
      return null;
    }
  }, [bookId, maxExports, loadExports]);

  // Get blob for a specific export (for preview/download)
  const getExportBlob = useCallback(async (exportId: string): Promise<Blob | null> => {
    try {
      if (!dbRef.current) {
        dbRef.current = await openDB();
      }

      return new Promise((resolve, reject) => {
        const tx = dbRef.current!.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(exportId);

        request.onsuccess = () => {
          const result = request.result as EPUBExport | undefined;
          resolve(result?.blob || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get export blob:', error);
      return null;
    }
  }, []);

  // Delete a specific export
  const deleteExport = useCallback(async (exportId: string): Promise<void> => {
    try {
      if (!dbRef.current) {
        dbRef.current = await openDB();
      }

      await new Promise<void>((resolve, reject) => {
        const tx = dbRef.current!.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(exportId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Reload exports list
      await loadExports();
    } catch (error) {
      console.error('Failed to delete export:', error);
    }
  }, [loadExports]);

  // Clear all exports for current book
  const clearHistory = useCallback(async (): Promise<void> => {
    if (!bookId) return;

    try {
      if (!dbRef.current) {
        dbRef.current = await openDB();
      }

      // Get all exports for this book and delete them
      const tx = dbRef.current.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('bookId');
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

      // Reload exports list
      await loadExports();
    } catch (error) {
      console.error('Failed to clear export history:', error);
    }
  }, [bookId, loadExports]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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
