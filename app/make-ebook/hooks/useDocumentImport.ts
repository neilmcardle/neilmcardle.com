"use client";
import { useState, useRef } from "react";
import { Chapter } from "../types";

interface UseDocumentImportParams {
  resetMetadata: () => void;
  setTitle: (t: string) => void;
  setAuthor: (a: string) => void;
  setChapters: (chs: Chapter[]) => void;
  setSelectedChapter: (i: number) => void;
  setTags: (tags: string[]) => void;
  clearCover: () => void;
  setSidebarView: (view: 'library' | 'book' | 'chapters' | 'preview' | null) => void;
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
}: UseDocumentImportParams) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportDocument(file: File) {
    setImporting(true);
    setImportError(null);

    try {
      const { parseDocument, getSupportedFormats } = await import('../utils/documentParser');

      const extension = file.name.split('.').pop()?.toLowerCase();
      const supported = getSupportedFormats().map((f: string) => f.replace('.', ''));

      if (!extension || !supported.includes(extension)) {
        throw new Error(`Unsupported format. Supported: ${getSupportedFormats().join(', ')}`);
      }

      const parsed = await parseDocument(file);

      const newChapters: Chapter[] = parsed.chapters.map((ch: any, idx: number) => ({
        id: `chapter-${Date.now()}-${idx}`,
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

      setSidebarView('book');
      setImportDialogOpen(false);

    } catch (err) {
      console.error('Import error:', err);
      setImportError(err instanceof Error ? err.message : 'Failed to import document');
    } finally {
      setImporting(false);
    }
  }

  function handleImportFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImportDocument(file);
    }
    e.target.value = '';
  }

  function showImportDialog() {
    setImportError(null);
    setImportDialogOpen(true);
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
