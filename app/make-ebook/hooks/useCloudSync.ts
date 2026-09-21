"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { BookRecord } from "../types";
import {
  loadBookLibrary,
  normalizeBookFromSupabase,
  parseCloudTime,
  saveLibraryToStorage,
} from "../utils/bookLibrary";
import { toDisplayCover } from "../utils/assetStore";
import { mergeFetched, planSync, withLocalOnlyFields } from "../utils/syncPlan";

async function pushBook(userId: string, book: BookRecord) {
  const m = await import("@/lib/supabaseEbooks");
  const cover = await toDisplayCover(book.coverFile).catch(() => null);
  const saved = await m.saveEbookToSupabase(
    { ...book, coverFile: cover },
    book.chapters,
    userId,
  );
  const at = saved?.updated_at ? parseCloudTime(saved.updated_at) : Date.now();
  const library = loadBookLibrary(userId);
  const index = library.findIndex((b) => b.id === book.id);
  if (index >= 0) {
    library[index] = {
      ...library[index],
      id: saved?.id ?? book.id,
      savedAt: at,
      cloudSyncedAt: at,
    };
    saveLibraryToStorage(userId, library);
  }
}

const SYNC_THROTTLE_MS = 10000;

interface UseCloudSyncParams {
  user: { id: string } | null;
  hasCloudSync: boolean;
  isLoadingBookRef: React.MutableRefObject<boolean>;
  setLibraryBooks: (books: any[]) => void;
  openBookIdRef: React.MutableRefObject<string | undefined>;
  onOpenBookUpdated: (id: string) => void;
}

