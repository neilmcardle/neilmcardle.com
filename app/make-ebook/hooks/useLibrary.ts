"use client";
import { useState } from "react";
import { toDisplayCover } from "../utils/assetStore";
import { clearVersions, versionKey } from "../utils/versionStore";
import { uuidv4 } from "../utils/uuid";
import { Endnote, EndnoteReference } from "../types";
import { renderBook } from "../export/render";
import { bookIdentifier, buildEpub } from "../export/epub";
import { fileName } from "./save/useExports";
import { newId } from "../model/book";
import {
  loadBookLibrary,
  loadBookById,
  removeBookFromLibrary,
} from "../utils/bookLibrary";
import { ensureChapterIds, migrateEndnoteReferences } from "../utils/pageUtils";
import type { SwitchBook } from "./useBookSwitch";
import { remove as removeFromCloud } from "../storage/cloudStore";
import type { DialogConfig as DialogState } from "../state/overlays";

interface UseLibraryParams {
  libraryBooks: any[];
  setLibraryBooks: (books: any[]) => void;
  user: { id: string } | null;
  hasCloudSync: boolean;
  currentBookId: string | undefined;
  onLoaded: () => void;
  loadMetadata: (data: any) => void;
  setTags: (tags: string[]) => void;
  setCoverUrl: (url: string | null) => void;
  setChapters: (chs: any[]) => void;
  setEndnoteReferences: (refs: EndnoteReference[]) => void;
  setEndnotes: (notes: Endnote[]) => void;
  setNextEndnoteNumber: (n: number) => void;
  setCurrentBookId: (id: string) => void;
  setSelectedChapter: (i: number) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  setSidebarView: (view: "library" | "book" | "chapters" | null) => void;
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
  clearEditorState: () => void;
  switchBook: SwitchBook;
}

