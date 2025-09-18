import { useState, useRef } from "react";
import { uuidv4 } from "../utils/uuid";

type Chapter = { title: string; content: string };

export function useChapters(initial: Chapter[] = [{ title: "", content: "" }]) {
  const [chapters, setChapters] = useState(initial);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  function handleAddChapter() {
    setChapters((chs) => [...chs, { title: "", content: "" }]);
    setSelectedChapter(chapters.length);
  }
  function handleSelectChapter(idx: number) { 
    // Prevent selection if we just finished dragging
    if (isDragging.current) return;
    setSelectedChapter(idx); 
  }
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
  function handleDragStart(index: number) { 
    dragItem.current = index;
    isDragging.current = true;
  }
  function handleDragEnter(index: number) { 
    dragOverItem.current = index;
    setDragOverIndex(index);
  }
  function handleDragEnd() {
    const from = dragItem.current;
    const to = dragOverItem.current;
    
    // Reset state first
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
    isDragging.current = false;
    
    // Early return if invalid drag
    if (from === null || to === null || from === to) { 
      return; 
    }
    
    // Perform the reordering
    const updated = [...chapters];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setChapters(updated);
    setSelectedChapter(to);
  }
  function handleTouchStart(index: number) { 
    dragItem.current = index;
    isDragging.current = false; // Reset dragging state
  }
  function handleTouchMove(index: number, e: React.TouchEvent) {
    // Prevent scrolling once we start dragging
    e.preventDefault();
    isDragging.current = true;
    
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const chapterEls = Array.from(document.querySelectorAll('[data-chapter-idx]'));
    if (!target) return;
    for (const el of chapterEls) {
      if (el.contains(target)) {
        const idx = Number((el as HTMLElement).dataset.chapterIdx);
        if (!isNaN(idx)) {
          dragOverItem.current = idx;
          setDragOverIndex(idx);
        }
      }
    }
  }
  function handleTouchEnd() { 
    handleDragEnd();
    // Reset dragging state after a short delay to prevent ghost clicks
    setTimeout(() => {
      isDragging.current = false;
      setDragOverIndex(null);
    }, 100);
  }

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
    isDragging,
    dragOverIndex,
  };
}