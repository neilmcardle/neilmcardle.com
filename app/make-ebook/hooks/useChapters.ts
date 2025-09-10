import { useState, useRef } from "react";
import { uuidv4 } from "../utils/uuid";

type Chapter = { title: string; content: string };

export function useChapters(initial: Chapter[] = [{ title: "", content: "" }]) {
  const [chapters, setChapters] = useState(initial);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function handleAddChapter() {
    setChapters((chs) => [...chs, { title: "", content: "" }]);
    setSelectedChapter(chapters.length);
  }
  function handleSelectChapter(idx: number) { setSelectedChapter(idx); }
  function handleChapterTitleChange(idx: number, value: string) {
    setChapters((chs) => chs.map((ch, i) => (i === idx ? { ...ch, title: value } : ch)));
  }
  function handleChapterContentChange(idx: number, value: string) {
    setChapters((chs) => chs.map((ch, i) => (i === idx ? { ...ch, content: value } : ch)));
  }
  function handleRemoveChapter(idx: number) {
    if (chapters.length <= 1) return;
    setChapters((chs) => chs.filter((_, i) => i !== idx));
    setSelectedChapter((prev) => {
      if (prev > idx) return prev - 1;
      if (prev === idx) return 0;
      return prev;
    });
  }
  function handleDragStart(index: number) { dragItem.current = index; }
  function handleDragEnter(index: number) { dragOverItem.current = index; }
  function handleDragEnd() {
    const from = dragItem.current;
    const to = dragOverItem.current;
    const updated = [...chapters];
    const [removed] = updated.splice(from!, 1);
    if (from === null || to === null || from === to) { dragItem.current = null; dragOverItem.current = null; return; }
    updated.splice(to, 0, removed);
    setChapters(updated);
    setSelectedChapter(to);
    dragItem.current = null;
    dragOverItem.current = null;
  }
  function handleTouchStart(index: number) { dragItem.current = index; }
  function handleTouchMove(index: number, e: React.TouchEvent) {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const chapterEls = Array.from(document.querySelectorAll('[data-chapter-idx]'));
    if (!target) return;
    for (const el of chapterEls) {
      if (el.contains(target)) {
        const idx = Number((el as HTMLElement).dataset.chapterIdx);
        if (!isNaN(idx)) dragOverItem.current = idx;
      }
    }
  }
  function handleTouchEnd() { handleDragEnd(); }

  return {
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    handleAddChapter,
    handleSelectChapter,
    handleChapterTitleChange,
    handleChapterContentChange,
    handleRemoveChapter,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}