export function useCloudSync({
  user,
  hasCloudSync,
  isLoadingBookRef,
  setLibraryBooks,
  openBookIdRef,
  onOpenBookUpdated,
}: UseCloudSyncParams) {
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState<
    { local: BookRecord; cloud: BookRecord }[]
  >([]);
  const [syncMergedMap, setSyncMergedMap] = useState<Map<
    string,
    BookRecord
  > | null>(null);

  const syncingRef = useRef(false);
  const lastSyncRef = useRef(0);
  const conflictsOpenRef = useRef(false);
  const onOpenBookUpdatedRef = useRef(onOpenBookUpdated);
  const hasCloudSyncRef = useRef(hasCloudSync);

  useEffect(() => {
    onOpenBookUpdatedRef.current = onOpenBookUpdated;
    hasCloudSyncRef.current = hasCloudSync;
  });

  const applyLibrary = useCallback(
    (userId: string, books: BookRecord[]) => {
      isLoadingBookRef.current = true;
      setLibraryBooks(books);
      saveLibraryToStorage(userId, books);
      setTimeout(() => {
        isLoadingBookRef.current = false;
      }, 0);
    },
    [isLoadingBookRef, setLibraryBooks],
  );

  const uploadLocalOnly = useCallback(
    async (userId: string, books: BookRecord[]) => {
      for (const book of books) {
        try {
          await pushBook(userId, book);
        } catch (err) {
          console.error("Failed to upload book to the cloud:", err);
        }
      }
      setLibraryBooks(loadBookLibrary(userId));
    },
    [setLibraryBooks],
  );

  const syncNow = useCallback(
    async (force = false) => {
      if (syncingRef.current || conflictsOpenRef.current) return;
      if (!force && Date.now() - lastSyncRef.current < SYNC_THROTTLE_MS) return;
      if (!user?.id) return;
      const userId = user.id;
      syncingRef.current = true;
      lastSyncRef.current = Date.now();
      try {
        const m = await import("@/lib/supabaseEbooks");
        const index = await m.fetchEbookIndex(userId);
        const localBooks = loadBookLibrary(userId);
        const openId = openBookIdRef.current;
        const plan = planSync({
          localBooks,
          index: index.map((row) => ({
            id: row.id,
            updatedAt: parseCloudTime(row.updated_at),
          })),
          openId,
          canUpload: hasCloudSyncRef.current,
        });
        const fetched = await m.fetchEbooksByIds(userId, plan.changedIds);
        const { bookMap, conflicts, blankIds, openBookUpdated } = mergeFetched({
          bookMap: plan.bookMap,
          fetched: (fetched ?? [])
            .filter((raw) => raw.id)
            .map((raw) => normalizeBookFromSupabase(raw)),
          openId,
        });
        const { toUpload, adopted } = plan;

        if (blankIds.length > 0) {
          void Promise.allSettled(
            blankIds.map((id) => m.deleteEbookFromSupabase(id)),
          );
        }

        const merged = Array.from(bookMap.values());
        const libraryChanged =
          adopted || fetched.length > 0 || merged.length !== localBooks.length;

        if (conflicts.length > 0) {
          setSyncMergedMap(bookMap);
          setSyncConflicts(conflicts);
        } else if (libraryChanged) {
          applyLibrary(userId, merged);
          if (openBookUpdated && openId) onOpenBookUpdatedRef.current(openId);
        }

        if (toUpload.length > 0) void uploadLocalOnly(userId, toUpload);
      } catch (err) {
        console.error("Failed to sync Supabase books:", err);
      } finally {
        syncingRef.current = false;
        setInitialSyncDone(true);
      }
    },
    [user, openBookIdRef, applyLibrary, uploadLocalOnly],
  );

  useEffect(() => {
    conflictsOpenRef.current = syncConflicts.length > 0;
  }, [syncConflicts]);

  useEffect(() => {
    if (!user?.id) return;
    const fallback = setTimeout(() => setInitialSyncDone(true), 6000);
    return () => clearTimeout(fallback);
  }, [user?.id]);

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

  useEffect(() => {
    if (!user?.id) return;
    const key = `makeebook_library_${user.id}`;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const books = loadBookLibrary(user.id);
      setLibraryBooks(books);
      const openId = openBookIdRef.current;
      if (!openId || !e.oldValue) return;
      try {
        const before = (JSON.parse(e.oldValue) as BookRecord[]).find(
          (b) => b.id === openId,
        );
        const after = books.find((b) => b.id === openId);
        if (before && after && after.savedAt > before.savedAt) {
          onOpenBookUpdatedRef.current(openId);
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user?.id, openBookIdRef, setLibraryBooks]);

  function handleResolveSyncConflict(choice: "local" | "cloud" | "both") {
    if (!syncMergedMap || syncConflicts.length === 0) return;

    const conflict = syncConflicts[0];
    const map = new Map(syncMergedMap);
    const pushLocal: BookRecord[] = [];

    if (choice === "local") {
      map.set(conflict.local.id, conflict.local);
      pushLocal.push(conflict.local);
    } else if (choice === "cloud") {
      map.set(
        conflict.cloud.id,
        withLocalOnlyFields(conflict.cloud, conflict.local),
      );
    } else {
      map.set(
        conflict.cloud.id,
        withLocalOnlyFields(conflict.cloud, conflict.local),
      );
      const copyId = "book-" + Date.now();
      const copy = {
        ...conflict.local,
        id: copyId,
        title: `${conflict.local.title || "Untitled"} (this device)`,
        cloudSyncedAt: undefined,
      };
      map.set(copyId, copy);
    }

    const remaining = syncConflicts.slice(1);
    if (remaining.length > 0) {
      setSyncMergedMap(map);
      setSyncConflicts(remaining);
      return;
    }

    const userId = user?.id ?? "";
    applyLibrary(userId, Array.from(map.values()));
    setSyncConflicts([]);
    setSyncMergedMap(null);

    if (userId && hasCloudSyncRef.current && pushLocal.length > 0) {
      void (async () => {
        for (const book of pushLocal) {
          try {
            await pushBook(userId, book);
          } catch (err) {
            console.error("Failed to push the kept version:", err);
          }
        }
        setLibraryBooks(loadBookLibrary(userId));
      })();
    }
  }

  return {
    initialSyncDone,
    syncConflicts,
    setSyncConflicts,
    syncMergedMap,
    setSyncMergedMap,
    handleResolveSyncConflict,
    syncNow,
  };
}
