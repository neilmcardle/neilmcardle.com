"use client";
import { toast } from "sonner";
import { bookStore } from "../../storage/bookStore";
import {
  BackupError,
  backupFileName,
  makeBackup,
  mergeBackup,
  parseBackup,
} from "../../storage/backup";
import { loadBookLibrary } from "../../utils/bookLibrary";
import { toDisplayCover } from "../../utils/assetStore";
import type { BookUi } from "../types";

interface Params {
  userId: string | undefined;
  setLibraryBooks: (books: any[]) => void;
  openBookId: () => string | undefined;
  syncNow: (force?: boolean) => Promise<void>;
  ui: BookUi;
}

export function useBackup({
  userId: maybeUserId,
  setLibraryBooks,
  openBookId,
  syncNow,
  ui,
}: Params) {
  async function download() {
    if (!maybeUserId) return;
    await bookStore.flush();
    const books = await Promise.all(
      loadBookLibrary(maybeUserId).map(async (book) => ({
        ...book,
        coverFile: await toDisplayCover(book.coverFile).catch(() => null),
      })),
    );
    const blob = new Blob([JSON.stringify(makeBackup(books))], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function restore(file: File) {
    if (!maybeUserId) return;
    const userId = maybeUserId;
    try {
      const incoming = parseBackup(await file.text(), userId);
      await ui.flushSave();
      const { restored } = mergeBackup(loadBookLibrary(userId), incoming);
      restored.forEach((book) => bookStore.put(book));
      setLibraryBooks(loadBookLibrary(userId));
      toast(
        restored.length === 0
          ? "No books restored. Your library already has these versions."
          : restored.length === 1
            ? "Restored 1 book."
            : `Restored ${restored.length} books.`,
      );
      const openId = openBookId();
      if (openId && restored.some((book) => book.id === openId)) {
        ui.reloadOpenBook(openId);
      }
      if (restored.length > 0) void syncNow(true);
    } catch (err) {
      console.error("Restore failed:", err);
      toast(
        err instanceof BackupError
          ? err.message
          : "That backup could not be restored.",
      );
    }
  }

  return { download, restore };
}
