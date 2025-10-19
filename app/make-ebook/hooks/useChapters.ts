import { useState, useRef } from "react";
import { uuidv4 } from "../utils/uuid";
import { Chapter } from "../types";

export function useChapters(initial: Chapter[] = [{ id: uuidv4(), title: "", content: "", type: "content" }]) {
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
  const [ghostPillContent, setGhostPillContent] = useState<{title: string, isSelected: boolean, type: 'frontmatter' | 'content' | 'backmatter'}>({
    title: '',
    isSelected: false,
    type: 'content'
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

  function handleAddChapter(chapterType: 'frontmatter' | 'content' | 'backmatter' = 'content', customTitle?: string) {
    // Get template content based on title
    const getTemplateContent = (title: string) => {
      switch (title) {
        case 'Chapter':
          return 'Write your chapter content here. You can add text, format it with bold, italic, and other styling options.\n\nThis is where your story or main content will go. Feel free to delete this placeholder text and start writing.';
        case 'Preface':
          return 'The preface is where the author explains the purpose, scope, and approach of the book. It\'s your opportunity to connect with readers before they dive into the main content.\n\nYou might want to explain:\n• Why you wrote this book\n• Who it\'s intended for\n• How to best use the book\n• Any acknowledgments or special thanks';
        case 'Introduction':
          return 'The introduction sets the stage for your book. It should engage readers and provide them with the context they need to understand what follows.\n\nConsider including:\n• An overview of what readers will learn\n• The main themes or arguments\n• How the book is structured\n• What makes this book unique or valuable';
        case 'Dedication':
          return 'To [Name],\n\nwho [reason for dedication].\n\nWith love and gratitude.';
        case 'Acknowledgments':
          return 'I would like to thank the following people who made this book possible:\n\n• [Name] - for [contribution]\n• [Name] - for [contribution]\n• [Organization] - for [support]\n\nSpecial thanks to [specific person or group] for their invaluable support throughout this project.\n\nAny errors or omissions remain entirely my own.';
        case 'Foreword':
          return '[This section is typically written by someone other than the author]\n\nIt is my pleasure to introduce this important work by [Author Name]. [Brief explanation of your relationship to the author or expertise in the subject].\n\n[Why this book is significant, timely, or valuable]\n\n[Your name and credentials]';
        case 'Prologue':
          return 'This opening section sets the scene before the main narrative begins. It might provide background information, establish the setting, or introduce key concepts that will be important throughout the book.\n\nThe prologue should intrigue readers and make them want to continue reading.';
        case 'Epilogue':
          return 'The epilogue provides closure and reflection on the events or ideas presented in the main content. It\'s an opportunity to:\n\n• Summarize key takeaways\n• Reflect on the journey or lessons learned\n• Look toward the future\n• Provide final thoughts or inspiration for readers';
        case 'Part':
          return 'PART [NUMBER]: [PART TITLE]\n\n[Brief description of what this part covers and how it fits into the overall structure of the book]';
        case 'Endnotes':
          return 'Notes and References\n\n[Your endnotes will automatically appear here when you add them using the endnote tool in the editor]';
        case 'Bibliography':
          return 'Bibliography\n\n[List your sources here in your preferred citation style]\n\nExample entries:\n\n• Author, A. (Year). Title of Book. Publisher.\n\n• Author, B. (Year). "Title of Article." Journal Name, Volume(Issue), pages.\n\n• Author, C. (Year). "Title of Web Article." Website Name. URL';
        case 'Glossary':
          return 'Glossary\n\nDefinitions of key terms used throughout this book:\n\n**Term 1**: Definition of the first important term.\n\n**Term 2**: Definition of the second important term.\n\n**Term 3**: Definition of the third important term.\n\n[Add more terms as needed, organized alphabetically]';
        case 'Index':
          return 'Index\n\n[An alphabetical list of topics, names, and concepts with internal links. Use anchor links rather than page numbers for eBooks]\n\n**How to create anchors and links:**\n1. In your content: Use the ⚓ (anchor) button in the editor to create anchors\n2. In your index: Create links using <a href="#anchor-id">Topic Name</a>\n\n**Examples:**\nFirst, create anchors in your chapters using the ⚓ button:\n- At the start of Chapter 1: creates <a id="chapter-1"></a>\n- Before important topics: creates <a id="topic-name"></a>\n\n**A**\n• <a href="#author-bio">Author biography</a>\n• <a href="#appendix-a">Appendix A</a>, <a href="#appendix-b">Appendix B</a>\n• <a href="#acknowledgments">Acknowledgments</a>\n\n**B**\n• <a href="#bibliography">Bibliography</a>\n• <a href="#book-structure">Book structure</a>, <a href="#chapter-organization">organization</a>\n\n**C**\n• <a href="#chapter-1">Chapter 1</a>, <a href="#chapter-2">Chapter 2</a>\n• <a href="#conclusions">Conclusions</a>, <a href="#final-thoughts">final thoughts</a>\n\n**E**\n• <a href="#epilogue">Epilogue</a>\n• <a href="#endnotes">Endnotes</a>, <a href="#endnote-1">note 1</a>, <a href="#endnote-15">note 15</a>\n\n[Continue with remaining entries... Each entry can link to multiple locations where the topic appears]';
        case 'Appendix':
          return 'Appendix\n\nAdditional Information and Resources\n\n[This section contains supplementary material that supports the main text but is too detailed or specialized for the main chapters]\n\n• Additional data or research\n• Detailed examples or case studies\n• Technical specifications\n• Extended quotes or documents\n• Useful resources for further reading';
        case 'About the Author':
          return 'About the Author\n\n[Author Name] is [brief professional description]. [He/She/They] [additional background, credentials, or experience relevant to the book\'s topic].\n\n[Author] has [relevant experience, education, or achievements]. [Optional: Previous works, awards, or recognition]\n\n[Author] currently [current position, location, or activities]. When not writing, [he/she/they] enjoys [personal interests or hobbies].\n\nFor more information, visit [website] or follow [social media handles].';
        default:
          return 'Start writing your content here...';
      }
    };

    const newChapter: Chapter = {
      id: uuidv4(),
      title: customTitle || "",
      content: customTitle ? getTemplateContent(customTitle) : "",
      type: chapterType
    };
    setChapters((chs) => [...chs, newChapter]);
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
    
    const chapterTitle = chapters[idx]?.title?.trim() || `Chapter ${idx + 1}`;
    const confirmMessage = `Are you sure you want to delete "${chapterTitle}"? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      setChapters((chs) => chs.filter((_, i) => i !== idx));
      setSelectedChapter((prev) => {
        if (prev > idx) return prev - 1;
        if (prev === idx) return 0;
        return prev;
      });
    }
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
      isSelected: selectedChapter === index,
      type: chapter?.type || 'content'
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