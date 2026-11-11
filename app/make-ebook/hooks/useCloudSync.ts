"use client";
import { useEffect, useCallback, useReducer, useRef } from "react";
import { BookRecord } from "../types";
import { newId, sameContent, type Book } from "../model/book";
import { decide } from "../state/sync";
import {
  finishSync,
  initialSyncGate,
  initialSyncStatus,
  requestSync,
  syncStatus,
  type SyncStatus,
  type SyncStatusEvent,
} from "../state/syncStatus";
import { bookStore } from "../storage/bookStore";
import {
  onConflict,
  pullBooks,
  pullIndex,
  pushStored,
  remove as removeRemote,
} from "../storage/cloudStore";
import { isBlankBook, loadBookLibrary } from "../utils/bookLibrary";

const SYNC_THROTTLE_MS = 10000;

export interface SyncPort {
  openBookId: () => string | undefined;
  libraryChanged: (userId: string) => void;
  openBookUpdated: (id: string) => void;
}

interface UseCloudSyncParams {
  user: { id: string } | null;
  hasCloudSync: boolean;
  cloudSyncKnown: boolean;
  port: SyncPort;
}

export type Conflict = { local: BookRecord; cloud: BookRecord };

type Status = SyncStatus<Conflict, BookRecord>;
type StatusEvent = SyncStatusEvent<Conflict, BookRecord>;

