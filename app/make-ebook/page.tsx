"use client";

import React, { Suspense, useState, useRef, useLayoutEffect, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, TrashIcon, LibraryIcon, CloseIcon, SaveIcon, DownloadIcon, BookIcon, LockIcon, MetadataIcon, MenuIcon } from "./components/icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import DragIcon from "./components/icons/DragIcon";
import BinIcon from "./components/icons/BinIcon";
import { LANGUAGES, today } from "./utils/constants";
import { CHAPTER_TEMPLATES, Chapter, Endnote, EndnoteReference } from "./types";
import MetaTabContent from "./components/MetaTabContent";
import PreviewPanel from "./components/PreviewPanel";
import AiTabContent from "./components/AiTabContent";
import { useChapters } from "./hooks/useChapters";
import { useTags } from "./hooks/useTags";
import { useCover } from "./hooks/useCover";
import { useLockedSections } from "./hooks/useLockedSections";
import { exportEpub } from "./utils/exportEpub";
import RichTextEditor from "./components/RichTextEditor";
import CollapsibleSidebar from "./components/CollapsibleSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const HEADER_HEIGHT = 64; // px (adjust if your header is taller/shorter)
const BOOK_LIBRARY_KEY = "makeebook_library";

function saveBookToLibrary(book: any) {
  if (typeof window === "undefined") return;
  let library = loadBookLibrary();
  if (!library) library = [];
  const id = book.id || "book-" + Date.now();
  const bookToSave = {
    ...book,
    id,
    savedAt: Date.now(),
  };
  const idx = library.findIndex((b: any) => b.id === id);
  if (idx >= 0) library[idx] = bookToSave;
  else library.push(bookToSave);
  localStorage.setItem(BOOK_LIBRARY_KEY, JSON.stringify(library));
  return id;
}

function loadBookLibrary(): any[] {
  if (typeof window === "undefined") return [];
  const str = localStorage.getItem(BOOK_LIBRARY_KEY);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {}
  }
  return [];
}

function loadBookById(id: string) {
  const library = loadBookLibrary();
  return library.find((b) => b.id === id);
}

function removeBookFromLibrary(id: string) {
  let library = loadBookLibrary();
  library = library.filter((b) => b.id !== id);
  localStorage.setItem(BOOK_LIBRARY_KEY, JSON.stringify(library));
}

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getContentChapterNumber(chapters: any[], currentIndex: number) {
  // Count only content chapters up to and including the current index
  let contentChapterCount = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (chapters[i]?.type === 'content') {
      contentChapterCount++;
    }
  }
  return contentChapterCount;
}

