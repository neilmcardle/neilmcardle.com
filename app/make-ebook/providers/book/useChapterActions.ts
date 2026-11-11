"use client";
import { useCallback } from "react";
import type { EndnoteReference } from "../../types";
import type { useChapters } from "../../hooks/useChapters";
import type { BookUi } from "../types";

interface Params {
  chaptersHook: ReturnType<typeof useChapters>;
  setEndnoteReferences: React.Dispatch<
    React.SetStateAction<EndnoteReference[]>
  >;
  ui: BookUi;
}

export function useChapterActions({
  chaptersHook,
  setEndnoteReferences,
  ui,
}: Params) {
  const {
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    handleRemoveChapter: handleRemoveChapterRaw,
  } = chaptersHook;
  const { setDialogState, markDirty } = ui;

  const handleRemoveChapter = useCallback(
    (idx: number) => {
      handleRemoveChapterRaw(idx, (message, onConfirm) => {
        setDialogState({
          open: true,
          title: "Delete Chapter",
          message,
          variant: "destructive",
          confirmLabel: "Delete",
          onConfirm: () => {
            setDialogState((prev) => ({ ...prev, open: false }));
            const deletedChapterId = chapters[idx]?.id;
            onConfirm();
            if (deletedChapterId) {
              setEndnoteReferences((prev) =>
                prev.filter((ref) => ref.chapterId !== deletedChapterId),
              );
            }
          },
        });
      });
    },
    [handleRemoveChapterRaw, chapters, setDialogState, setEndnoteReferences],
  );

  const confirmChapterDelete = useCallback(
    (idx: number) => {
      const deletedChapterId = chapters[idx]?.id;
      handleRemoveChapterRaw(idx);
      if (deletedChapterId) {
        setEndnoteReferences((prev) =>
          prev.filter((ref) => ref.chapterId !== deletedChapterId),
        );
      }
    },
    [handleRemoveChapterRaw, chapters, setEndnoteReferences],
  );

  const handleToggleChapterLock = useCallback(
    (index: number) => {
      setChapters((prev) =>
        prev.map((ch, i) => (i === index ? { ...ch, locked: !ch.locked } : ch)),
      );
    },
    [setChapters],
  );

  const handleToggleChapterComplete = useCallback(
    (index: number) => {
      setChapters((prev) =>
        prev.map((ch, i) =>
          i === index ? { ...ch, completed: !ch.completed } : ch,
        ),
      );
      markDirty();
    },
    [setChapters, markDirty],
  );

  const handleBulkComplete = useCallback(
    (ids: Set<string>, completed: boolean) => {
      setChapters((prev) =>
        prev.map((ch) => (ids.has(ch.id) ? { ...ch, completed } : ch)),
      );
      markDirty();
    },
    [setChapters, markDirty],
  );

  const handleBulkDelete = useCallback(
    (ids: Set<string>, done: () => void) => {
      const remaining = chapters.filter((ch) => !ids.has(ch.id));
      if (remaining.length === 0) return;
      const count = ids.size;
      setDialogState({
        open: true,
        title: count === 1 ? "Delete chapter" : `Delete ${count} chapters`,
        message:
          count === 1
            ? "This chapter will be deleted. This cannot be undone."
            : `These ${count} chapters will be deleted. This cannot be undone.`,
        variant: "destructive",
        confirmLabel: "Delete",
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, open: false }));
          const currentId = chapters[selectedChapter]?.id;
          const index = remaining.findIndex((ch) => ch.id === currentId);
          setChapters(remaining);
          setSelectedChapter(index >= 0 ? index : 0);
          setEndnoteReferences((prev) =>
            prev.filter((ref) => !ids.has(ref.chapterId)),
          );
          markDirty();
          done();
        },
      });
    },
    [
      chapters,
      selectedChapter,
      setChapters,
      setSelectedChapter,
      markDirty,
      setDialogState,
      setEndnoteReferences,
    ],
  );

  return {
    handleRemoveChapter,
    confirmChapterDelete,
    handleToggleChapterLock,
    handleToggleChapterComplete,
    handleBulkComplete,
    handleBulkDelete,
  };
}
