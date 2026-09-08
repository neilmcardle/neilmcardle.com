"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { BookRecord } from "../types";
import {
  loadBookLibrary,
  normalizeBookFromSupabase,
  saveLibraryToStorage,
} from "../utils/bookLibrary";

const SAME_SAVE_WINDOW_MS = 5000;
const SYNC_THROTTLE_MS = 10000;

function withLocalOnlyFields(cloud: BookRecord, local: BookRecord): BookRecord {
  const localChapters = new Map(local.chapters.map((ch) => [ch.id, ch]));
  return {
    ...cloud,
    bookmindMemory: cloud.bookmindMemory ?? local.bookmindMemory,
    chapters: cloud.chapters.map((ch) => {
      const previous = localChapters.get(ch.id);
      if (!previous) return ch;
      return {
        ...ch,
        ...(previous.locked ? { locked: true } : {}),
        ...(previous.completed ? { completed: true } : {}),
      };
    }),
  };
}

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
  const [syncConflicts, setSyncConflicts] = useState<
    {
      local: BookRecord;
      cloud: BookRecord;
    }[]
  >([]);
  const [syncMergedMap, setSyncMergedMap] = useState<Map<
    string,
    BookRecord
  > | null>(null);

  const syncingRef = useRef(false);
  const lastSyncRef = useRef(0);
  const conflictsOpenRef = useRef(false);

  const syncNow = useCallback(
    async (force = false) => {
      if (syncingRef.current || conflictsOpenRef.current) return;
      if (!force && Date.now() - lastSyncRef.current < SYNC_THROTTLE_MS) return;
      if (user && user.id) {
        syncingRef.current = true;
        lastSyncRef.current = Date.now();
        try {
          const supabaseBooks = await import("@/lib/supabaseEbooks").then((m) =>
            m.fetchEbooksFromSupabase(user.id),
          );
          if (Array.isArray(supabaseBooks) && supabaseBooks.length > 0) {
            const localBooks = loadBookLibrary(user.id);
            const bookMap = new Map(
              localBooks.map((b: BookRecord) => [b.id, b]),
            );
            const conflicts: { local: BookRecord; cloud: BookRecord }[] = [];

            for (const raw of supabaseBooks) {
              if (!raw.id) continue;
              const normalized = normalizeBookFromSupabase(raw);
              const existing = bookMap.get(raw.id);

              if (!existing) {
                bookMap.set(raw.id, normalized);
              } else {
                const timeDiff = Math.abs(
                  normalized.savedAt - existing.savedAt,
                );
                const contentSame =
                  existing.title === normalized.title &&
                  existing.author === normalized.author &&
                  existing.chapters.length === normalized.chapters.length &&
                  existing.chapters.every(
                    (ch: any, i: number) =>
                      ch.title === normalized.chapters[i]?.title &&
                      ch.content === normalized.chapters[i]?.content,
                  );

                if (contentSame) {
                  if (normalized.savedAt > existing.savedAt) {
                    bookMap.set(
                      raw.id,
                      withLocalOnlyFields(normalized, existing),
                    );
                  }
                } else if (timeDiff < SAME_SAVE_WINDOW_MS) {
                  conflicts.push({ local: existing, cloud: normalized });
                } else if (normalized.savedAt > existing.savedAt) {
                  bookMap.set(
                    raw.id,
                    withLocalOnlyFields(normalized, existing),
                  );
                }
              }
            }

            if (conflicts.length > 0) {
              setSyncMergedMap(bookMap);
              setSyncConflicts(conflicts);
            } else {
              const mergedBooks = Array.from(bookMap.values());
              isLoadingBookRef.current = true;
              setLibraryBooks(mergedBooks);
              saveLibraryToStorage(user.id, mergedBooks);
              setTimeout(() => {
                isLoadingBookRef.current = false;
              }, 0);
            }
          }
        } catch (err) {
          console.error("Failed to sync Supabase books:", err);
        } finally {
          syncingRef.current = false;
        }
      }
    },
    [user, isLoadingBookRef, setLibraryBooks],
  );

  useEffect(() => {
    conflictsOpenRef.current = syncConflicts.length > 0;
  }, [syncConflicts]);

  useEffect(() => {
    void syncNow(true);

    const onFocus = () => void syncNow();
    const onOnline = () => void syncNow(true);
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncNow();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [syncNow]);

  function handleResolveSyncConflict(choice: "local" | "cloud" | "both") {
    if (!syncMergedMap || syncConflicts.length === 0) return;

    const conflict = syncConflicts[0];
    const map = new Map(syncMergedMap);

    if (choice === "local") {
      map.set(conflict.local.id, conflict.local);
    } else if (choice === "cloud") {
      map.set(conflict.cloud.id, conflict.cloud);
    } else {
      map.set(conflict.local.id, conflict.local);
      const copyId = "book-" + Date.now();
      map.set(copyId, {
        ...conflict.cloud,
        id: copyId,
        title: conflict.cloud.title + " (cloud)",
      });
    }

    const remaining = syncConflicts.slice(1);
    if (remaining.length > 0) {
      setSyncMergedMap(map);
      setSyncConflicts(remaining);
    } else {
      const mergedBooks = Array.from(map.values());
      isLoadingBookRef.current = true;
      setLibraryBooks(mergedBooks);
      saveLibraryToStorage(user?.id ?? "", mergedBooks);
      setTimeout(() => {
        isLoadingBookRef.current = false;
      }, 0);
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
    syncNow,
  };
}
