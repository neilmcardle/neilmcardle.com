"use client";
import { useReducer, useRef } from "react";
import { track } from "@vercel/analytics";
import type { Chapter, Endnote, EndnoteReference } from "../../types";
import type { ExportInput } from "../../export/render";
import { newId } from "../../model/book";
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
  typography: string;
  tags: string[];
  coverUrl: string | null;
  chapters: Chapter[];
  endnotes: Endnote[];
  endnoteReferences: EndnoteReference[];
}

export function fileName(title: string, ext: string) {
  return `${title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.${ext}`;
}

export function exportInput(
  book: ExportBook,
  chapters: Chapter[],
  endnoteReferences: EndnoteReference[],
): ExportInput {
  return {
    title: book.title,
    author: book.author,
    blurb: book.blurb,
    publisher: book.publisher,
    pubDate: book.pubDate,
    isbn: book.isbn,
    language: book.language,
    genre: book.genre,
    tags: book.tags,
    coverFile: book.coverUrl,
    chapters,
    endnotes: book.endnotes,
    endnoteReferences,
    typography: book.typography,
  };
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
  const { title, author, chapters, endnoteReferences } = book;

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

      const [{ renderBook }, { bookIdentifier, buildEpub }] = await Promise.all(
        [import("../../export/render"), import("../../export/epub")],
      );
      const blob = await buildEpub(
        renderBook(exportInput(book, migratedChapters, migratedEndnoteRefs)),
        {
          identifier: bookIdentifier(book.isbn, newId()),
          modified: new Date(),
        },
      );

      await saveExport({
        title,
        author,
        wordCount: totalWords,
        chapterCount: migratedChapters.length,
        blob,
      }).catch((err) => console.error("Export history save failed:", err));

      setEpubBlob(blob);
      setShowEPUBReader(true);

      download(blob, fileName(title, "epub"));
    });
  }

  function handleExportPDF() {
    return runExport("pdf", async () => {
      const migratedChapters = ensureChapterIds(chapters);
      const [{ renderBook }, { printPdf }] = await Promise.all([
        import("../../export/render"),
        import("../../export/pdf"),
      ]);
      if (
        !printPdf(
          renderBook(exportInput(book, migratedChapters, endnoteReferences)),
        )
      )
        throw new Error("Allow pop-ups for this site to print the PDF.");
    });
  }

  function handleExportDocx() {
    return runExport("docx", async () => {
      const migratedChapters = ensureChapterIds(chapters);
      const [{ renderBook }, { buildDocx }] = await Promise.all([
        import("../../export/render"),
        import("../../export/docx"),
      ]);
      const blob = await buildDocx(
        renderBook(exportInput(book, migratedChapters, endnoteReferences)),
      );
      download(blob, fileName(title, "docx"));
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
