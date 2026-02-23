"use client";
import { useRef } from "react";
import { saveEbookToSupabase } from "@/lib/supabaseEbooks";
import { Chapter, Endnote, EndnoteReference } from "../types";
import { TypographyPreset } from "../utils/typographyPresets";
import { exportEpub } from "../utils/exportEpub";
import { exportPdf } from "../utils/exportPdf";
import { loadBookLibrary, saveBookToLibrary, removeBookFromLibrary } from "../utils/bookLibrary";
import { ensureChapterIds, migrateEndnoteReferences } from "../utils/pageUtils";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  variant: 'confirm' | 'alert' | 'destructive';
  confirmLabel?: string;
  onConfirm: () => void;
}

interface ExportHistoryEntry {
  id: string;
  title: string;
}

interface UseSaveBookParams {
  // Book data
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
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setEndnoteReferences: React.Dispatch<React.SetStateAction<EndnoteReference[]>>;
  coverUrl: string | null;
  endnotes: Endnote[];
  endnoteReferences: EndnoteReference[];
  currentBookId: string | undefined;
  setCurrentBookId: (id: string) => void;
  // Auth & sync
  user: { id: string; email?: string } | null;
  hasCloudSync: boolean;
  // Version/export history
  saveVersion: (title: string, author: string, chapters: Chapter[], metadata: { blurb?: string; publisher?: string; pubDate?: string; genre?: string; tags?: string[] }) => void;
  saveExport: (params: { title: string; author: string; wordCount: number; chapterCount: number; blob: Blob }) => Promise<void>;
  exportHistory: ExportHistoryEntry[];
  getExportBlob: (id: string) => Promise<Blob | null>;
  typographyPreset: TypographyPreset;
  // State setters
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
  setLibraryBooks: (books: any[]) => void;
  setSaveFeedback: (v: boolean) => void;
  setSaveDialogOpen: (v: boolean) => void;
  newBookConfirmOpen: boolean;
  setNewBookConfirmOpen: (v: boolean) => void;
  setEpubBlob: (b: Blob | null) => void;
  setShowEPUBReader: (v: boolean) => void;
  setShowExportHistory: (v: boolean) => void;
  markClean: () => void;
  // Callback
  clearEditorState: () => void;
}

export function useSaveBook({
  title, author, blurb, publisher, pubDate, isbn, language, genre, tags,
  chapters, setChapters, setEndnoteReferences,
  coverUrl, endnotes, endnoteReferences,
  currentBookId, setCurrentBookId,
  user, hasCloudSync,
  saveVersion, saveExport, exportHistory, getExportBlob, typographyPreset,
  setDialogState, setLibraryBooks, setSaveFeedback,
  setSaveDialogOpen, newBookConfirmOpen, setNewBookConfirmOpen,
  setEpubBlob, setShowEPUBReader, setShowExportHistory,
  markClean, clearEditorState,
}: UseSaveBookParams) {
  const isSavingRef = useRef(false);

  function saveVersionSnapshot() {
    saveVersion(title, author, chapters, { blurb, publisher, pubDate, genre, tags });
  }

  async function saveBookDirectly(forceNewVersion: boolean) {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      const bookData = {
        id: forceNewVersion ? undefined : currentBookId,
        title, author, blurb, publisher, pubDate, isbn, language, genre, tags,
        chapters, coverFile: coverUrl, endnotes, endnoteReferences,
      };

      let id: string;
      try {
        id = saveBookToLibrary(user?.id ?? '', bookData);
      } catch (storageErr) {
        console.error('localStorage save failed:', storageErr);
        setDialogState({
          open: true,
          title: 'Storage Full',
          message: 'Your browser storage is full. Try deleting old books from your library to free up space.',
          variant: 'alert',
          onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
        });
        return;
      }

      setCurrentBookId(id);
      setLibraryBooks(loadBookLibrary(user?.id ?? ''));
      setSaveFeedback(true);
      markClean();
      setTimeout(() => setSaveFeedback(false), 1300);

      if (user && user.id && hasCloudSync) {
        try {
          const supabaseData = await saveEbookToSupabase(bookData, chapters, user.id);
          if (supabaseData?.id && supabaseData.id !== id) {
            removeBookFromLibrary(user.id, id);
            saveBookToLibrary(user.id, { ...bookData, id: supabaseData.id });
            setCurrentBookId(supabaseData.id);
            setLibraryBooks(loadBookLibrary(user.id));
          }
        } catch (err) {
          console.error('Supabase sync failed:', err);
          setDialogState({
            open: true,
            title: 'Cloud Sync Failed',
            message: 'Your book was saved locally, but cloud sync failed. Your changes will sync next time.',
            variant: 'alert',
            onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
          });
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }

  function handleSaveBook() {
    const hasContent = title.trim() || author.trim() || chapters.some(ch => ch.content.trim());
    if (!hasContent) return;

    if (currentBookId) {
      const library = loadBookLibrary(user?.id ?? '');
      const existingBook = library.find((b: any) => b.id === currentBookId);
      if (existingBook) {
        setSaveDialogOpen(true);
        return;
      }
    }

    saveBookDirectly(false);
    saveVersionSnapshot();
  }

  function handleOverwriteBook() {
    setSaveDialogOpen(false);
    saveBookDirectly(false);
    saveVersionSnapshot();

    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  function handleSaveAsNewVersion() {
    setSaveDialogOpen(false);
    saveBookDirectly(true);
    saveVersionSnapshot();

    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  async function handleExportEPUB() {
    const migratedChapters = ensureChapterIds(chapters);
    const migratedEndnoteRefs = migrateEndnoteReferences(endnoteReferences, migratedChapters);

    setChapters(migratedChapters);
    setEndnoteReferences(migratedEndnoteRefs);

    const totalWords = migratedChapters.reduce((sum, ch) => {
      const text = ch.content.replace(/<[^>]+>/g, ' ');
      return sum + text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }, 0);

    const blob = await exportEpub({
      title, author, blurb, publisher, pubDate, isbn, language, genre, tags,
      coverFile: coverUrl,
      chapters: migratedChapters,
      endnoteReferences: migratedEndnoteRefs,
      typographyPreset,
      returnBlob: true,
    }) as Blob;

    await saveExport({
      title, author,
      wordCount: totalWords,
      chapterCount: migratedChapters.length,
      blob,
    });

    setEpubBlob(blob);
    setShowEPUBReader(true);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    markClean();
  }

  function handleExportPDF() {
    const migratedChapters = ensureChapterIds(chapters);
    exportPdf({ title, author, publisher, chapters: migratedChapters, typographyPreset });
  }

  async function handlePreviewExport(exportId: string) {
    const blob = await getExportBlob(exportId);
    if (blob) {
      setEpubBlob(blob);
      setShowEPUBReader(true);
      setShowExportHistory(false);
    }
  }

  async function handleDownloadExport(exportId: string) {
    const blob = await getExportBlob(exportId);
    const exportMeta = exportHistory.find(e => e.id === exportId);

    if (blob && exportMeta) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportMeta.title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
  }

  return {
    isSavingRef,
    saveBookDirectly,
    saveVersionSnapshot,
    handleSaveBook,
    handleOverwriteBook,
    handleSaveAsNewVersion,
    handleExportEPUB,
    handleExportPDF,
    handlePreviewExport,
    handleDownloadExport,
  };
}
