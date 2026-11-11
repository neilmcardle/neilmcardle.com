"use client";
import { useReducer, useRef } from "react";
import { track } from "@vercel/analytics";
import type { Chapter, EndnoteReference } from "../../types";
import { exportEpub } from "../../utils/exportEpub";
import { exportPdf } from "../../utils/exportPdf";
import { exportDocx } from "../../utils/exportDocx";
import { keys, readLocal, writeLocal } from "../../storage/keys";
import { textStats } from "../../model/text";
import {
  describeExport,
  exportFlow,
  initialExport,
  type ExportFormat,
} from "../../state/exportFlow";
import type { DialogConfig } from "../../state/overlays";
import {
  ensureChapterIds,
  migrateEndnoteReferences,
} from "../../utils/pageUtils";

export interface ExportBook {
  title: string;
  author: string;
  blurb: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  language: string;
  genre: string;
  tags: string[];
  coverUrl: string | null;
  chapters: Chapter[];
  endnoteReferences: EndnoteReference[];
}

interface Params {
  book: ExportBook;
  userId: string | undefined;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setEndnoteReferences: React.Dispatch<
    React.SetStateAction<EndnoteReference[]>
  >;
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
  setEpubBlob: (b: Blob | null) => void;
  setShowEPUBReader: (v: boolean) => void;
  closeExportHistoryModal: () => void;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function countWords(chapters: Chapter[]) {
  return chapters.reduce((sum, ch) => sum + textStats(ch.content).words, 0);
}

export function useExports({
  book,
  userId,
  setChapters,
  setEndnoteReferences,
  saveExport,
  exportHistory,
  getExportBlob,
  setDialogState,
  setEpubBlob,
  setShowEPUBReader,
  closeExportHistoryModal,
}: Params) {
  const [exportState, dispatchExport] = useReducer(exportFlow, initialExport);
  const exportingRef = useRef(false);
  const { title, author, publisher, chapters, endnoteReferences } = book;

  function trackExport(format: "epub" | "pdf" | "docx") {
    track("book_exported", { format });
    if (userId && typeof window !== "undefined") {
      const flag = keys.firstExport(userId);
      if (!readLocal(flag)) {
        writeLocal(flag, "1");
        track("book_exported_first_time", { format });
      }
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

      const totalWords = countWords(migratedChapters);

      const blob = (await exportEpub({
        title,
        author,
        blurb: book.blurb,
        publisher,
        pubDate: book.pubDate,
        isbn: book.isbn,
        language: book.language,
        genre: book.genre,
        tags: book.tags,
        coverFile: book.coverUrl,
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

      download(blob, `${title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`);
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
      download(
        new Blob([blob], { type: "application/epub+zip" }),
        `${exportMeta.title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`,
      );
    }
  }

  return {
    ...describeExport(exportState),
    handleExportEPUB,
    handleExportPDF,
    handleExportDocx,
    handlePreviewExport,
    handleDownloadExport,
  };
}