export function useCloudSync({
  user,
  hasCloudSync,
  cloudSyncKnown,
  port,
}: UseCloudSyncParams) {
  const [status, dispatch] = useReducer(
    (state: Status, event: StatusEvent) => syncStatus(state, event),
    undefined,
    () => initialSyncStatus<Conflict, BookRecord>(),
  );
  const {
    initialDone: initialSyncDone,
    conflicts: syncConflicts,
    merged: syncMergedMap,
  } = status;
  const setSyncConflicts = useCallback(
    (conflicts: Conflict[]) => dispatch({ type: "setConflicts", conflicts }),
    [],
  );
  const setSyncMergedMap = useCallback(
    (merged: Map<string, BookRecord> | null) =>
      dispatch({ type: "setMerged", merged }),
    [],
  );

  const gateRef = useRef(initialSyncGate);
  const syncNowRef = useRef<(force?: boolean) => Promise<void>>(async () => {});
  const hasCloudSyncRef = useRef(hasCloudSync);

  useEffect(() => {
    hasCloudSyncRef.current = hasCloudSync;
  });

  const showLibrary = useCallback(
    (userId: string) => port.libraryChanged(userId),
    [port],
  );

  const pushAll = useCallback(
    async (userId: string, ids: string[]) => {
      if (ids.length === 0) return;
      await Promise.allSettled(
        ids.map((id) => pushStored(userId, id, { notify: false })),
      );
      port.libraryChanged(userId);
    },
    [port],
  );

  const syncNow = useCallback(
    async (force = false) => {
      const asked = requestSync(gateRef.current, {
        force,
        now: Date.now(),
        throttleMs: SYNC_THROTTLE_MS,
        hasUser: !!user?.id,
      });
      gateRef.current = asked.gate;
      if (!asked.run || !user?.id) return;
      const userId = user.id;
      try {
        await bookStore.hydrate(userId);
        const index = await pullIndex(userId);
        const remoteById = new Map(index.map((row) => [row.id, row]));
        const localBooks = loadBookLibrary(userId);
        const localById = new Map(localBooks.map((b) => [b.id, b]));
        const openId = port.openBookId();
        const canUpload = hasCloudSyncRef.current;

        const toPush: string[] = [];
        const toFetch: string[] = [];
        const toDelete: string[] = [];
        for (const id of new Set([...localById.keys(), ...remoteById.keys()])) {
          const local = localById.get(id) ?? null;
          const remote = remoteById.get(id) ?? null;
          const decision = decide(local, remote);
          if (decision === "push") {
            if (!canUpload || !local) continue;
            if (local.syncedRevision === 0 && isBlankBook(local)) continue;
            if (remote?.deleted && remote.revision > local.syncedRevision) {
              bookStore.put({ ...local, syncedRevision: remote.revision });
            }
            toPush.push(id);
          } else if (decision === "pull" || decision === "conflict") {
            toFetch.push(id);
          } else if (decision === "deleteLocal" && id !== openId) {
            toDelete.push(id);
          }
        }

        const fetched = await pullBooks(userId, toFetch);
        const conflicts: Conflict[] = [];
        const blankIds: string[] = [];
        let changed = toDelete.length > 0;
        let openBookUpdated = false;

        for (const remote of fetched) {
          const cloud = remote.book;
          if (!cloud) continue;
          const local = bookStore.get(userId, remote.id);
          if (isBlankBook(cloud) && remote.id !== openId) {
            if (!local) blankIds.push(remote.id);
            continue;
          }
          if (local && decide(local, remote) === "conflict") {
            if (sameContent(local, cloud)) {
              bookStore.put({
                ...local,
                revision: Math.max(local.revision, cloud.revision),
                syncedRevision: cloud.revision,
              });
              changed = true;
            } else {
              conflicts.push({ local, cloud });
            }
            continue;
          }
          bookStore.put({ ...cloud, userId });
          changed = true;
          if (remote.id === openId) openBookUpdated = true;
        }

        for (const id of toDelete) bookStore.remove(userId, id);

        if (canUpload && blankIds.length > 0) {
          void Promise.allSettled(blankIds.map((id) => removeRemote(id)));
        }

        if (changed) {
          showLibrary(userId);
          if (openBookUpdated && openId) port.openBookUpdated(openId);
        }

        if (conflicts.length > 0) {
          dispatch({
            type: "conflicts",
            conflicts,
            merged: new Map(loadBookLibrary(userId).map((b) => [b.id, b])),
          });
        }

        if (toPush.length > 0) void pushAll(userId, toPush);
      } catch (err) {
        console.error("Failed to sync books with the cloud:", err);
      } finally {
        const finished = finishSync(gateRef.current);
        gateRef.current = finished.gate;
        dispatch({ type: "finished" });
        if (finished.rerun) {
          setTimeout(() => void syncNowRef.current(true), 0);
        }
      }
    },
    [user, port, showLibrary, pushAll],
  );

  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);

  useEffect(() => {
    gateRef.current = {
      ...gateRef.current,
      conflictsOpen: syncConflicts.length > 0,
    };
  }, [syncConflicts]);

  useEffect(() => {
    if (!user?.id) return;
    const fallback = setTimeout(() => dispatch({ type: "timedOut" }), 6000);
    return () => clearTimeout(fallback);
  }, [user?.id]);

  useEffect(() => {
    void syncNow(true);
  }, [syncNow, cloudSyncKnown]);

  useEffect(() => {
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
    const userId = user.id;
    return onConflict((owner) => {
      if (owner === userId) void syncNowRef.current(true);
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    return bookStore.subscribe((owner, changes) => {
      if (owner !== userId) return;
      port.libraryChanged(userId);
      const openId = port.openBookId();
      if (!openId) return;
      const change = changes.find((c) => c.id === openId);
      if (
        change?.before &&
        change.after &&
        change.after.savedAt > change.before.savedAt
      ) {
        port.openBookUpdated(openId);
      }
    });
  }, [user?.id, port]);

  function handleResolveSyncConflict(choice: "local" | "cloud" | "both") {
    if (syncConflicts.length === 0) return;
    const userId = user?.id ?? "";
    if (!userId) return;

    const conflict = syncConflicts[0];
    const cloud = conflict.cloud;
    const local = bookStore.get(userId, conflict.local.id) ?? conflict.local;
    const openId = port.openBookId();
    const pushIds: string[] = [];

    const keepCloud = () => {
      bookStore.put({
        ...cloud,
        userId,
        revision: cloud.revision,
        syncedRevision: cloud.revision,
      });
    };

    if (choice === "local") {
      bookStore.put({
        ...local,
        revision: Math.max(local.revision, cloud.revision) + 1,
        syncedRevision: cloud.revision,
      });
      pushIds.push(local.id);
    } else if (choice === "cloud") {
      keepCloud();
    } else {
      keepCloud();
      const copy: Book = {
        ...local,
        id: newId(),
        title: `${local.title || "Untitled"} (this device)`,
        revision: 1,
        syncedRevision: 0,
        savedAt: Date.now(),
      };
      bookStore.put(copy);
      pushIds.push(copy.id);
    }

    const remaining = syncConflicts.slice(1);
    showLibrary(userId);
    if (choice !== "local" && cloud.id === openId) {
      port.openBookUpdated(cloud.id);
    }

    dispatch({
      type: "resolved",
      remaining,
      merged:
        remaining.length > 0
          ? new Map(loadBookLibrary(userId).map((b) => [b.id, b]))
          : null,
    });

    if (hasCloudSyncRef.current && pushIds.length > 0) {
      void pushAll(userId, pushIds);
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
