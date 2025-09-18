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
  const dragThreshold = 15; // pixels to move before considering it a drag
  const [ghostPillPosition, setGhostPillPosition] = useState<{x: number, y: number, visible: boolean}>({
    x: 0, 
    y: 0, 
    visible: false
  });
  const [ghostPillContent, setGhostPillContent] = useState<{title: string, isSelected: boolean}>({
    title: '',
    isSelected: false
  });
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const autoScrollInterval = useRef<number | null>(null);

  function startAutoScroll(touchX: number) {
    const scrollContainer = document.querySelector('.chapter-pills-container') as HTMLElement;
    if (!scrollContainer) return;
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const edgeThreshold = 50; // pixels from edge to trigger scroll
    const scrollSpeed = 3; // base scroll speed
    
    const leftEdge = containerRect.left;
    const rightEdge = containerRect.right;
    
    let scrollDirection = 0;
    if (touchX < leftEdge + edgeThreshold) {
      scrollDirection = -1; // scroll left
    } else if (touchX > rightEdge - edgeThreshold) {
      scrollDirection = 1; // scroll right
    }
    
    if (scrollDirection !== 0) {
      if (autoScrollInterval.current) {
        cancelAnimationFrame(autoScrollInterval.current);
      }
      
      function scroll() {
        if (scrollContainer) {
          scrollContainer.scrollBy({ left: scrollDirection * scrollSpeed });
          autoScrollInterval.current = requestAnimationFrame(scroll);
        }
      }
      autoScrollInterval.current = requestAnimationFrame(scroll);
    } else {
      stopAutoScroll();
    }
  }
  
  function stopAutoScroll() {
    if (autoScrollInterval.current) {
      cancelAnimationFrame(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }

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
    setDragItemIndex(index);
    isDragging.current = false;
    
    // Store initial touch position
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    // Prepare ghost pill content
    const chapter = chapters[index];
    const displayTitle = chapter?.title?.trim() || `Chapter ${index + 1}`;
    setGhostPillContent({
      title: displayTitle,
      isSelected: selectedChapter === index
    });
  }
  function handleTouchMove(index: number, e: React.TouchEvent) {
    if (!touchStartPos.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    
    // Only start drag behavior for primarily vertical movements beyond threshold
    // Allow horizontal scrolling by requiring vertical movement to be greater than horizontal
    if ((deltaY > dragThreshold) && (deltaY > deltaX + 5)) {
      // Prevent scrolling once we're actually dragging
      e.preventDefault();
      e.stopPropagation();
      
      if (!isDragging.current) {
        isDragging.current = true;
        
        // Add haptic feedback for drag start
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        
        // Disable page scrolling but allow container scrolling during drag
        const scrollContainer = document.querySelector('.chapter-pills-container') as HTMLElement;
        if (scrollContainer) {
          scrollContainer.style.touchAction = 'none';
        }
        
        // Show ghost pill at finger position (allow movement beyond viewport)
        setGhostPillPosition({
          x: touch.clientX - 80, // Offset to center pill under finger
          y: touch.clientY - 20,
          visible: true
        });
      } else {
        // Update ghost pill position while dragging (allow movement beyond viewport)
        setGhostPillPosition(prev => ({
          ...prev,
          x: touch.clientX - 80,
          y: touch.clientY - 20
        }));
      }
      
      // Start auto-scroll if near edges
      startAutoScroll(touch.clientX);
      
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
    // Stop auto-scroll and re-enable touch scrolling
    stopAutoScroll();
    const scrollContainer = document.querySelector('.chapter-pills-container') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.style.touchAction = 'pan-x';
    }
    
    // Only handle drag end if we were actually dragging
    if (isDragging.current) {
      const dragWasSuccessful = dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current;
      
      handleDragEnd();
      
      // Add haptic feedback based on drag result
      if (navigator.vibrate) {
        if (dragWasSuccessful) {
          // Success: double vibration
          navigator.vibrate([100, 50, 100]);
        } else {
          // No change or invalid: single short vibration
          navigator.vibrate(30);
        }
      }
    }
    
    // Hide ghost pill and reset all drag states
    setGhostPillPosition({ x: 0, y: 0, visible: false });
    setDragItemIndex(null);
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
    ghostPillPosition,
    ghostPillContent,
    dragItemIndex,
  };
}