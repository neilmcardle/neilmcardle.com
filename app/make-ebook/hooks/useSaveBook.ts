"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Chapter, Endnote, EndnoteReference } from "../types";
import {
  loadBookLibrary,
  loadBookById,
  saveBookToLibrary,
  isBlankBook,
} from "../utils/bookLibrary";
import { toStoredCover } from "../utils/assetStore";
import { createSingleFlight } from "../state/singleFlight";
import {
  mergeSaveRequests,
  snapshotsVersion,
  type SaveRequest,
  type SaveResult,
} from "../state/save";
import type { DialogConfig } from "../state/overlays";
import { upgradeChapterIds, remapChapterIdsDeep } from "../utils/pageUtils";
import { useCloudPush } from "./save/useCloudPush";
import { useExports } from "./save/useExports";

interface UseSaveBookParams {
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
  setEndnoteReferences: React.Dispatch<
    React.SetStateAction<EndnoteReference[]>
  >;
  coverUrl: string | null;
  endnotes: Endnote[];
  endnoteReferences: EndnoteReference[];
  currentBookId: string | undefined;
  setCurrentBookId: (id: string) => void;

  user: { id: string; email?: string } | null;
  hasCloudSync: boolean;

  saveVersion: (
    title: string,
    author: string,
    chapters: Chapter[],
    metadata: {
      blurb?: string;
      publisher?: string;
      pubDate?: string;
      genre?: string;
      tags?: string[];
    },
  ) => void;
  saveExport: (params: {
    title: string;
    author: string;
    wordCount: number;
    chapterCount: number;
    blob: Blob;
  }) => Promise<unknown>;
  exportHistory: { id: string; title: string }[];
  getExportBlob: (id: string) => Promise<Blob | null>;

  setDialogState: React.Dispatch<React.SetStateAction<DialogConfig>>;
  setLibraryBooks: (books: any[]) => void;
  newBookConfirmOpen: boolean;
  setNewBookConfirmOpen: (v: boolean) => void;
  setEpubBlob: (b: Blob | null) => void;
  setShowEPUBReader: (v: boolean) => void;
  closeExportHistoryModal: () => void;
  markClean: (version?: number) => void;
  getDirtyVersion: () => number;
  editorSessionRef: React.MutableRefObject<number>;

  clearEditorState: () => void;
}