function ChapterCapsuleMarker({ markerStyle }: { markerStyle: { top: number; height: number } }) {
  return (
    <span
      className="absolute"
      style={{
        left: -18,
        top: (markerStyle.top ?? 0) + 12,
        width: 4,
        height: 24,
        backgroundColor: "#717274",
        borderRadius: 9999,
        transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1,
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}

function HandleDragIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition"
      aria-hidden="true"
    >
      <DragIcon 
        className={`w-4 h-4 transition ${
          isSelected ? "brightness-0 invert" : "brightness-0"
        }`}
      />
    </span>
  );
}

function MakeEbookPage() {
  // Stripe checkout handler
  const handleStripeCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const { sessionId } = await res.json();
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      alert('Stripe publishable key is missing.');
      return;
    }
    const stripe = await (await import('@stripe/stripe-js')).loadStripe(publishableKey);
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lockedSections, setLockedSections } = useLockedSections();
  const { coverFile, setCoverFile, handleCoverChange, coverUrl } = useCover();

  const {
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    handleAddChapter,
    handleRemoveChapter,
    handleChapterTitleChange,
    handleChapterContentChange,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
    dragOverIndex,
    handleSelectChapter,
    ghostPillPosition,
    ghostPillContent,
    dragItemIndex,
  } = useChapters();

  const {
    tags, setTags, tagInput, setTagInput, handleAddTag, handleRemoveTag
  } = useTags();

  const [tab, setTab] = useState<"setup" | "ai" | "preview" | "library">("setup");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pubDate, setPubDate] = useState(today);
  const [isbn, setIsbn] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [genre, setGenre] = useState("");
  const [currentBookId, setCurrentBookId] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [newBookConfirmOpen, setNewBookConfirmOpen] = useState(false);
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [endnotes, setEndnotes] = useState<Endnote[]>([]);
  const [endnoteReferences, setEndnoteReferences] = useState<EndnoteReference[]>([]);
  const [nextEndnoteNumber, setNextEndnoteNumber] = useState(1);
  
  // Collapsible sidebar sections state
  const [sidebarLibraryExpanded, setSidebarLibraryExpanded] = useState(true);
  const [sidebarPreviewExpanded, setSidebarPreviewExpanded] = useState(false);
  const [sidebarChaptersExpanded, setSidebarChaptersExpanded] = useState(true);
  const [sidebarBookDetailsExpanded, setSidebarBookDetailsExpanded] = useState(false);

  const [saveFeedback, setSaveFeedback] = useState(false);
  const [bookJustLoaded, setBookJustLoaded] = useState(false);
  const [chapterJustAdded, setChapterJustAdded] = useState<string | null>(null);

  // Update endnotes chapter content whenever endnotes change
  useEffect(() => {
    updateEndnotesChapterContent();
  }, [endnotes]);

  // Handle back-navigation from endnotes to references
  useEffect(() => {
    function handleEndnoteBackClick(event: Event) {
      const target = event.target as HTMLElement;
      
      // Check if the clicked element or its parent has the endnote-back class
      const backLink = target.closest('.endnote-back') || 
                      (target.classList?.contains('endnote-back') ? target : null);
      
      if (backLink) {
        event.preventDefault();
        event.stopPropagation();
        
        const refNumber = backLink.getAttribute('data-back-to-ref');
        console.log('Back navigation clicked, refNumber:', refNumber);
        
        if (refNumber) {
          const refElement = document.getElementById(`ref${refNumber}`);
          console.log('Found ref element:', refElement);
          
          if (refElement) {
            refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a brief highlight effect
            refElement.style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
              refElement.style.backgroundColor = '';
            }, 1000);
          } else {
            console.warn(`Could not find reference element with ID: ref${refNumber}`);
          }
        }
      }
    }

    // Use capture phase to catch events before they might be stopped
    document.addEventListener('click', handleEndnoteBackClick, true);
    return () => document.removeEventListener('click', handleEndnoteBackClick, true);
  }, []);

  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [markerStyle, setMarkerStyle] = useState({ top: 0, height: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = chapterRefs.current[selectedChapter];
    if (el) {
      setMarkerStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
      });
    }
  }, [selectedChapter, chapters.length]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setChapterTypeDropdownOpen(false);
      }
    }
    if (chapterTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [chapterTypeDropdownOpen]);

  function showNewBookConfirmation() {
    setNewBookConfirmOpen(true);
  }

  function clearEditorState() {
    // Clear all editor data for new book
    setTitle("");
    setAuthor("");
    setBlurb("");
    setPublisher("");
    setPubDate(today);
    setIsbn("");
    setLanguage(LANGUAGES[0]);
    setGenre("");
    setTags([]);
    setCoverFile(null);
    setChapters([]);
    setEndnotes([]);
    setEndnoteReferences([]);
    setNextEndnoteNumber(1);
    setCurrentBookId(undefined);
  }

  function handleNewBookConfirm() {
    // Save current book before starting new one
    if (title || author || chapters.some(ch => ch.content.trim())) {
      // Save first, then clear editor state in the callback
      saveForNewBook();
    } else {
      // No content to save, just clear and start new
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  function saveForNewBook() {
    // If there's already a book ID and it exists in library, show save dialog
    if (currentBookId) {
      const library = loadBookLibrary();
      const existingBook = library.find((b: any) => b.id === currentBookId);
      if (existingBook) {
        setSaveDialogOpen(true);
        return;
      }
    }
    
    // No existing book, save and then clear
    saveBookDirectly(false);
    clearEditorState();
    setNewBookConfirmOpen(false);
  }

  function handleNewBook() {
    // Legacy function for backwards compatibility
    handleNewBookConfirm();
  }

  useEffect(() => {
    const books = loadBookLibrary();
    setLibraryBooks(books);

  const loadBookId = searchParams ? searchParams.get('load') : null;
    if (loadBookId) {
      const bookToLoad = books.find(book => book.id === loadBookId);
      if (bookToLoad) {
        handleLoadBook(loadBookId);
        router.replace('/make-ebook', { scroll: false });
        setInitialized(true);
        return;
      } else {
        router.replace('/make-ebook', { scroll: false });
        if (!initialized) setInitialized(true);
        return;
      }
    }

    if (!initialized && books.length > 0 && !currentBookId && chapters.length === 0) {
      const mostRecent = books.reduce((a, b) => (a.savedAt > b.savedAt ? a : b));
      setTitle(mostRecent.title || "");
      setAuthor(mostRecent.author || "");
      setBlurb(mostRecent.blurb || "");
      setPublisher(mostRecent.publisher || "");
      setPubDate(mostRecent.pubDate || today);
      setIsbn(mostRecent.isbn || "");
      setLanguage(mostRecent.language || LANGUAGES[0]);
      setGenre(mostRecent.genre || "");
      setTags(mostRecent.tags || []);
      setCoverFile(mostRecent.coverFile || null);
      
      // Migrate chapters to ensure they have IDs
      const migratedChapters = ensureChapterIds(mostRecent.chapters || []);
      setChapters(migratedChapters);
      
      // Migrate endnote references if they exist
      if (mostRecent.endnoteReferences) {
        const migratedEndnoteRefs = migrateEndnoteReferences(mostRecent.endnoteReferences, migratedChapters);
        setEndnoteReferences(migratedEndnoteRefs);
      }
      
      setEndnotes(mostRecent.endnotes || []);
      setCurrentBookId(mostRecent.id);
    }

    if (!initialized) setInitialized(true);
  }, [searchParams, initialized, currentBookId, chapters.length]);

  // Scroll indicator effect for mobile sidebar
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const hasMoreContent = scrollTop + clientHeight < scrollHeight - 10; // 10px threshold
        setShowScrollIndicator(hasMoreContent);
      }
    };

    const container = scrollContainerRef.current;
    if (container && mobileSidebarOpen) {
      // Check initially
      handleScroll();
      // Add scroll listener
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [mobileSidebarOpen, tab]); // Re-check when tab changes as content changes

  async function handleExportEPUB() {
    // Ensure all chapters have IDs before export
    const migratedChapters = ensureChapterIds(chapters);
    const migratedEndnoteRefs = migrateEndnoteReferences(endnoteReferences, migratedChapters);
    
    // Update state with migrated data
    setChapters(migratedChapters);
    setEndnoteReferences(migratedEndnoteRefs);
    
    await exportEpub({
      title,
      author,
      blurb,
      publisher,
      pubDate,
      isbn,
      language,
      genre,
      tags,
      coverFile,
      chapters: migratedChapters,
      endnoteReferences: migratedEndnoteRefs,
    });
  }

  function handleSaveBook() {
    // If there's already a book ID and it exists in library, show save dialog
    if (currentBookId) {
      const library = loadBookLibrary();
      const existingBook = library.find((b: any) => b.id === currentBookId);
      if (existingBook) {
        setSaveDialogOpen(true);
        return;
      }
    }
    
    // No existing book, save normally
    saveBookDirectly(false);
  }

  function saveBookDirectly(forceNewVersion: boolean) {
    const bookData = {
      id: forceNewVersion ? undefined : currentBookId, // Force new ID if creating new version
      title,
      author,
      blurb,
      publisher,
      pubDate,
      isbn,
      language,
      genre,
      tags,
      coverUrl,
      chapters,
      endnotes,
      endnoteReferences,
    };
    
    const id = saveBookToLibrary(bookData);
    setCurrentBookId(id);
    setLibraryBooks(loadBookLibrary());
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1300);
  }

  function handleOverwriteBook() {
    setSaveDialogOpen(false);
    saveBookDirectly(false);
    
    // If this was triggered from new book flow, clear editor after save
    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  function handleSaveAsNewVersion() {
    setSaveDialogOpen(false);
    saveBookDirectly(true);
    
    // If this was triggered from new book flow, clear editor after save
    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  // Endnote Management Functions
  function createEndnote(selectedText: string, sourceChapterId: string) {
    const endnoteId = `endnote-${Date.now()}`;
    const endnoteNumber = nextEndnoteNumber;
    
    // Create the endnote
    const newEndnote: Endnote = {
      id: endnoteId,
      number: endnoteNumber,
      content: selectedText,
      sourceChapterId,
      sourceText: selectedText,
    };
    
    // Create the reference
    const newReference: EndnoteReference = {
      id: `ref${endnoteNumber}`,
      number: endnoteNumber,
      chapterId: sourceChapterId,
      endnoteId,
    };
    
    setEndnotes(prev => [...prev, newEndnote]);
    setEndnoteReferences(prev => [...prev, newReference]);
    setNextEndnoteNumber(prev => prev + 1);
    
    // Create a clickable endnote reference with proper ePub structure
    const endnoteLink = `<a class="note-${endnoteNumber}" href="#end${endnoteNumber}" id="ref${endnoteNumber}" title="note ${endnoteNumber}" data-endnote-ref="${endnoteNumber}" data-endnote-id="${endnoteId}" style="color: #0066cc; text-decoration: none;"><sup>[${endnoteNumber}]</sup></a>`;
    
    return endnoteLink;
  }
  
  function updateEndnotesChapterContent() {
    let endnotesChapterIndex = chapters.findIndex(ch => ch.title.toLowerCase() === 'endnotes');
    
    // Generate endnotes content (create shallow copy to avoid mutating state)
    const endnotesContent = [...endnotes]
      .sort((a, b) => a.number - b.number)
      .map(endnote => {
        const backLink = `<a href="#ref${endnote.number}" id="end${endnote.number}" data-back-to-ref="${endnote.number}" class="endnote-back" style="color: #0066cc; text-decoration: none; margin-left: 8px; cursor: pointer; user-select: none; font-weight: bold; font-size: 14px; padding: 2px 6px; border: 1px solid #0066cc; border-radius: 3px; background-color: #f0f8ff; display: inline-block;">[${endnote.number}]</a>`;
        return `<p>${endnote.number}. ${endnote.content} ${backLink}</p>`;
      })
      .join('');
    
    const updatedChapters = [...chapters];
    
    if (endnotesChapterIndex === -1) {
      // Only create new endnotes chapter if we have endnotes to show
      if (endnotes.length === 0) return;
      
      const newEndnotesChapter = {
        id: `endnotes-${Date.now()}`,
        title: 'Endnotes',
        content: endnotesContent,
        type: 'backmatter' as const,
      };
      updatedChapters.push(newEndnotesChapter);
    } else {
      // Update existing endnotes chapter (or remove if no endnotes)
      if (endnotes.length === 0) {
        // Remove the endnotes chapter if there are no endnotes
        updatedChapters.splice(endnotesChapterIndex, 1);
      } else {
        updatedChapters[endnotesChapterIndex] = {
          ...updatedChapters[endnotesChapterIndex],
          content: endnotesContent,
        };
      }
    }
    
    setChapters(updatedChapters);
  }
  
  // Migration function to ensure all chapters have IDs
  function ensureChapterIds(chapters: Chapter[]): Chapter[] {
    return chapters.map(chapter => ({
      ...chapter,
      id: chapter.id || `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }

  // Migration function to update endnote references with unknown chapter IDs
  function migrateEndnoteReferences(endnoteRefs: EndnoteReference[], chapters: Chapter[]): EndnoteReference[] {
    return endnoteRefs.map(ref => {
      if (ref.chapterId === 'unknown' || !ref.chapterId) {
        // Try to find the chapter by context - for now, assign to first content chapter
        const firstContentChapter = chapters.find(ch => ch.type === 'content');
        return {
          ...ref,
          chapterId: firstContentChapter?.id || chapters[0]?.id || 'fallback-chapter'
        };
      }
      return ref;
    });
  }

  function handleCreateEndnote(selectedText: string, chapterId?: string) {
    if (!selectedText.trim()) return '';
    
    const currentChapterId = chapterId || (selectedChapter >= 0 && chapters[selectedChapter] ? chapters[selectedChapter].id : 'unknown');
    const endnoteLink = createEndnote(selectedText, currentChapterId);
    
    return endnoteLink;
  }

  function handleLoadBook(id: string) {
    const loaded = loadBookById(id);
    if (loaded) {
      setTitle(loaded.title || "");
      setAuthor(loaded.author || "");
      setBlurb(loaded.blurb || "");
      setPublisher(loaded.publisher || "");
      setPubDate(loaded.pubDate || today);
      setIsbn(loaded.isbn || "");
      setLanguage(loaded.language || LANGUAGES[0]);
      setGenre(loaded.genre || "");
      setTags(loaded.tags || []);
      setCoverFile(loaded.coverFile || null);
      
      // Migrate chapters to ensure they have IDs
      const migratedChapters = ensureChapterIds(loaded.chapters || []);
      setChapters(migratedChapters);
      
      // Migrate endnote references if they exist
      if (loaded.endnoteReferences) {
        const migratedEndnoteRefs = migrateEndnoteReferences(loaded.endnoteReferences, migratedChapters);
        setEndnoteReferences(migratedEndnoteRefs);
      }
      
      setEndnotes(loaded.endnotes || []);
      setCurrentBookId(loaded.id);
      
      // Trigger highlight animation
      setBookJustLoaded(true);
      setTimeout(() => setBookJustLoaded(false), 1000);
    }
  }

  function handleDeleteBook(id: string) {
    if (confirm('Are you sure you want to delete this eBook? This action cannot be undone.')) {
      removeBookFromLibrary(id);
      setLibraryBooks(loadBookLibrary());
      if (currentBookId === id) {
        // Clear editor state directly without saving (to avoid recreating the deleted book)
        clearEditorState();
      }
    }
  }

  const totalWords = chapters.reduce(
    (sum, ch) => sum + (plainText(ch.content).split(/\s+/).filter(Boolean).length || 0),
    0
  );
  const pageCount = Math.max(1, Math.ceil(totalWords / 300));
  const readingTime = Math.max(1, Math.round(totalWords / 200));

  return (
    <>
      {/* Main Content - Full height without header */}
      <div className="bg-[#FFFFFF] dark:bg-[#1a1a1a] text-[#15161a] dark:text-[#e5e5e5]">
        
        {/* New Book Confirmation Dialog */}
        {newBookConfirmOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Start New Book?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will save your current book and start a new one. All your current work will be preserved in the library.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewBookConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[#E8E8E8] dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-[#F2F2F2] dark:hover:bg-gray-800 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleNewBookConfirm}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#2a2a2a] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {saveDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Save Book</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This book already exists in your library. Do you want to overwrite the existing version or save as a new version?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[#E8E8E8] dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-[#F2F2F2] dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverwriteBook}
                  className="flex-1 px-4 py-2 rounded bg-orange-600 dark:bg-orange-700 text-white text-sm font-medium hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors"
                >
                  Overwrite
                </button>
                <button
                  onClick={handleSaveAsNewVersion}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#2a2a2a] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[100] lg:hidden transition-all duration-300 ease-out ${
          mobileSidebarOpen ? 'visible' : 'invisible'
        }`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ease-out ${
              mobileSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className={`absolute top-0 left-0 h-full w-full bg-white dark:bg-[#1a1a1a] shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              
              {/* Logo Header - Sticky */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between pr-0">
                  <Image
                    src="/make-ebook-logomark.svg"
                    alt="makeEBook logo"
                    width={100}
                    height={39}
                    className="h-[39px] w-[100px] dark:invert ml-2"
                    priority
                  />
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Close sidebar"
                  >
                    <img src="/close-sidebar-icon.svg" alt="Close" className="w-5 h-5 dark:invert" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
                
                {/* Note: All sections use same collapsible pattern as desktop */}
                <div className="px-4 space-y-2 py-2">
                  
                  {/* Library Section */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSidebarLibraryExpanded(!sidebarLibraryExpanded)}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                          title={sidebarLibraryExpanded ? "Collapse" : "Expand"}
                        >
                          {sidebarLibraryExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        <LibraryIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Library</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({libraryBooks.length})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            showNewBookConfirmation();
                            setMobileSidebarOpen(false);
                          }}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                          title="New book"
                        >
                          <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                        </button>
                      </div>
                    </div>
                    
                    {sidebarLibraryExpanded && (
                      <div className={`mt-2 space-y-1 pl-2 ${libraryBooks.length > 4 ? 'max-h-[400px] overflow-y-auto pr-1' : ''}`}>
                        {libraryBooks.length === 0 ? (
                          <div className="text-xs text-gray-500 dark:text-gray-400 py-4 px-2 text-center">
                            No saved books yet
                          </div>
                        ) : (
                          libraryBooks.map((book) => {
                            const isSelected = selectedBookId === book.id;
                            return (
                              <div
                                key={book.id}
                                className={`group flex items-center justify-between py-2 px-2 rounded transition-colors ${
                                  isSelected
                                    ? 'bg-gray-100 dark:bg-[#2a2a2a]'
                                    : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                                }`}
                              >
                                <button
                                  onClick={() => setSelectedBookId(isSelected ? null : book.id)}
                                  className="flex-1 text-left"
                                >
                                  <div className={`text-sm font-medium truncate ${
                                    isSelected
                                      ? 'text-gray-900 dark:text-gray-100'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {book.title || 'Untitled'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {book.author || 'Unknown'}
                                  </div>
                                </button>
                                {isSelected && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        handleLoadBook(book.id);
                                        setSelectedBookId(null);
                                      }}
                                      className="px-2 py-1 text-xs rounded bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                                    >
                                      Load
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBook(book.id)}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
                                      title="Delete"
                                    >
                                      <TrashIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Book Details Section */}
                  <div className={`border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-1000 ease-out ${
                    bookJustLoaded ? 'bg-gray-100/80 dark:bg-gray-700/20' : ''
                  }`}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => setSidebarBookDetailsExpanded(!sidebarBookDetailsExpanded)}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors flex-shrink-0"
                          title={sidebarBookDetailsExpanded ? "Collapse details" : "Expand details"}
                        >
                          {sidebarBookDetailsExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        <img src="/preview-icon.svg" alt="Details" className="w-5 h-5 dark:invert flex-shrink-0" />
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Book</span>
                          {title && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {title}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            handleSaveBook();
                          }}
                          disabled={!!saveFeedback}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-60"
                          title={saveFeedback ? "Saved!" : "Save book"}
                        >
                          <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                        </button>
                        <button
                          onClick={() => {
                            handleExportEPUB();
                          }}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Export as EPUB"
                        >
                          <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                        </button>
                      </div>
                    </div>
                    
                    {sidebarBookDetailsExpanded && (
                      <div className="mt-2 space-y-3 pl-2 pr-2">
                        {/* Title */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Book title"
                          />
                        </div>
                        
                        {/* Author */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Author</label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Author name"
                          />
                        </div>
                        
                        {/* Blurb */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                          <textarea
                            value={blurb}
                            onChange={(e) => setBlurb(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] resize-none"
                            placeholder="Brief description"
                            rows={3}
                          />
                        </div>
                        
                        {/* Publisher */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Publisher</label>
                          <input
                            type="text"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Publisher name"
                          />
                        </div>
                        
                        {/* Publication Date */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Publication Date</label>
                          <input
                            type="date"
                            value={pubDate}
                            onChange={(e) => setPubDate(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                          />
                        </div>
                        
                        {/* Language */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Genre */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Genre</label>
                          <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="e.g. Fiction, Mystery"
                          />
                        </div>
                        
                        {/* ISBN */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ISBN</label>
                          <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="ISBN number"
                          />
                        </div>
                        
                        {/* Tags */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tags</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                              disabled={lockedSections.bookInfo}
                              className="flex-1 px-3 py-2 text-sm rounded bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                              placeholder="Add tag"
                            />
                            <button
                              onClick={handleAddTag}
                              disabled={lockedSections.bookInfo}
                              className="px-3 py-2 rounded bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            </button>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-[#2a2a2a] text-[#050505] dark:text-[#e5e5e5]"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-500 dark:hover:text-red-400"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Cover Image */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cover Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            disabled={lockedSections.bookInfo}
                            className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2a2a2a] file:text-[#050505] dark:file:text-[#e5e5e5] hover:file:bg-gray-200 dark:hover:file:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {coverFile && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {coverFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chapters Section */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => setSidebarChaptersExpanded(!sidebarChaptersExpanded)}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors flex-shrink-0"
                          title={sidebarChaptersExpanded ? "Collapse chapters" : "Expand chapters"}
                        >
                          {sidebarChaptersExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        <img src="/chapters-icon.svg" alt="Chapters" className="w-5 h-5 dark:invert flex-shrink-0" />
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Chapters</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({chapters.length})</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="relative">
                          <button
                            onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                            className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Add chapter"
                          >
                            <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                          </button>
                          
                          {chapterTypeDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2 max-h-96 overflow-y-auto">
                              <div className="space-y-3 px-2">
                                {/* Front Matter */}
                                <div>
                                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Front Matter
                                  </div>
                                  {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                                    <button
                                      key={template.title}
                                      onClick={() => {
                                        const newChapterId = handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                                        setChapterTypeDropdownOpen(false);
                                        setSidebarChaptersExpanded(true);
                                        // Trigger highlight animation
                                        setChapterJustAdded(newChapterId);
                                        setTimeout(() => setChapterJustAdded(null), 1000);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                    >
                                      {template.title}
                                    </button>
                                  ))}
                                </div>
                                
                                {/* Main Content */}
                                <div>
                                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Main Content
                                  </div>
                                  {CHAPTER_TEMPLATES.content.map((template) => (
                                    <button
                                      key={template.title}
                                      onClick={() => {
                                        const newChapterId = handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                                        setChapterTypeDropdownOpen(false);
                                        setSidebarChaptersExpanded(true);
                                        // Trigger highlight animation
                                        setChapterJustAdded(newChapterId);
                                        setTimeout(() => setChapterJustAdded(null), 1000);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                    >
                                      {template.title}
                                    </button>
                                  ))}
                                </div>
                                
                                {/* Back Matter */}
                                <div>
                                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Back Matter
                                  </div>
                                  {CHAPTER_TEMPLATES.backmatter.map((template) => (
                                    <button
                                      key={template.title}
                                      onClick={() => {
                                        const newChapterId = handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                                        setChapterTypeDropdownOpen(false);
                                        setSidebarChaptersExpanded(true);
                                        // Trigger highlight animation
                                        setChapterJustAdded(newChapterId);
                                        setTimeout(() => setChapterJustAdded(null), 1000);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                    >
                                      {template.title}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {sidebarChaptersExpanded && (
                      <div className="mt-1 space-y-1">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 px-2 mb-1">Drag to reorder</p>
                        {chapters.map((ch, i) => {
                          const isSelected = selectedChapter === i;
                          const titleText = ch.title?.trim() || 'Title';
                          
                          const getChapterInfo = () => {
                            if (ch.type === 'frontmatter') {
                              return {
                                typeLabel: 'Frontmatter',
                                title: titleText && titleText !== 'Title' ? titleText : 'Title'
                              };
                            }
                            if (ch.type === 'backmatter') {
                              return {
                                typeLabel: 'Backmatter',
                                title: titleText && titleText !== 'Title' ? titleText : 'Title'
                              };
                            }
                            const contentChapterNum = getContentChapterNumber(chapters, i);
                            return {
                              typeLabel: `Chapter ${contentChapterNum}`,
                              title: titleText && titleText !== 'Title' ? titleText : 'Title'
                            };
                          };

                          const { typeLabel, title: chapterTitle } = getChapterInfo();
                          const isJustAdded = chapterJustAdded === ch.id;
                          
                          return (
                            <div
                              key={ch.id}
                              className={`group flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer select-none transition-all duration-1000 ease-out ${
                                dragOverIndex === i
                                  ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                  : isSelected
                                    ? 'bg-gray-100 dark:bg-[#2a2a2a] border border-transparent'
                                    : isJustAdded
                                      ? 'bg-gray-100/80 dark:bg-gray-700/20 border border-transparent'
                                      : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                              }`}
                              style={{
                                opacity: dragItemIndex === i && ghostPillPosition.visible ? 0.3 : 1,
                              } as React.CSSProperties}
                              draggable
                              onDragStart={() => handleDragStart(i)}
                              onDragEnter={() => handleDragEnter(i)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => e.preventDefault()}
                              onTouchStart={(e) => handleTouchStart(i, e)}
                              onTouchMove={(e) => handleTouchMove(i, e)}
                              onTouchEnd={handleTouchEnd}
                              onClick={() => {
                                handleSelectChapter(i);
                              }}
                            >
                              <HandleDragIcon isSelected={isSelected} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className={`text-[10px] ${isSelected ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                  {typeLabel}
                                </span>
                                <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {chapterTitle}
                                </span>
                              </div>
                              {chapters.length > 1 && (
                                <button
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveChapter(i);
                                  }}
                                  aria-label="Delete chapter"
                                >
                                  <BinIcon
                                    className="w-4 h-4"
                                    stroke={isSelected ? "#050505" : "#666666"}
                                  />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => setSidebarPreviewExpanded(!sidebarPreviewExpanded)}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors flex-shrink-0"
                          title={sidebarPreviewExpanded ? "Collapse preview" : "Expand preview"}
                        >
                          {sidebarPreviewExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        <img src="/summary-icon.svg" alt="Preview" className="w-5 h-5 dark:invert flex-shrink-0" />
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Preview</span>
                      </div>
                    </div>
                    
                    {sidebarPreviewExpanded && (
                      <div className="mt-2 px-2">
                        {/* Cover Preview */}
                        <div className="mb-4 flex justify-center">
                          <div className="w-32 h-48 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt="Book cover"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img src="/preview-icon.svg" alt="No cover" className="w-8 h-8 opacity-40 dark:invert" />
                            )}
                          </div>
                        </div>
                        
                        {/* Book Info */}
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title</div>
                            <div className="font-medium text-[#050505] dark:text-[#e5e5e5]">{title || 'Untitled'}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Author</div>
                            <div className="text-[#050505] dark:text-[#e5e5e5]">{author || 'Unknown'}</div>
                          </div>
                          
                          {pubDate && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Publication Date</div>
                              <div className="text-[#050505] dark:text-[#e5e5e5]">{new Date(pubDate).toLocaleDateString()}</div>
                            </div>
                          )}
                          
                          {language && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Language</div>
                              <div className="flex items-center gap-2">
                                <img src="/dark-languages-icon.svg" className="w-4 h-4 hidden dark:block" alt="" />
                                <img src="/languages-icon.svg" className="w-4 h-4 dark:hidden" alt="" />
                                <span className="text-[#050505] dark:text-[#e5e5e5]">{language}</span>
                              </div>
                            </div>
                          )}
                          
                          {genre && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Genre</div>
                              <div className="text-[#050505] dark:text-[#e5e5e5]">{genre}</div>
                            </div>
                          )}
                          
                          {tags.length > 0 && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tags</div>
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-[#2a2a2a] text-[#050505] dark:text-[#e5e5e5]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Chapters</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{chapters.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Words</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{totalWords.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Pages</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{pageCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Reading Time</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">
                              {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Footer - Sticky */}
              <div className="flex-shrink-0 pt-4 pb-4 px-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-2 py-2">
                  {/* User Dropdown - reuse from CollapsibleSidebar */}
                  <UserDropdownMobile />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Chapters Panel */}
        <div className={`fixed top-0 right-0 bottom-0 z-[100] lg:hidden transition-all duration-300 ease-out ${
          mobileChaptersOpen ? 'visible' : 'invisible'
        }`} style={{ left: 0 }}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ease-out ${
              mobileChaptersOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileChaptersOpen(false)}
          />
          {/* Chapters Panel */}
          <div className={`absolute top-0 right-0 h-full w-full bg-white dark:bg-[#1a1a1a] shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileChaptersOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <img src="/chapters-icon.svg" alt="Chapters" className="w-5 h-5 dark:invert" />
                  <h3 className="text-sm font-bold text-[#050505] dark:text-[#e5e5e5]">Chapters list</h3>
                </div>
                <button
                  onClick={() => setMobileChaptersOpen(false)}
                  className="flex items-center justify-center px-5 py-4 rounded-full bg-white dark:bg-[#1a1a1a] gap-2 focus:outline-none transition-opacity relative"
                  aria-label="Close chapters menu"
                  style={{ minWidth: 56, minHeight: 56 }}
                >
                  <span className="absolute inset-0" style={{ zIndex: 1 }}></span>
                  <img alt="Close" loading="lazy" width="28" height="28" decoding="async" data-nimg="1" className="w-5 h-5 dark:invert" style={{ color: 'transparent', zIndex: 2 }} src="/close-sidebar-icon.svg" />
                  <span className="text-base font-medium text-[#23242a] dark:text-[#e5e5e5] underline" style={{ zIndex: 2 }}>Close</span>
                </button>
              </div>
              
              {/* Chapters Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <p className="text-[10px] text-[#737373] dark:text-gray-400 mb-3">Drag to reorder</p>
                
                {/* Chapter Pills */}
                <div className="flex flex-col gap-2">
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const titleText = ch.title?.trim() || 'Title';
                    
                    // Calculate chapter type label and title
                    const getChapterInfo = () => {
                      if (ch.type === 'frontmatter') {
                        return {
                          typeLabel: 'Frontmatter',
                          title: titleText && titleText !== 'Title' ? titleText : 'Title'
                        };
                      }
                      if (ch.type === 'backmatter') {
                        return {
                          typeLabel: 'Backmatter', 
                          title: titleText && titleText !== 'Title' ? titleText : 'Title'
                        };
                      }
                      // Content chapters
                      const contentChapterNum = getContentChapterNumber(chapters, i);
                      return {
                        typeLabel: `Chapter ${contentChapterNum}`,
                        title: titleText && titleText !== 'Title' ? titleText : 'Title'
                      };
                    };

                    const { typeLabel, title } = getChapterInfo();
                    const isJustAdded = chapterJustAdded === ch.id;
                    
                    return (
                      <div
                        key={i}
                        ref={el => { chapterRefs.current[i] = el }}
                        className={`group flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer select-none relative focus:outline-none transition-all duration-1000 ease-out ${
                          dragOverIndex === i 
                            ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                            : isSelected
                              ? 'bg-gray-100 dark:bg-[#2a2a2a] border border-transparent'
                              : isJustAdded
                                ? 'bg-gray-100/80 dark:bg-gray-700/20 border border-transparent'
                                : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                        }`}
                        style={{ 
                          userSelect: 'none', 
                          WebkitUserSelect: 'none', 
                          WebkitTouchCallout: 'none',
                          // @ts-ignore - WebkitUserDrag is valid but not in TypeScript types
                          WebkitUserDrag: 'none',
                          opacity: dragItemIndex === i && ghostPillPosition.visible ? 0.3 : 1,
                        } as React.CSSProperties}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragEnter={() => handleDragEnter(i)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onTouchStart={(e) => handleTouchStart(i, e)}
                        onTouchMove={(e) => handleTouchMove(i, e)}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => handleSelectChapter(i)}
                      >
                        <HandleDragIcon isSelected={isSelected} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className={`text-[10px] ${isSelected ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                            {typeLabel}
                          </span>
                          <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                            {title}
                          </span>
                        </div>
                        {chapters.length > 1 && (
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChapter(i);
                            }}
                            aria-label="Delete Chapter"
                          >
                            <BinIcon 
                              key={`mobile-panel-bin-${i}-${isSelected}`}
                              className="w-4 h-4"
                              stroke={isSelected ? "#050505" : "#666666"}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Add Chapter Button */}
                  <div className="relative mt-2">
                    <button
                      onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                      aria-label="Add new chapter"
                      className="hover:opacity-70 transition-opacity flex items-center gap-2 w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium text-[#050505] dark:text-[#e5e5e5]">Add Chapter</span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white dark:bg-[#1a1a1a] rounded border border-[#E8E8E8] dark:border-gray-700 shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-3">
                          <div className="space-y-4">
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">Front Matter</span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);
                                      // Trigger highlight animation
                                      setChapterJustAdded(newChapterId);
                                      setTimeout(() => setChapterJustAdded(null), 1000);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">{template.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">Main Content</span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.content.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);
                                      // Trigger highlight animation
                                      setChapterJustAdded(newChapterId);
                                      setTimeout(() => setChapterJustAdded(null), 1000);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">{template.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">Back Matter</span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.backmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);
                                      // Trigger highlight animation
                                      setChapterJustAdded(newChapterId);
                                      setTimeout(() => setChapterJustAdded(null), 1000);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">{template.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout: Mobile-optimized */}
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <CollapsibleSidebar
            libraryBooks={libraryBooks}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
            handleLoadBook={handleLoadBook}
            handleDeleteBook={handleDeleteBook}
            showNewBookConfirmation={showNewBookConfirmation}
            chapters={chapters}
            selectedChapter={selectedChapter}
            handleSelectChapter={handleSelectChapter}
            handleAddChapter={handleAddChapter}
            handleRemoveChapter={handleRemoveChapter}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            dragOverIndex={dragOverIndex}
            dragItemIndex={dragItemIndex}
            ghostPillPosition={ghostPillPosition}
            getContentChapterNumber={getContentChapterNumber}
            title={title}
            setTitle={setTitle}
            author={author}
            setAuthor={setAuthor}
            blurb={blurb}
            setBlurb={setBlurb}
            publisher={publisher}
            setPublisher={setPublisher}
            pubDate={pubDate}
            setPubDate={setPubDate}
            isbn={isbn}
            setIsbn={setIsbn}
            language={language}
            setLanguage={setLanguage}
            genre={genre}
            setGenre={setGenre}
            tags={tags}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            tagInput={tagInput}
            setTagInput={setTagInput}
            coverFile={coverFile}
            handleCoverChange={handleCoverChange}
            lockedSections={lockedSections}
            coverUrl={coverUrl}
            totalWords={totalWords}
            pageCount={pageCount}
            readingTime={readingTime}
            handleSaveBook={handleSaveBook}
            handleExportEPUB={handleExportEPUB}
            saveFeedback={saveFeedback}
            sidebarLibraryExpanded={sidebarLibraryExpanded}
            setSidebarLibraryExpanded={setSidebarLibraryExpanded}
            sidebarPreviewExpanded={sidebarPreviewExpanded}
            setSidebarPreviewExpanded={setSidebarPreviewExpanded}
            sidebarChaptersExpanded={sidebarChaptersExpanded}
            setSidebarChaptersExpanded={setSidebarChaptersExpanded}
            sidebarBookDetailsExpanded={sidebarBookDetailsExpanded}
            setSidebarBookDetailsExpanded={setSidebarBookDetailsExpanded}
          />

          {/* Main Editor Panel - Mobile Optimised */}
          <main className="flex-1 flex flex-col bg-white dark:bg-[#1a1a1a] rounded shadow-sm px-2 lg:px-8 py-8 lg:py-0 lg:pb-8 min-w-0 overflow-hidden relative">
            
            {/* Mobile Header - Logo + Menu Button */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 -ml-0.5"
                    aria-label="Open menu"
                  >
                    <img 
                      src="/hamburger-menu-icon.svg" 
                      alt="Menu" 
                      className="w-5 h-5 dark:hidden" 
                    />
                    <img 
                      src="/dark-hamburger-menu-icon.svg" 
                      alt="Menu" 
                      className="w-5 h-5 hidden dark:block" 
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Editing:</div>
                    <div className="text-sm font-medium text-[#050505] dark:text-[#e5e5e5] truncate">
                      {title || 'Untitled Book'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Header with Title and Toolbar */}
            <div className="hidden lg:block">
              {/* Chapter content starts here */}
            </div>

            {/* MOBILE OPTIMISED EDITOR - Full Viewport (including tablets) */}
            <div className="lg:hidden flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pt-8 pb-0">
              {/* Compact Chapter Header */}
              <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-none pb-1 px-2">
                {/* Chapter Title Input - Clean UI */}
                <div className="mt-0">
                  <div className="flex items-center gap-0 px-1 py-1">
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 dark:hidden" style={{ color: 'transparent' }} src="/chapter-title-icon.svg" />
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 hidden dark:block" style={{ color: 'transparent' }} src="/dark-chapter-title-icon.svg" />
                    <input
                      className="flex-1 bg-transparent text-lg font-medium text-[#23242a] dark:text-[#e5e5e5] border-none outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:text-[#a0a0a0] dark:placeholder:text-[#a0a0a0] placeholder:font-normal touch-manipulation min-w-0"
                      style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
                      placeholder="Give your chapter a title..."
                      value={chapters[selectedChapter]?.title ?? ""}
                      onChange={(e) =>
                        handleChapterTitleChange(selectedChapter, e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Rich Text Editor - Maximized for Writing */}
              <div className="flex-1 min-h-0 pb-20 sm:pb-0 relative flex flex-col">
                <div className="mt-2 mb-1 flex-shrink-0 flex items-start justify-between px-2">
                  {/* <label className="block text-xs text-[#737373] mb-0">Chapter content</label> */}
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center">
                      <button
                        title="Undo content changes"
                        type="button"
                        className="hover:opacity-70 transition-opacity"
                        onClick={() => {
                          const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                          if (editorElement) {
                            editorElement.focus();
                            document.execCommand('undo');
                          }
                        }}
                      >
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-full p-2">
                          <Image
                            src="/undo-icon.svg"
                            alt="Undo"
                            width={16}
                            height={16}
                            className="w-4 h-4 dark:invert"
                            style={{ borderRadius: '0', boxShadow: 'none' }}
                          />
                        </div>
                      </button>
                      <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Undo</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <button
                        title="Redo content changes"
                        type="button"
                        className="hover:opacity-70 transition-opacity"
                        onClick={() => {
                          const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                          if (editorElement) {
                            editorElement.focus();
                            document.execCommand('redo');
                          }
                        }}
                      >
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-full p-2">
                          <Image
                            src="/redo-icon.svg"
                            alt="Redo"
                            width={16}
                            height={16}
                            className="w-4 h-4 dark:invert"
                            style={{ borderRadius: '0', boxShadow: 'none' }}
                          />
                        </div>
                      </button>
                      <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Redo</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => {
                          handleSaveBook();
                        }}
                        disabled={!!saveFeedback}
                        title={saveFeedback ? "Saved!" : "Save book"}
                        className="hover:opacity-70 transition-opacity disabled:opacity-60"
                      >
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-full p-2">
                          {saveFeedback ? (
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                          )}
                        </div>
                      </button>
                      <span className={`text-xs font-medium mt-1 transition-colors ${saveFeedback ? 'text-green-600 dark:text-green-400' : 'text-[#050505] dark:text-[#e5e5e5]'}`}>
                        {saveFeedback ? 'Saved!' : 'Save'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '400px' }}>
                  <RichTextEditor
                    value={chapters[selectedChapter]?.content || ""}
                    onChange={(html) => handleChapterContentChange(selectedChapter, html)}
                    minHeight={300}
                    showWordCount
                    placeholder={
                      selectedChapter === 0
                        ? "Write your first chapter here..."
                        : "Now add some content to your chapter..."
                    }
                    className="h-full text-lg placeholder:text-[#a0a0a0] placeholder:text-lg"
                    onCreateEndnote={handleCreateEndnote}
                    chapterId={`chapter-${selectedChapter}`}
                  />
                </div>
              </div>
            </div>

            {/* DESKTOP layout */}
            <div className="hidden lg:flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
              {/* Editor Area - Prioritized for Writing */}
              <section className="flex flex-col min-w-0 flex-1 min-h-0 pt-2">
                {/* Compact Chapter Title Header - Clean UI */}
                <div className="mb-1 flex-shrink-0 bg-white dark:bg-[#1a1a1a] pb-1">
                  <div className="flex items-center gap-1 px-1 py-1">
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 dark:hidden ml-1" style={{ color: 'transparent' }} src="/chapter-title-icon.svg" />
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 hidden dark:block ml-1" style={{ color: 'transparent' }} src="/dark-chapter-title-icon.svg" />
                    <input
                      className="flex-1 bg-transparent text-lg font-medium text-[#23242a] dark:text-[#e5e5e5] border-none outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:text-[#a0a0a0] dark:placeholder:text-[#a0a0a0] placeholder:font-normal min-w-0"
                      style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
                      placeholder="Give your chapter a title..."
                      value={chapters[selectedChapter]?.title ?? ""}
                      onChange={(e) =>
                        handleChapterTitleChange(selectedChapter, e.target.value)
                      }
                    />
                  </div>
                </div>
                {/* Rich Text Editor - Maximum Space */}
                <div className="w-full max-w-full flex-1 min-h-0 flex flex-col">
                  <div className="mt-2 mb-1 flex-shrink-0 flex items-start justify-between px-2">

                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center">
                        <button
                          title="Undo content changes"
                          type="button"
                          className="hover:opacity-70 transition-opacity"
                          onClick={() => {
                            const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                            if (editorElement) {
                              editorElement.focus();
                              document.execCommand('undo');
                            }
                          }}
                        >
                          <div className="bg-white dark:bg-[#2a2a2a] rounded-full p-2">
                            <Image
                              src="/undo-icon.svg"
                              alt="Undo"
                              width={16}
                              height={16}
                              className="w-4 h-4 dark:invert"
                              style={{ borderRadius: '0', boxShadow: 'none' }}
                            />
                          </div>
                        </button>
                        <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Undo</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <button
                          title="Redo content changes"
                          type="button"
                          className="hover:opacity-70 transition-opacity"
                          onClick={() => {
                            const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                            if (editorElement) {
                              editorElement.focus();
                              document.execCommand('redo');
                            }
                          }}
                        >
                          <div className="bg-white dark:bg-[#2a2a2a] rounded-full p-2">
                            <Image
                              src="/redo-icon.svg"
                              alt="Redo"
                              width={16}
                              height={16}
                              className="w-4 h-4 dark:invert"
                              style={{ borderRadius: '0', boxShadow: 'none' }}
                            />
                          </div>
                        </button>
                        <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Redo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <RichTextEditor
                      value={chapters[selectedChapter]?.content || ""}
                      onChange={(html) =>
                        handleChapterContentChange(selectedChapter, html)
                      }
                      minHeight={400}
                      showWordCount
                        placeholder={
                          selectedChapter === 0
                            ? "Write your first chapter here..."
                            : "Now add some content to your chapter..."
                        }
                        className="h-full text-lg placeholder:text-[#a0a0a0] placeholder:text-lg"
                      onCreateEndnote={handleCreateEndnote}
                      chapterId={`chapter-${selectedChapter}`}
                    />
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>

        {/* Terms/Privacy links moved to mobile editor footer */}
      </div>
    </>
  );
}

// User Dropdown Component for Mobile
function UserDropdownMobile() {
  const { user, signOut, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition px-0" 
          aria-label="User menu"
        >
          <img
            src="/user-icon.svg"
            alt="user icon"
            width={24}
            height={24}
            className="dark:invert"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Wrap `MakeEbookPage` in authentication protection and `Suspense` boundary
export default function ProtectedMakeEbookPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading makeEbook...</div>}>
        <MakeEbookPage />
      </Suspense>
    </ProtectedRoute>
  );
}
