import { BookRecord } from "../types";
import { isBlankBook } from "./bookLibrary";

const SAME_SAVE_WINDOW_MS = 5000;

export function withLocalOnlyFields(
  cloud: BookRecord,
  local: BookRecord,
): BookRecord {
  const localChapters = new Map(local.chapters.map((ch) => [ch.id, ch]));
  return {
    ...cloud,
    cloudSyncedAt: cloud.savedAt,
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

function sameContent(a: BookRecord, b: BookRecord) {
  return (
    a.title === b.title &&
    a.author === b.author &&
    a.chapters.length === b.chapters.length &&
    a.chapters.every(
      (ch, i) =>
        ch.title === b.chapters[i]?.title &&
        ch.content === b.chapters[i]?.content,
    )
  );
}

export function planSync({
  localBooks,
  index,
  openId,
  canUpload,
}: {
  localBooks: BookRecord[];
  index: { id: string; updatedAt: number }[];
  openId?: string;
  canUpload: boolean;
}) {
  const cloudTimes = new Map(index.map((row) => [row.id, row.updatedAt]));
  const bookMap = new Map(localBooks.map((b) => [b.id, b]));
  const toUpload: BookRecord[] = [];
  let adopted = false;

  for (const book of localBooks) {
    const cloudTime = cloudTimes.get(book.id);
    if (cloudTime !== undefined) {
      if (
        canUpload &&
        book.id !== openId &&
        book.cloudSyncedAt &&
        book.savedAt > book.cloudSyncedAt &&
        cloudTime <= book.cloudSyncedAt
      ) {
        toUpload.push(book);
      }
      if (!book.cloudSyncedAt) {
        bookMap.set(book.id, {
          ...book,
          cloudSyncedAt: Math.min(book.savedAt, cloudTime),
        });
        adopted = true;
      }
      continue;
    }
    if (book.cloudSyncedAt && book.id !== openId) {
      bookMap.delete(book.id);
    } else if (canUpload && book.id !== openId && !isBlankBook(book)) {
      toUpload.push(book);
    }
  }

  const changedIds = index
    .filter((row) => {
      const local = bookMap.get(row.id);
      return !local || row.updatedAt > local.savedAt;
    })
    .map((row) => row.id);

  return { bookMap, toUpload, changedIds, adopted };
}

export function mergeFetched({
  bookMap,
  fetched,
  openId,
}: {
  bookMap: Map<string, BookRecord>;
  fetched: BookRecord[];
  openId?: string;
}) {
  const map = new Map(bookMap);
  const conflicts: { local: BookRecord; cloud: BookRecord }[] = [];
  const blankIds: string[] = [];
  let openBookUpdated = false;

  for (const cloud of fetched) {
    if (isBlankBook(cloud)) {
      if (cloud.id !== openId) {
        blankIds.push(cloud.id);
        map.delete(cloud.id);
      }
      continue;
    }
    const existing = map.get(cloud.id);
    if (!existing) {
      map.set(cloud.id, { ...cloud, cloudSyncedAt: cloud.savedAt });
      continue;
    }
    if (sameContent(existing, cloud)) {
      map.set(cloud.id, withLocalOnlyFields(cloud, existing));
      continue;
    }
    const synced = existing.cloudSyncedAt;
    const localEdited = synced === undefined || existing.savedAt > synced;
    const cloudEdited = synced === undefined || cloud.savedAt > synced;
    const clash =
      synced === undefined
        ? Math.abs(cloud.savedAt - existing.savedAt) < SAME_SAVE_WINDOW_MS
        : localEdited && cloudEdited;
    if (clash) {
      conflicts.push({ local: existing, cloud });
    } else if (localEdited && !cloudEdited) {
      continue;
    } else {
      map.set(cloud.id, withLocalOnlyFields(cloud, existing));
      if (cloud.id === openId) openBookUpdated = true;
    }
  }

  return { bookMap: map, conflicts, blankIds, openBookUpdated };
}