export function useSaveBook({
  title,
  author,
  blurb,
  publisher,
  pubDate,
  isbn,
  language,
  genre,
  tags,
  chapters,
  setChapters,
  setEndnoteReferences,
  coverUrl,
  endnotes,
  endnoteReferences,
  currentBookId,
  setCurrentBookId,
  user,
  hasCloudSync,
  saveVersion,
  saveExport,
  exportHistory,
  getExportBlob,
  setDialogState,
  setLibraryBooks,
  newBookConfirmOpen,
  setNewBookConfirmOpen,
  setEpubBlob,
  setShowEPUBReader,
  closeExportHistoryModal,
  markClean,
  getDirtyVersion,
  editorSessionRef,
  clearEditorState,
}: UseSaveBookParams) {
  const isSavingRef = useRef(false);
  const currentBookIdRef = useRef(currentBookId);
  const runSaveRef = useRef<(request: SaveRequest) => Promise<SaveResult>>(
    async () => "failed",
  );
  const [saveFlight] = useState(() =>
    createSingleFlight<SaveRequest, SaveResult>({
      run: (_key, request) => runSaveRef.current(request),
      merge: mergeSaveRequests,
      failed: "failed",
    }),
  );

  const { cloudPending, scheduleCloudPush, pushNow } = useCloudPush({
    user,
    hasCloudSync,
    setLibraryBooks,
    setDialogState,
  });

  const exports = useExports({
    book: {
      title,
      author,
      blurb,
      publisher,
      pubDate,
      isbn,
      language,
      genre,
      tags,
      coverUrl,
      chapters,
      endnoteReferences,
    },
    userId: user?.id,
    setChapters,
    setEndnoteReferences,
    saveExport,
    exportHistory,
    getExportBlob,
    setDialogState,
    setEpubBlob,
    setShowEPUBReader,
    closeExportHistoryModal,
  });

  function saveVersionSnapshot() {
    saveVersion(title, author, chapters, {
      blurb,
      publisher,
      pubDate,
      genre,
      tags,
    });
  }

  function saveBookDirectly(
    forceNewVersion: boolean,
    cloud: "now" | "later" = "now",
  ): Promise<SaveResult> {
    return saveFlight.request("save", { forceNewVersion, cloud });
  }

  async function runSave({
    forceNewVersion,
    cloud,
  }: SaveRequest): Promise<SaveResult> {
    const session = editorSessionRef.current;
    const version = getDirtyVersion();
    const openId = currentBookIdRef.current;

    if (
      (forceNewVersion || !openId) &&
      isBlankBook({ title, author, blurb, coverFile: coverUrl, chapters })
    ) {
      markClean(version);
      return "blank";
    }

    isSavingRef.current = true;

    try {
      const { chapters: syncedChapters, remap } = upgradeChapterIds(chapters);
      const syncedEndnoteRefs =
        remap.size > 0
          ? remapChapterIdsDeep(endnoteReferences, remap)
          : endnoteReferences;

      if (syncedChapters !== chapters) {
        setChapters(syncedChapters);
        if (remap.size > 0) setEndnoteReferences(syncedEndnoteRefs);
      }

      const previousMemory =
        openId && user?.id
          ? loadBookById(user.id, openId)?.bookmindMemory
          : undefined;

      const bookData = {
        id: forceNewVersion ? undefined : openId,
        title,
        author,
        blurb,
        publisher,
        pubDate,
        isbn,
        language,
        genre,
        tags,
        chapters: syncedChapters,
        coverFile: coverUrl,
        endnotes,
        endnoteReferences: syncedEndnoteRefs,
        bookmindMemory:
          remap.size > 0 && previousMemory
            ? remapChapterIdsDeep(previousMemory, remap)
            : previousMemory,
      };

      const localBookData = {
        ...bookData,
        coverFile: await toStoredCover(coverUrl),
      };

      let id: string;
      try {
        id = saveBookToLibrary(user?.id ?? "", localBookData);
      } catch (storageErr) {
        console.error("Local save failed:", storageErr);
        setDialogState({
          open: true,
          title: "Out of local storage",
          message:
            "This browser hit its storage limit, so the save did not finish. Large images inside chapters use the most room. Removing images, or books you no longer need, frees space.",
          variant: "alert",
          onConfirm: () => setDialogState((prev) => ({ ...prev, open: false })),
        });
        return "failed";
      }

      const stillOpen = () => editorSessionRef.current === session;

      if (stillOpen()) {
        currentBookIdRef.current = id;
        setCurrentBookId(id);
      }
      setLibraryBooks(loadBookLibrary(user?.id ?? ""));

      const confirmSaved = () => {
        if (!stillOpen()) return;
        markClean(version);
      };

      if (!(user && user.id && hasCloudSync)) {
        confirmSaved();
        return "saved";
      }

      if (cloud === "later") {
        confirmSaved();
        scheduleCloudPush(id);
        return "saved";
      }

      const ok = await pushNow(id);
      if (ok) confirmSaved();
      return ok ? "saved" : "failed";
    } finally {
      isSavingRef.current = false;
    }
  }

  useLayoutEffect(() => {
    currentBookIdRef.current = currentBookId;
    runSaveRef.current = runSave;
  });

  async function handleSaveBook() {
    const hasContent =
      title.trim() || author.trim() || chapters.some((ch) => ch.content.trim());
    if (!hasContent) return;

    const snapshot = saveVersionSnapshot;
    if (snapshotsVersion(await saveBookDirectly(false))) snapshot();
  }

  async function handleOverwriteBook() {
    const snapshot = saveVersionSnapshot;
    if (snapshotsVersion(await saveBookDirectly(false))) snapshot();

    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  async function handleSaveAsNewVersion() {
    const snapshot = saveVersionSnapshot;
    if (snapshotsVersion(await saveBookDirectly(true))) snapshot();

    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  return {
    isSavingRef,
    saveBookDirectly,
    pushNow,
    cloudPending,
    saveVersionSnapshot,
    handleSaveBook,
    handleOverwriteBook,
    handleSaveAsNewVersion,
    ...exports,
  };
}
