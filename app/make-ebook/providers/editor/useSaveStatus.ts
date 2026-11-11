"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAutoSave, useUnsavedChangesWarning } from "../../hooks/useAutoSave";
import { useSaveBook } from "../../hooks/useSaveBook";
import { bookStore } from "../../storage/bookStore";
import { isBlankBook } from "../../utils/bookLibrary";
import { isHydrated } from "../../state/appPhase";
import type { BookModel } from "../BookProvider";
import type { SessionState } from "../SessionProvider";
import type { SetDialog } from "../types";

type SaveBookParams = Parameters<typeof useSaveBook>[0];

interface Params {
  session: SessionState;
  bookModel: BookModel;
  setDialogState: SetDialog;
  newBookConfirmOpen: boolean;
  setNewBookConfirmOpen: (open: boolean) => void;
  setEpubBlob: (blob: Blob | null) => void;
  setShowEPUBReader: (open: boolean) => void;
  closeExportHistoryModal: () => void;
  saveVersion: SaveBookParams["saveVersion"];
  saveExport: SaveBookParams["saveExport"];
  exportHistory: SaveBookParams["exportHistory"];
  getExportBlob: SaveBookParams["getExportBlob"];
}

export function useSaveStatus({
  session,
  bookModel,
  setDialogState,
  newBookConfirmOpen,
  setNewBookConfirmOpen,
  setEpubBlob,
  setShowEPUBReader,
  closeExportHistoryModal,
  saveVersion,
  saveExport,
  exportHistory,
  getExportBlob,
}: Params) {
  const { user, hasCloudSync, cloudSync, phase } = session;
  const { book, actions, editorSessionRef } = bookModel;
  const {
    chapters,
    title,
    author,
    blurb,
    publisher,
    pubDate,
    isbn,
    language,
    genre,
    typography,
    tags,
    coverUrl,
    endnotes,
    endnoteReferences,
    currentBookId,
    libraryBooks,
    loadToken,
  } = book;

  const hasContent =
    chapters.length > 0 &&
    (!!currentBookId ||
      !isBlankBook({ title, author, blurb, coverFile: coverUrl, chapters }));

  const autosave = useAutoSave({
    onSave: () => saveBook.saveBookDirectly(false, "later"),
    enabled: hasContent,
  });
  const { isDirty, isSaving, hasFailed, lastSaved, markDirty, markClean } =
    autosave;

  const saveBook = useSaveBook({
    title,
    author,
    blurb,
    publisher,
    pubDate,
    isbn,
    language,
    genre,
    typography,
    tags,
    chapters,
    setChapters: actions.setChapters,
    setEndnoteReferences: actions.setEndnoteReferences,
    coverUrl,
    endnotes,
    endnoteReferences,
    currentBookId,
    setCurrentBookId: actions.setCurrentBookId,
    user,
    hasCloudSync,
    saveVersion,
    saveExport,
    exportHistory,
    getExportBlob,
    setDialogState,
    setLibraryBooks: actions.setLibraryBooks,
    newBookConfirmOpen,
    setNewBookConfirmOpen,
    setEpubBlob,
    setShowEPUBReader,
    closeExportHistoryModal,
    markClean,
    getDirtyVersion: autosave.getVersion,
    editorSessionRef,
    clearEditorState: actions.startBlankBook,
  });

  const showDirty = isDirty && hasContent;

  async function flushSave() {
    if (isDirty) await saveBook.saveBookDirectly(false);
  }

  function reloadOpenBook(id: string) {
    if (isDirty) {
      toast("This book changed on another device.", {
        description: "Your edits here are unsaved.",
        action: {
          label: "Load theirs",
          onClick: () => {
            markClean();
            void actions.handleLoadBook(id, true);
          },
        },
        duration: 12000,
      });
      return;
    }
    void actions.handleLoadBook(id, true);
  }

  useUnsavedChangesWarning(showDirty);

  const hydrated = isHydrated(phase);
  const seenLoadRef = useRef(loadToken);
  useEffect(() => {
    if (seenLoadRef.current !== loadToken) {
      seenLoadRef.current = loadToken;
      return;
    }
    if (hydrated && chapters.length > 0) markDirty();
  }, [
    loadToken,
    chapters,
    title,
    author,
    blurb,
    publisher,
    pubDate,
    isbn,
    language,
    genre,
    typography,
    tags,
    coverUrl,
    endnotes,
    endnoteReferences,
  ]);

  const openUploadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hasCloudSync || !cloudSync.initialSyncDone) return;
    if (!user?.id || !currentBookId) return;
    if (openUploadRef.current === currentBookId) return;
    const found = libraryBooks.find((b) => b.id === currentBookId);
    if (!found || found.syncedRevision > 0 || isBlankBook(found)) return;
    openUploadRef.current = currentBookId;
    void saveBook.pushNow(currentBookId);
  }, [
    hasCloudSync,
    cloudSync.initialSyncDone,
    user?.id,
    currentBookId,
    libraryBooks,
  ]);

  return {
    saveBook,
    status: { showDirty, isDirty, isSaving, hasFailed, lastSaved },
    markDirty,
    markClean,
    flushSave,
    reloadOpenBook,
  };
}