export function useLibrary({
  libraryBooks,
  setLibraryBooks,
  user,
  hasCloudSync,
  currentBookId,
  onLoaded,
  loadMetadata,
  setTags,
  setCoverUrl,
  setChapters,
  setEndnoteReferences,
  setEndnotes,
  setNextEndnoteNumber,
  setCurrentBookId,
  setSelectedChapter,
  setMobileSidebarOpen,
  setSidebarView,
  setDialogState,
  clearEditorState,
  switchBook,
}: UseLibraryParams) {
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(
    new Set(),
  );
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  function cleanupExportHistory(bookId: string) {
    try {
      const req = indexedDB.open("makeEbookExports", 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("exports", "readwrite");
        const store = tx.objectStore("exports");
        const idx = store.index("bookId");
        const cursor = idx.openCursor(IDBKeyRange.only(bookId));
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (c) {
            c.delete();
            c.continue();
          }
        };
      };
    } catch {}
  }

  async function handleLoadBook(id: string, keepChapter = false) {
    await switchBook({
      flush: id !== currentBookId,
      prepare: async () => {
        const loaded = loadBookById(user?.id ?? "", id);
        if (!loaded) return null;
        const cover = await toDisplayCover(loaded.coverFile).catch(() => null);
        return { loaded, cover };
      },
      apply: ({ loaded, cover }) => {
        onLoaded();
        loadMetadata({ ...loaded, id: loaded.id });
        setTags(loaded.tags || []);
        setCoverUrl(cover);

        const loadedChapters =
          loaded.chapters &&
          Array.isArray(loaded.chapters) &&
          loaded.chapters.length > 0
            ? loaded.chapters
            : [
                {
                  id: uuidv4(),
                  title: "",
                  content: "",
                  type: "content" as const,
                },
              ];
        const migratedChapters = ensureChapterIds(loadedChapters);
        setChapters(migratedChapters);

        if (loaded.endnoteReferences) {
          const migratedEndnoteRefs = migrateEndnoteReferences(
            loaded.endnoteReferences,
            migratedChapters,
          );
          setEndnoteReferences(migratedEndnoteRefs);
        }

        const loadedEndnotes = loaded.endnotes || [];
        setEndnotes(loadedEndnotes);
        const maxNumber = loadedEndnotes.reduce(
          (max: number, e: Endnote) => Math.max(max, e.number),
          0,
        );
        setNextEndnoteNumber(maxNumber + 1);
        setCurrentBookId(loaded.id);
        if (!keepChapter) setSelectedChapter(0);

        setMobileSidebarOpen(false);
        setSidebarView(null);
      },
    });
  }

  function handleDeleteBook(id: string) {
    setDialogState({
      open: true,
      title: "Delete Book",
      message:
        "Are you sure you want to delete this eBook? This action cannot be undone.",
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, open: false }));
        if (user && user.id && hasCloudSync) {
          try {
            await removeFromCloud(id);
          } catch (err) {
            console.error("Failed to delete from Supabase:", err);
            setDialogState({
              open: true,
              title: "Delete Failed",
              message:
                "Could not delete from cloud. The book was kept to prevent data loss. Please try again.",
              variant: "alert",
              onConfirm: () =>
                setDialogState((prev) => ({ ...prev, open: false })),
            });
            return;
          }
        }

        removeBookFromLibrary(user?.id ?? "", id);
        if (user?.id && !hasCloudSync) void removeFromCloud(id).catch(() => {});
        setLibraryBooks(loadBookLibrary(user?.id ?? ""));

        void clearVersions(versionKey(user?.id, id));
        cleanupExportHistory(id);

        if (currentBookId === id) {
          clearEditorState();
        }
      },
    });
  }

  function handleDeleteSelectedBooks() {
    const count = selectedBookIds.size;
    if (count === 0) return;

    setDialogState({
      open: true,
      title: "Delete Books",
      message: `Are you sure you want to delete ${count} book${count > 1 ? "s" : ""}? This action cannot be undone.`,
      variant: "destructive",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setDialogState((prev) => ({ ...prev, open: false }));
        let cloudFailed = false;

        for (const id of selectedBookIds) {
          if (user && user.id && hasCloudSync) {
            try {
              await removeFromCloud(id);
            } catch (err) {
              console.error("Failed to delete from Supabase:", err);
              cloudFailed = true;
              continue;
            }
          }

          removeBookFromLibrary(user?.id ?? "", id);
          if (user?.id && !hasCloudSync) {
            void removeFromCloud(id).catch(() => {});
          }

          void clearVersions(versionKey(user?.id, id));
          cleanupExportHistory(id);

          if (currentBookId === id) {
            clearEditorState();
          }
        }

        setLibraryBooks(loadBookLibrary(user?.id ?? ""));
        setSelectedBookIds(new Set());
        setMultiSelectMode(false);

        if (cloudFailed) {
          setDialogState({
            open: true,
            title: "Some Deletes Failed",
            message:
              "Some books could not be deleted from the cloud. They were kept locally to prevent data loss.",
            variant: "alert",
            onConfirm: () =>
              setDialogState((prev) => ({ ...prev, open: false })),
          });
        }
      },
    });
  }

  function toggleBookSelection(id: string) {
    setSelectedBookIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selectedBookIds.size === libraryBooks.length) {
      setSelectedBookIds(new Set());
    } else {
      setSelectedBookIds(new Set(libraryBooks.map((b: any) => b.id)));
    }
  }

  async function handleExportLibraryBook(id: string) {
    const book = libraryBooks.find((b: any) => b.id === id);
    if (!book) return;

    const migratedChapters = ensureChapterIds(book.chapters);
    const migratedEndnoteRefs = migrateEndnoteReferences(
      book.endnoteReferences || [],
      migratedChapters,
    );

    const coverFile = await toDisplayCover(book.coverFile);
    const blob = await buildEpub(
      renderBook({
        title: book.title || "",
        author: book.author || "",
        blurb: book.blurb || "",
        publisher: book.publisher || "",
        pubDate: book.pubDate || "",
        isbn: book.isbn || "",
        language: book.language || "",
        genre: book.genre || "",
        tags: book.tags || [],
        coverFile,
        chapters: migratedChapters,
        endnotes: book.endnotes || [],
        endnoteReferences: migratedEndnoteRefs,
        typography: book.typography,
      }),
      {
        identifier: bookIdentifier(book.isbn || "", newId()),
        modified: new Date(),
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName(book.title || "", "epub");
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  return {
    selectedBookIds,
    setSelectedBookIds,
    multiSelectMode,
    setMultiSelectMode,
    cleanupExportHistory,
    handleLoadBook,
    handleDeleteBook,
    handleDeleteSelectedBooks,
    toggleBookSelection,
    toggleSelectAll,
    handleExportLibraryBook,
  };
}
