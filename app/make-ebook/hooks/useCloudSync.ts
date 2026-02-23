"use client";
import { useState, useEffect } from "react";
import { BookRecord } from "../types";
import { loadBookLibrary, normalizeBookFromSupabase, saveLibraryToStorage } from "../utils/bookLibrary";

interface UseCloudSyncParams {
  user: { id: string } | null;
  isLoadingBookRef: React.MutableRefObject<boolean>;
  setLibraryBooks: (books: any[]) => void;
}

export function useCloudSync({
  user,
  isLoadingBookRef,
  setLibraryBooks,
}: UseCloudSyncParams) {
  const [syncConflicts, setSyncConflicts] = useState<{
    local: BookRecord;
    cloud: BookRecord;
  }[]>([]);
  const [syncMergedMap, setSyncMergedMap] = useState<Map<string, BookRecord> | null>(null);

  // Fetch ebooks from Supabase on login and merge with local library
  useEffect(() => {
    async function fetchAndSyncSupabaseBooks() {
      if (user && user.id) {
        try {
          const supabaseBooks = await import('@/lib/supabaseEbooks').then(m => m.fetchEbooksFromSupabase(user.id));
          if (Array.isArray(supabaseBooks) && supabaseBooks.length > 0) {
            const localBooks = loadBookLibrary(user.id);
            const bookMap = new Map(localBooks.map((b: BookRecord) => [b.id, b]));
            const conflicts: { local: BookRecord; cloud: BookRecord }[] = [];

            for (const raw of supabaseBooks) {
              if (!raw.id) continue;
              const normalized = normalizeBookFromSupabase(raw);
              const existing = bookMap.get(raw.id);

              if (!existing) {
                // Cloud-only book — add it
                bookMap.set(raw.id, normalized);
              } else {
                // Book exists both locally and in cloud
                const timeDiff = Math.abs(normalized.savedAt - existing.savedAt);
                if (timeDiff < 5000) {
                  // Timestamps within 5 seconds — same save, no conflict
                  continue;
                }
                // Check if content actually differs
                const contentSame =
                  existing.title === normalized.title &&
                  existing.author === normalized.author &&
                  existing.chapters.length === normalized.chapters.length &&
                  existing.chapters.every((ch: any, i: number) =>
                    ch.title === normalized.chapters[i]?.title &&
                    ch.content === normalized.chapters[i]?.content
                  );
                if (contentSame) {
                  // Content identical, take the newer timestamp
                  if (normalized.savedAt > existing.savedAt) {
                    bookMap.set(raw.id, normalized);
                  }
                } else {
                  // Real conflict — content differs
                  conflicts.push({ local: existing, cloud: normalized });
                }
              }
            }

            if (conflicts.length > 0) {
              setSyncMergedMap(bookMap);
              setSyncConflicts(conflicts);
            } else {
              // No conflicts — save immediately
              const mergedBooks = Array.from(bookMap.values());
              isLoadingBookRef.current = true;
              setLibraryBooks(mergedBooks);
              saveLibraryToStorage(user.id, mergedBooks);
              setTimeout(() => { isLoadingBookRef.current = false; }, 0);
            }
          }
        } catch (err) {
          console.error('Failed to sync Supabase books:', err);
        }
      }
    }
    fetchAndSyncSupabaseBooks();
  }, [user]);

  // Resolve a sync conflict — called once per conflict from the dialog
  function handleResolveSyncConflict(choice: 'local' | 'cloud' | 'both') {
    if (!syncMergedMap || syncConflicts.length === 0) return;

    const conflict = syncConflicts[0];
    const map = new Map(syncMergedMap);

    if (choice === 'local') {
      map.set(conflict.local.id, conflict.local);
    } else if (choice === 'cloud') {
      map.set(conflict.cloud.id, conflict.cloud);
    } else {
      // Keep both — local stays as-is, cloud gets a new ID as a copy
      map.set(conflict.local.id, conflict.local);
      const copyId = 'book-' + Date.now();
      map.set(copyId, { ...conflict.cloud, id: copyId, title: conflict.cloud.title + ' (cloud)' });
    }

    const remaining = syncConflicts.slice(1);
    if (remaining.length > 0) {
      setSyncMergedMap(map);
      setSyncConflicts(remaining);
    } else {
      // All conflicts resolved — save final merged library
      const mergedBooks = Array.from(map.values());
      isLoadingBookRef.current = true;
      setLibraryBooks(mergedBooks);
      saveLibraryToStorage(user?.id ?? '', mergedBooks);
      setTimeout(() => { isLoadingBookRef.current = false; }, 0);
      setSyncConflicts([]);
      setSyncMergedMap(null);
    }
  }

  return {
    syncConflicts,
    setSyncConflicts,
    syncMergedMap,
    setSyncMergedMap,
    handleResolveSyncConflict,
  };
}
