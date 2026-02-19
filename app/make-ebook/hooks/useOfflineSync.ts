'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chapter } from '../types';

// IndexedDB database name and version
const DB_NAME = 'makeEbookOffline';
const DB_VERSION = 1;
const STORE_NAME = 'books';
const PENDING_SYNC_STORE = 'pendingSync';

export interface OfflineBook {
  id: string;
  title: string;
  author: string;
  blurb: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  language: string;
  genre: string;
  tags: string[];
  chapters: Chapter[];
  lastModified: number;
  needsSync: boolean;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  saveOffline: (book: Omit<OfflineBook, 'lastModified' | 'needsSync'>) => Promise<void>;
  loadOffline: (bookId: string) => Promise<OfflineBook | null>;
  getAllOfflineBooks: () => Promise<OfflineBook[]>;
  deleteOfflineBook: (bookId: string) => Promise<void>;
  syncNow: () => Promise<void>;
}

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create books store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastModified', 'lastModified', { unique: false });
        store.createIndex('needsSync', 'needsSync', { unique: false });
      }

      // Create pending sync store for tracking what needs to be synced
      if (!db.objectStoreNames.contains(PENDING_SYNC_STORE)) {
        db.createObjectStore(PENDING_SYNC_STORE, { keyPath: 'id' });
      }
    };
  });
}

export function useOfflineSync(userId?: string): UseOfflineSyncReturn {
  const syncTimeKey = `${userId ? userId + '_' : ''}makeEbook_lastSyncTime`;
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  // Initialize online status and IndexedDB
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Open IndexedDB
    openDB().then((db) => {
      dbRef.current = db;
      updatePendingSyncCount();
    }).catch(console.error);

    // Load last sync time from localStorage
    const savedSyncTime = localStorage.getItem(syncTimeKey);
    if (savedSyncTime) {
      setLastSyncTime(new Date(parseInt(savedSyncTime)));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      dbRef.current?.close();
    };
  }, []);

  // Update pending sync count
  const updatePendingSyncCount = useCallback(async () => {
    if (!dbRef.current) return;

    try {
      const tx = dbRef.current.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      
      // Use getAll and filter instead of index.count() which has issues with boolean keys
      const request = store.getAll();

      request.onsuccess = () => {
        const books = request.result as OfflineBook[];
        const pendingCount = books.filter(book => book.needsSync === true).length;
        setPendingSyncCount(pendingCount);
      };
      
      request.onerror = () => {
        console.error('Error getting books for sync count');
        setPendingSyncCount(0);
      };
    } catch (error) {
      console.error('Error counting pending sync:', error);
      setPendingSyncCount(0);
    }
  }, []);

  // Save book to IndexedDB
  const saveOffline = useCallback(async (book: Omit<OfflineBook, 'lastModified' | 'needsSync'>) => {
    if (!dbRef.current) {
      await openDB().then((db) => { dbRef.current = db; });
    }

    const offlineBook: OfflineBook = {
      ...book,
      lastModified: Date.now(),
      needsSync: !navigator.onLine, // Mark for sync if offline
    };

    return new Promise<void>((resolve, reject) => {
      const tx = dbRef.current!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(offlineBook);

      request.onsuccess = () => {
        updatePendingSyncCount();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }, [updatePendingSyncCount]);

  // Load book from IndexedDB
  const loadOffline = useCallback(async (bookId: string): Promise<OfflineBook | null> => {
    if (!dbRef.current) {
      await openDB().then((db) => { dbRef.current = db; });
    }

    return new Promise((resolve, reject) => {
      const tx = dbRef.current!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(bookId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Get all offline books
  const getAllOfflineBooks = useCallback(async (): Promise<OfflineBook[]> => {
    if (!dbRef.current) {
      await openDB().then((db) => { dbRef.current = db; });
    }

    return new Promise((resolve, reject) => {
      const tx = dbRef.current!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Delete book from IndexedDB
  const deleteOfflineBook = useCallback(async (bookId: string): Promise<void> => {
    if (!dbRef.current) {
      await openDB().then((db) => { dbRef.current = db; });
    }

    return new Promise((resolve, reject) => {
      const tx = dbRef.current!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(bookId);

      request.onsuccess = () => {
        updatePendingSyncCount();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }, [updatePendingSyncCount]);

  // Sync pending changes with server
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || !dbRef.current || isSyncing) return;

    setIsSyncing(true);

    try {
      // Get all books that need syncing
      const tx = dbRef.current.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('needsSync');
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = async () => {
        const booksToSync = request.result as OfflineBook[];

        for (const book of booksToSync) {
          try {
            // Here you would sync to your backend (Supabase)
            // For now, we just mark as synced locally
            // await syncBookToServer(book);

            // Mark as synced
            const updateTx = dbRef.current!.transaction(STORE_NAME, 'readwrite');
            const updateStore = updateTx.objectStore(STORE_NAME);
            updateStore.put({ ...book, needsSync: false });
          } catch (error) {
            console.error('Error syncing book:', book.id, error);
          }
        }

        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem(syncTimeKey, now.getTime().toString());
        
        updatePendingSyncCount();
        setIsSyncing(false);
      };

      request.onerror = () => {
        setIsSyncing(false);
      };
    } catch (error) {
      console.error('Sync error:', error);
      setIsSyncing(false);
    }
  }, [isSyncing, updatePendingSyncCount]);

  return {
    isOnline,
    isSyncing,
    pendingSyncCount,
    lastSyncTime,
    saveOffline,
    loadOffline,
    getAllOfflineBooks,
    deleteOfflineBook,
    syncNow,
  };
}

export default useOfflineSync;
