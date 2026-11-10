"use client";
import { useReducer, useRef } from "react";
import { uuidv4 } from "../utils/uuid";
import { Chapter } from "../types";
import {
  describeDocumentImport,
  documentImport,
  initialDocumentImport,
} from "../state/documentImport";
import type { SwitchBook } from "./useBookSwitch";

interface UseDocumentImportParams {
  resetMetadata: () => void;
  setTitle: (t: string) => void;
  setAuthor: (a: string) => void;
  setChapters: (chs: Chapter[]) => void;
  setSelectedChapter: (i: number) => void;
  setTags: (tags: string[]) => void;
  clearCover: () => void;
  setSidebarView: (view: "library" | "book" | "chapters" | null) => void;
  switchBook: SwitchBook;
}

export function useDocumentImport({
  resetMetadata,
  setTitle,
  setAuthor,
  setChapters,
  setSelectedChapter,
  setTags,
  clearCover,
  setSidebarView,
  switchBook,
}: UseDocumentImportParams) {
  const [state, dispatch] = useReducer(documentImport, initialDocumentImport);
  const { importDialogOpen, importing, importError } =
    describeDocumentImport(state);

  function setImportDialogOpen(open: boolean) {
    dispatch({ type: open ? "open" : "close" });
  }
  const importFileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportDocument(file: File) {
    dispatch({ type: "start" });

    try {
      const { parseDocument, getSupportedFormats } =
        await import("../utils/documentParser");

      const extension = file.name.split(".").pop()?.toLowerCase();
      const supported = getSupportedFormats().map((f: string) =>
        f.replace(".", ""),
      );

      if (!extension || !supported.includes(extension)) {
        throw new Error(
          `Unsupported format. Supported: ${getSupportedFormats().join(", ")}`,
        );
      }

      await switchBook({
        flush: true,
        prepare: () => parseDocument(file),
        apply: (parsed) => {
          const newChapters: Chapter[] = parsed.chapters.map((ch) => ({
            id: uuidv4(),
            title: ch.title,
            content: ch.content,
            type: ch.type,
          }));

          resetMetadata();
          setTitle(parsed.title);
          setAuthor(parsed.author);
          setChapters(newChapters);
          setSelectedChapter(0);
          setTags([]);
          clearCover();

          setSidebarView("book");
        },
      });
      dispatch({ type: "done" });
    } catch (err) {
      console.error("Import error:", err);
      dispatch({
        type: "failed",
        error: err instanceof Error ? err.message : "Failed to import document",
      });
    }
  }

  function handleImportFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImportDocument(file);
    }
    e.target.value = "";
  }

  function showImportDialog() {
    dispatch({ type: "open" });
  }

  return {
    importDialogOpen,
    setImportDialogOpen,
    importing,
    importError,
    importFileInputRef,
    handleImportDocument,
    handleImportFileSelect,
    showImportDialog,
  };
}
