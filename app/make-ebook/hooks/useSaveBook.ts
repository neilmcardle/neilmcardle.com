"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { saveEbookToSupabase } from "@/lib/supabaseEbooks";
import { Chapter, Endnote, EndnoteReference } from "../types";
import { exportEpub } from "../utils/exportEpub";
import { exportPdf } from "../utils/exportPdf";
import { exportDocx } from "../utils/exportDocx";
import {
  loadBookLibrary,
  loadBookById,
  saveBookToLibrary,
  removeBookFromLibrary,
  isBlankBook,
  markBookSynced,
  parseCloudTime,
} from "../utils/bookLibrary";
import { toDisplayCover, toStoredCover } from "../utils/assetStore";
import { createSingleFlight } from "../state/singleFlight";
import {
  mergeSaveRequests,
  snapshotsVersion,
  type SaveRequest,
  type SaveResult,
} from "../state/save";
import {
  describeExport,
  exportFlow,
  initialExport,
  type ExportFormat,
} from "../state/exportFlow";

const CLOUD_IDLE_MS = 10000;
const CLOUD_MAX_WAIT_MS = 30000;
import {
  ensureChapterIds,
  migrateEndnoteReferences,
  upgradeChapterIds,
  remapChapterIdsDeep,
} from "../utils/pageUtils";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  variant: "confirm" | "alert" | "destructive";
  confirmLabel?: string;
  onConfirm: () => void;
}

