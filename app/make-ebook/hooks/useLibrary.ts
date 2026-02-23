"use client";
import { useState } from "react";
import { Endnote, EndnoteReference } from "../types";
import { exportEpub } from "../utils/exportEpub";
import { loadBookLibrary, loadBookById, removeBookFromLibrary } from "../utils/bookLibrary";
import { ensureChapterIds, migrateEndnoteReferences } from "../utils/pageUtils";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  variant: 'confirm' | 'alert' | 'destructive';
  confirmLabel?: string;
  onConfirm: () => void;
}

interface UseLibraryParams {
  libraryBooks: any[];
  setLibraryBooks: (books: any[]) => void;
  user: { id: string } | null;
  hasCloudSync: boolean;
  currentBookId: string | undefined;
  isLoadingBookRef: React.MutableRefObject<boolean>;
  setShowMarketingPage: (v: boolean) => void;
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
  setSidebarView: (view: 'library' | 'book' | 'chapters' | 'preview' | null) => void;
  setBookJustLoaded: (v: boolean) => void;
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
  clearEditorState: () => void;
}

export function useLibrary({
  libraryBooks, setLibraryBooks,
  user, hasCloudSync, currentBookId,
  isLoadingBookRef,
  setShowMarketingPage, loadMetadata,
  setTags, setCoverUrl, setChapters, setEndnoteReferences,
  setEndnotes, setNextEndnoteNumber, setCurrentBookId,
  setSelectedChapter, setMobileSidebarOpen, setSidebarView,
  setBookJustLoaded, setDialogState, clearEditorState,
}: UseLibraryParams) {
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  function cleanupExportHistory(bookId: string) {
    try {
      const req = indexedDB.open('makeEbookExports', 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('exports', 'readwrite');
        const store = tx.objectStore('exports');
        const idx = store.index('bookId');
        const cursor = idx.openCursor(IDBKeyRange.only(bookId));
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (c) { c.delete(); c.continue(); }
        };
      };
    } catch (e) { /* non-critical */ }
  }

  function handleLoadBook(id: string) {
    const loaded = loadBookById(user?.id ?? '', id);
    if (loaded) {
      isLoadingBookRef.current = true;
      setShowMarketingPage(false);
      loadMetadata({ ...loaded, id: loaded.id });
      setTags(loaded.tags || []);
      setCoverUrl(loaded.coverFile || null);

      const loadedChapters = loaded.chapters && Array.isArray(loaded.chapters) && loaded.chapters.length > 0
        ? loaded.chapters
        : [{ id: `chapter-${Date.now()}`, title: "", content: "", type: "content" as const }];
      const migratedChapters = ensureChapterIds(loadedChapters);
      setChapters(migratedChapters);

      if (loaded.endnoteReferences) {
        const migratedEndnoteRefs = migrateEndnoteReferences(loaded.endnoteReferences, migratedChapters);
        setEndnoteReferences(migratedEndnoteRefs);
      }

      const loadedEndnotes = loaded.endnotes || [];
      setEndnotes(loadedEndnotes);
      const maxNumber = loadedEndnotes.reduce((max: number, e: Endnote) => Math.max(max, e.number), 0);
      setNextEndnoteNumber(maxNumber + 1);
      setCurrentBookId(loaded.id);
      setSelectedChapter(0);

      setMobileSidebarOpen(false);
      setSidebarView(null);

      setBookJustLoaded(true);
      setTimeout(() => setBookJustLoaded(false), 1000);

      setTimeout(() => { isLoadingBookRef.current = false; }, 0);
    }
  }

  function handleDeleteBook(id: string) {
    setDialogState({
      open: true,
      title: 'Delete Book',
      message: 'Are you sure you want to delete this eBook? This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDialogState(prev => ({ ...prev, open: false }));
        const bookToDelete = libraryBooks.find((b: any) => b.id === id);

        if (user && user.id && hasCloudSync) {
          try {
            const { deleteEbookFromSupabase } = await import('@/lib/supabaseEbooks');
            await deleteEbookFromSupabase(id, user.id, bookToDelete?.title);
          } catch (err) {
            console.error('Failed to delete from Supabase:', err);
            setDialogState({
              open: true,
              title: 'Delete Failed',
              message: 'Could not delete from cloud. The book was kept to prevent data loss. Please try again.',
              variant: 'alert',
              onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
            });
            return;
          }
        }

        removeBookFromLibrary(user?.id ?? '', id);
        setLibraryBooks(loadBookLibrary(user?.id ?? ''));

        try { localStorage.removeItem(`makeebook-versions-${id}`); } catch (e) { /* non-critical */ }
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
      title: 'Delete Books',
      message: `Are you sure you want to delete ${count} book${count > 1 ? 's' : ''}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDialogState(prev => ({ ...prev, open: false }));
        let cloudFailed = false;

        for (const id of selectedBookIds) {
          const bookToDelete = libraryBooks.find((b: any) => b.id === id);

          if (user && user.id && hasCloudSync) {
            try {
              const { deleteEbookFromSupabase } = await import('@/lib/supabaseEbooks');
              await deleteEbookFromSupabase(id, user.id, bookToDelete?.title);
            } catch (err) {
              console.error('Failed to delete from Supabase:', err);
              cloudFailed = true;
              continue;
            }
          }

          removeBookFromLibrary(user?.id ?? '', id);

          try { localStorage.removeItem(`makeebook-versions-${id}`); } catch (e) { /* non-critical */ }
          cleanupExportHistory(id);

          if (currentBookId === id) {
            clearEditorState();
          }
        }

        setLibraryBooks(loadBookLibrary(user?.id ?? ''));
        setSelectedBookIds(new Set());
        setMultiSelectMode(false);

        if (cloudFailed) {
          setDialogState({
            open: true,
            title: 'Some Deletes Failed',
            message: 'Some books could not be deleted from the cloud. They were kept locally to prevent data loss.',
            variant: 'alert',
            onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
          });
        }
      },
    });
  }

  function toggleBookSelection(id: string) {
    setSelectedBookIds(prev => {
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
    const migratedEndnoteRefs = migrateEndnoteReferences(book.endnoteReferences || [], migratedChapters);

    await exportEpub({
      title: book.title,
      author: book.author,
      blurb: book.blurb,
      publisher: book.publisher,
      pubDate: book.pubDate,
      isbn: book.isbn,
      language: book.language,
      genre: book.genre,
      tags: book.tags,
      coverFile: book.coverFile || null,
      chapters: migratedChapters,
      endnoteReferences: migratedEndnoteRefs,
    });
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
