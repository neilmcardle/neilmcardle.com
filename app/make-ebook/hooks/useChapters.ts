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
  const touchStartPos = useRef<{x: number, y: number} | null>(null);
  const dragThreshold = 8; // pixels to move before considering it a drag

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
  function handleTouchStart(index: number, e: React.TouchEvent) { 
    dragItem.current = index;
    isDragging.current = false;
    
    // Store initial touch position
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  }
  function handleTouchMove(index: number, e: React.TouchEvent) {
    if (!touchStartPos.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    
    // Only start drag behavior if we've moved beyond the threshold
    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      // Prevent scrolling once we're actually dragging
      e.preventDefault();
      e.stopPropagation();
      
      if (!isDragging.current) {
        isDragging.current = true;
        
        // Disable horizontal scrolling on the container during drag
        const scrollContainer = document.querySelector('.chapter-pills-container') as HTMLElement;
        if (scrollContainer) {
          scrollContainer.style.touchAction = 'none';
          scrollContainer.style.overflowX = 'hidden';
        }
      }
      
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
  }
  function handleTouchEnd() { 
    // Re-enable horizontal scrolling on the container
    const scrollContainer = document.querySelector('.chapter-pills-container') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.style.touchAction = 'pan-x';
      scrollContainer.style.overflowX = 'auto';
    }
    
    // Only handle drag end if we were actually dragging
    if (isDragging.current) {
      handleDragEnd();
    }
    
    // Reset all drag states
    touchStartPos.current = null;
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