interface ExportHistoryEntry {
  id: string;
  title: string;
}

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
  exportHistory: ExportHistoryEntry[];
  getExportBlob: (id: string) => Promise<Blob | null>;

  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
  setLibraryBooks: (books: any[]) => void;
  setSaveFeedback: (v: boolean) => void;
  setSaveDialogOpen: (v: boolean) => void;
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
  setSaveFeedback,
  setSaveDialogOpen,
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
  const cloudErrorShownRef = useRef(false);
  const cloudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudPendingSinceRef = useRef(0);
  const cloudFailuresRef = useRef(0);
  const cloudPendingIdRef = useRef<string | null>(null);
  const flushCloudRef = useRef<() => void>(() => {});
  const [cloudPending, setCloudPending] = useState(false);
  const currentBookIdRef = useRef(currentBookId);
  currentBookIdRef.current = currentBookId;
  const pushRef = useRef<(id: string) => Promise<boolean>>(async () => true);
  const renamedRef = useRef(new Map<string, string>());
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
  const [cloudFlight] = useState(() =>
    createSingleFlight<true, boolean>({
      run: (id) => pushRef.current(id),
      merge: () => true,
      failed: false,
    }),
  );
  const [exportState, dispatchExport] = useReducer(exportFlow, initialExport);
  const exportingRef = useRef(false);

  useEffect(
    () => () => {
      if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const flush = () => flushCloudRef.current();
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  pushRef.current = async (id: string) => {
    if (!(user?.id && hasCloudSync)) return true;
    id = renamedRef.current.get(id) ?? id;
    const stored = loadBookById(user.id, id);
    if (!stored) return true;
    try {
      const cover = await toDisplayCover(stored.coverFile).catch(() => null);
      const saved = await saveEbookToSupabase(
        { ...stored, coverFile: cover },
        stored.chapters,
        user.id,
      );
      const cloudId = saved?.id ?? id;
      if (cloudId !== id) {
        renamedRef.current.set(id, cloudId);
        removeBookFromLibrary(user.id, id);
        saveBookToLibrary(user.id, { ...stored, id: cloudId });
        if (currentBookIdRef.current === id) setCurrentBookId(cloudId);
      }
      markBookSynced(
        user.id,
        cloudId,
        saved?.updated_at ? parseCloudTime(saved.updated_at) : Date.now(),
      );
      setLibraryBooks(loadBookLibrary(user.id));
      cloudErrorShownRef.current = false;
      cloudFailuresRef.current = 0;
      return true;
    } catch (err) {
      console.error("Supabase sync failed:", err);
      cloudFailuresRef.current += 1;
      if (!cloudErrorShownRef.current) {
        cloudErrorShownRef.current = true;
        setDialogState({
          open: true,
          title: "Cloud sync failed",
          message:
            "Your book is saved on this device but could not reach the cloud. It keeps retrying in the background.",
          variant: "alert",
          onConfirm: () => setDialogState((prev) => ({ ...prev, open: false })),
        });
      }
      return false;
    }
  };

  function scheduleCloudPush(id: string) {
    if (!(user?.id && hasCloudSync)) return;
    cloudPendingIdRef.current = id;
    if (!cloudTimerRef.current) cloudPendingSinceRef.current = Date.now();
    else clearTimeout(cloudTimerRef.current);
    setCloudPending(true);
    const waited = Date.now() - cloudPendingSinceRef.current;
    const delay =
      cloudFailuresRef.current > 0
        ? Math.min(120000, 15000 * 2 ** (cloudFailuresRef.current - 1))
        : Math.max(0, Math.min(CLOUD_IDLE_MS, CLOUD_MAX_WAIT_MS - waited));
    cloudTimerRef.current = setTimeout(async () => {
      cloudTimerRef.current = null;
      const ok = await cloudFlight.request(id, true);
      if (ok) {
        cloudPendingIdRef.current = null;
        setCloudPending(false);
      } else scheduleCloudPush(id);
    }, delay);
  }

  async function pushNow(id: string) {
    if (!(user?.id && hasCloudSync)) return true;
    if (cloudTimerRef.current) {
      clearTimeout(cloudTimerRef.current);
      cloudTimerRef.current = null;
    }
    setCloudPending(true);
    const ok = await cloudFlight.request(id, true);
    if (ok) {
      cloudPendingIdRef.current = null;
      setCloudPending(false);
    } else scheduleCloudPush(id);
    return ok;
  }

  flushCloudRef.current = () => {
    const id = cloudPendingIdRef.current;
    if (!id || !cloudTimerRef.current) return;
    void pushNow(id);
  };

  function trackExport(format: "epub" | "pdf" | "docx") {
    track("book_exported", { format });
    if (user?.id && typeof window !== "undefined") {
      const flagKey = `mf_first_export_${user.id}`;
      if (!localStorage.getItem(flagKey)) {
        localStorage.setItem(flagKey, "1");
        track("book_exported_first_time", { format });
      }
    }
  }

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

  runSaveRef.current = async ({ forceNewVersion, cloud }) => {
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
        console.error("localStorage save failed:", storageErr);
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
        setSaveFeedback(true);
        markClean(version);
        setTimeout(() => setSaveFeedback(false), 1300);
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
  };

  async function handleSaveBook() {
    const hasContent =
      title.trim() || author.trim() || chapters.some((ch) => ch.content.trim());
    if (!hasContent) return;

    const snapshot = saveVersionSnapshot;
    if (snapshotsVersion(await saveBookDirectly(false))) snapshot();
  }

  async function handleOverwriteBook() {
    setSaveDialogOpen(false);
    const snapshot = saveVersionSnapshot;
    if (snapshotsVersion(await saveBookDirectly(false))) snapshot();

    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  async function handleSaveAsNewVersion() {
    setSaveDialogOpen(false);
    const snapshot = saveVersionSnapshot;
    if (snapshotsVersion(await saveBookDirectly(true))) snapshot();

    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  async function runExport(format: ExportFormat, work: () => Promise<void>) {
    if (exportingRef.current) return;
    exportingRef.current = true;
    dispatchExport({ type: "start", format });
    try {
      await work();
      trackExport(format);
      dispatchExport({ type: "done" });
    } catch (err) {
      console.error("Export failed:", err);
      const error =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong while building the file.";
      dispatchExport({ type: "failed", error });
      setDialogState({
        open: true,
        title: "Export failed",
        message: `Your book is safe, but the ${format.toUpperCase()} file could not be made. ${error}`,
        variant: "alert",
        onConfirm: () => {
          dispatchExport({ type: "dismiss" });
          setDialogState((prev) => ({ ...prev, open: false }));
        },
      });
    } finally {
      exportingRef.current = false;
    }
  }

  function handleExportEPUB() {
    return runExport("epub", async () => {
      const migratedChapters = ensureChapterIds(chapters);
      const migratedEndnoteRefs = migrateEndnoteReferences(
        endnoteReferences,
        migratedChapters,
      );

      if (chapters.some((ch) => !ch.id)) setChapters(migratedChapters);
      if (
        endnoteReferences.some((r) => !r.chapterId || r.chapterId === "unknown")
      )
        setEndnoteReferences(migratedEndnoteRefs);

      const totalWords = migratedChapters.reduce((sum, ch) => {
        const text = ch.content.replace(/<[^>]+>/g, " ");
        return (
          sum +
          text
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0).length
        );
      }, 0);

      const blob = (await exportEpub({
        title,
        author,
        blurb,
        publisher,
        pubDate,
        isbn,
        language,
        genre,
        tags,
        coverFile: coverUrl,
        chapters: migratedChapters,
        endnoteReferences: migratedEndnoteRefs,
        returnBlob: true,
      })) as Blob;

      await saveExport({
        title,
        author,
        wordCount: totalWords,
        chapterCount: migratedChapters.length,
        blob,
      }).catch((err) => console.error("Export history save failed:", err));

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
    });
  }

  function handleExportPDF() {
    return runExport("pdf", async () => {
      const migratedChapters = ensureChapterIds(chapters);
      exportPdf({ title, author, publisher, chapters: migratedChapters });
    });
  }

  function handleExportDocx() {
    return runExport("docx", async () => {
      const migratedChapters = ensureChapterIds(chapters);
      await exportDocx({
        title,
        author,
        publisher,
        chapters: migratedChapters,
      });
    });
  }

  async function handlePreviewExport(exportId: string) {
    const blob = await getExportBlob(exportId);
    if (blob) {
      setEpubBlob(blob);
      setShowEPUBReader(true);
      closeExportHistoryModal();
    }
  }

  async function handleDownloadExport(exportId: string) {
    const blob = await getExportBlob(exportId);
    const exportMeta = exportHistory.find((e) => e.id === exportId);

    if (blob && exportMeta) {
      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/epub+zip" }),
      );
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
    pushNow,
    cloudPending,
    ...describeExport(exportState),
    saveVersionSnapshot,
    handleSaveBook,
    handleOverwriteBook,
    handleSaveAsNewVersion,
    handleExportEPUB,
    handleExportPDF,
    handleExportDocx,
    handlePreviewExport,
    handleDownloadExport,
  };
}
