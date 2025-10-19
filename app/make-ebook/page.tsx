"use client";

import React, { Suspense, useState, useRef, useLayoutEffect, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/hooks/useAuth";
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, TrashIcon, LibraryIcon, CloseIcon, SaveIcon, DownloadIcon, BookIcon, PreviewIcon, LockIcon, MetadataIcon, MenuIcon, ChaptersIcon } from "./components/icons";
import { ChevronDown } from "lucide-react";
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

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [newBookConfirmOpen, setNewBookConfirmOpen] = useState(false);
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [endnotes, setEndnotes] = useState<Endnote[]>([]);
  const [endnoteReferences, setEndnoteReferences] = useState<EndnoteReference[]>([]);
  const [nextEndnoteNumber, setNextEndnoteNumber] = useState(1);

  const [saveFeedback, setSaveFeedback] = useState(false);

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

    const loadBookId = searchParams.get('load');
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
      setLibraryOpen(false);
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
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-[110]">
        <Header onNewBook={showNewBookConfirmation} />
      </div>
      {/* Main Content */}
      <div className="bg-[#FFFFFF] text-[#15161a] pt-[64px]">
        {/* Library Panel */}
        {libraryOpen && (
          <div className="fixed inset-0 z-[120] bg-black/20 flex items-start justify-center">
            <div className="bg-white rounded shadow-2xl p-6 mt-20 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <LibraryIcon className="w-6 h-6" /> Library
                </h2>
                <button onClick={() => setLibraryOpen(false)} className="text-xl">&times;</button>
              </div>
              {libraryBooks.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No books saved</div>
              ) : (
                <ul>
                  {libraryBooks
                    .sort((a, b) => b.savedAt - a.savedAt)
                    .map((b) => (
                    <li key={b.id} className="flex items-center gap-2 border-b last:border-b-0 py-2">
                      <button
                        className="flex-1 text-left hover:underline"
                        onClick={() => handleLoadBook(b.id)}
                        title={b.title}
                      >
                        <span className="font-semibold">{b.title || "Untitled"}</span>
                        <span className="text-sm text-gray-500 ml-2">{b.author}</span>
                        <span className="block text-xs text-gray-400">{new Date(b.savedAt).toLocaleString()}</span>
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteBook(b.id)}
                        title="Delete book"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* New Book Confirmation Dialog */}
        {newBookConfirmOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Start New Book?</h2>
              <p className="text-gray-600 mb-6">
                This will save your current book and start a new one. All your current work will be preserved in the library.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewBookConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[#E8E8E8] text-sm font-medium hover:bg-[#F2F2F2] transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleNewBookConfirm}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] text-white text-sm font-medium hover:bg-[#23252a] transition-colors"
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
            <div className="bg-white rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Save Book</h2>
              <p className="text-gray-600 mb-6">
                This book already exists in your library. Do you want to overwrite the existing version or save as a new version?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[#E8E8E8] text-sm font-medium hover:bg-[#F2F2F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverwriteBook}
                  className="flex-1 px-4 py-2 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Overwrite
                </button>
                <button
                  onClick={handleSaveAsNewVersion}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] text-white text-sm font-medium hover:bg-[#23252a] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed top-[64px] left-0 right-0 bottom-0 z-[100] lg:hidden transition-all duration-300 ease-out ${
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
          <div className={`absolute top-0 left-0 h-full w-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
              <div className="flex flex-col h-full">
                {/* Header with Actions */}
                <div className="flex items-center justify-end p-4 border-b border-[#E8E8E8]">
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
                    aria-label="Close sidebar menu"
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                      <CloseIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-[#050505]">Close</span>
                  </button>
                </div>
                
                {/* Tab Navigation */}
                <nav className="flex p-3 gap-2">
                  {["setup", "preview", "library"].map((key) => (
                    <button
                      key={key}
                      className={`flex flex-col items-center gap-1 px-4 py-2 rounded text-xs font-semibold transition whitespace-nowrap min-w-0 flex-1 ${
                        tab === key
                          ? "bg-white text-[#15161a] border border-[#050505] shadow-sm"
                          : "hover:bg-[#F2F2F2] text-[#737373]"
                      }`}
                      onClick={() => setTab(key as any)}
                    >
                      {key === "setup" && <MetadataIcon className="w-5 h-5" />}
                      {key === "preview" && <PreviewIcon className="w-5 h-5" />}
                      {key === "library" && <LibraryIcon className="w-5 h-5" />}
                      <span>
                        {key === "setup"
                          ? "Book Details"
                          : key === "preview"
                          ? "Book Summary"
                          : key === "ai"
                          ? "AI"
                          : "Library"}
                      </span>
                    </button>
                  ))}
                </nav>
                
                {/* Divider */}
                <div className="border-t border-[#E8E8E8]"></div>
                
                {/* Content */}
                <div className="relative flex-1 min-h-0">
                  <div ref={scrollContainerRef} className="h-full overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                    {tab === "setup" && (
                      <MetaTabContent
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
                        setTags={setTags}
                        tagInput={tagInput}
                        setTagInput={setTagInput}
                        coverFile={coverFile}
                        setCoverFile={setCoverFile}
                        lockedSections={lockedSections}
                        setLockedSections={setLockedSections}
                        handleAddTag={handleAddTag}
                        handleRemoveTag={handleRemoveTag}
                        handleCoverChange={handleCoverChange}
                      />
                    )}
                  {tab === "preview" && (
                    <PreviewPanel
                      coverUrl={coverUrl}
                      title={title}
                      author={author}
                      pubDate={pubDate}
                      language={language}
                      genre={genre}
                      tags={tags}
                      chapters={chapters}
                      totalWords={totalWords}
                      pageCount={pageCount}
                      readingTime={readingTime}
                    />
                  )}
                  {/* {tab === "ai" && <AiTabContent />} */}
                  {tab === "library" && (
                    <div className="space-y-4">
                      {libraryBooks.length === 0 ? (
                        <div className="text-center py-12">
                          <Image
                            src="/caveman.svg"
                            alt="makeEbook caveman"
                            width={48}
                            height={48}
                            className="w-12 h-12 mx-auto mb-4 opacity-60"
                          />
                          <p className="text-gray-500">
                            Why not write your first masterpiece?<br />
                            <span className="text-sm">The Biscuit Thief. Chapter one: The Thief Grows Peckish!📚</span>
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {libraryBooks.map((b: any) => (
                            <li key={b.id} className={`flex items-center justify-between p-3 border rounded transition-colors ${
                              selectedBookId === b.id 
                                ? 'border-black bg-white' 
                                : 'border-[#E8E8E8] hover:bg-[#F2F2F2]'
                            }`}>
                              <div className="flex items-center gap-3 flex-1">
                                {/* Book Cover Preview */}
                                <div className="flex-shrink-0 w-8 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                  {b.coverUrl ? (
                                    <img
                                      src={b.coverUrl}
                                      alt="Book cover"
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <PreviewIcon className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <button
                                  className="flex-1 text-left focus:outline-none border-none bg-transparent"
                                  onClick={() => {
                                    setSelectedBookId(selectedBookId === b.id ? null : b.id);
                                  }}
                                  title={b.title}
                                >
                                  <div className="font-semibold">{b.title || "Untitled"}</div>
                                  <div className="text-sm text-gray-500">{b.author}</div>
                                  <div className="text-xs text-gray-400">{new Date(b.savedAt).toLocaleString()}</div>
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className={`px-2 py-1 text-xs font-medium focus:outline-none transition-colors ${
                                    selectedBookId === b.id 
                                      ? 'text-black underline hover:no-underline' 
                                      : 'text-gray-300 cursor-not-allowed'
                                  }`}
                                  onClick={() => {
                                    if (selectedBookId === b.id) {
                                      handleLoadBook(b.id);
                                      setMobileSidebarOpen(false);
                                      setSelectedBookId(null);
                                    }
                                  }}
                                  disabled={selectedBookId !== b.id}
                                  title={selectedBookId === b.id ? "Load selected book" : "Select book first"}
                                >
                                  Load
                                </button>
                                <button
                                  className="text-gray-400 hover:text-red-500 p-1 focus:outline-none"
                                  onClick={() => handleDeleteBook(b.id)}
                                  title="Delete book"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                  
                  {/* Scroll Indicator */}
                  {showScrollIndicator && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Main layout: Mobile-optimized */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:flex flex-col w-full lg:max-w-sm bg-white min-w-0 lg:min-w-[400px] lg:h-full overflow-y-auto shadow-sm mt-4 pl-2 pr-4 pb-4 gap-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
            <nav className="flex flex-row items-center gap-1 pb-2 overflow-x-auto">
              {["setup", "preview", "library"].map((key) => (
                <button
                  key={key}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition whitespace-nowrap ${
                    tab === key
                      ? "bg-white text-[#15161a] border border-[#050505] shadow-sm"
                      : "hover:bg-[#F2F2F2] text-[#737373]"
                  }`}
                  onClick={() => setTab(key as any)}
                >
                  {key === "setup" && <MetadataIcon className="w-4 h-4" />}
                  {key === "preview" && <PreviewIcon className="w-4 h-4" />}
                  {key === "library" && <LibraryIcon className="w-4 h-4" />}
                  {key === "setup"
                    ? "Book Details"
                    : key === "preview"
                    ? "Book Summary"
                    : "Library"}
                </button>
              ))}
            </nav>
            <div className="flex-1 overflow-y-auto">
              {tab === "setup" && (
                <MetaTabContent
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
                  setTags={setTags}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  coverFile={coverFile}
                  setCoverFile={setCoverFile}
                  lockedSections={lockedSections}
                  setLockedSections={setLockedSections}
                  handleAddTag={handleAddTag}
                  handleRemoveTag={handleRemoveTag}
                  handleCoverChange={handleCoverChange}
                />
              )}
              {tab === "preview" && (
                <PreviewPanel
                  coverUrl={coverUrl}
                  title={title}
                  author={author}
                  pubDate={pubDate}
                  language={language}
                  genre={genre}
                  tags={tags}
                  chapters={chapters}
                  totalWords={totalWords}
                  pageCount={pageCount}
                  readingTime={readingTime}
                />
              )}
              {/* {tab === "ai" && <AiTabContent />} */}
              {tab === "library" && (
                <div className="space-y-4">
                  {libraryBooks.length === 0 ? (
                    <div className="text-center py-12">
                      <Image
                        src="/caveman.svg"
                        alt="makeEbook caveman"
                        width={48}
                        height={48}
                        className="w-12 h-12 mx-auto mb-4 opacity-60"
                      />
                      <p className="text-gray-500">
                        Why not write your first masterpiece?<br />
                        <span className="text-sm">The Biscuit Thief. Chapter one: The Thief Grows Peckish!📚</span>
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {libraryBooks.map((b: any) => (
                        <li key={b.id} className={`flex items-center justify-between p-3 border rounded transition-colors ${
                          selectedBookId === b.id 
                            ? 'border-black bg-white' 
                            : 'border-[#E8E8E8] hover:bg-[#F2F2F2]'
                        }`}>
                          <div className="flex items-center gap-3 flex-1">
                            {/* Book Cover Preview */}
                            <div className="flex-shrink-0 w-8 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                              {b.coverUrl ? (
                                <img
                                  src={b.coverUrl}
                                  alt="Book cover"
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <PreviewIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <button
                              className="flex-1 text-left focus:outline-none border-none bg-transparent"
                              onClick={() => {
                                setSelectedBookId(selectedBookId === b.id ? null : b.id);
                              }}
                              title={b.title}
                            >
                              <div className="font-semibold">{b.title || "Untitled"}</div>
                              <div className="text-sm text-gray-500">{b.author}</div>
                              <div className="text-xs text-gray-400">{new Date(b.savedAt).toLocaleString()}</div>
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className={`px-2 py-1 text-xs font-medium focus:outline-none transition-colors ${
                                selectedBookId === b.id 
                                  ? 'text-black underline hover:no-underline' 
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (selectedBookId === b.id) {
                                  handleLoadBook(b.id);
                                  setSelectedBookId(null);
                                }
                              }}
                              disabled={selectedBookId !== b.id}
                              title={selectedBookId === b.id ? "Load selected book" : "Select book first"}
                            >
                              Load
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-500 p-1 focus:outline-none"
                              onClick={() => handleDeleteBook(b.id)}
                              title="Delete book"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Editor Panel - Mobile Optimised */}
          <main className="flex-1 flex flex-col bg-white rounded shadow-sm mt-4 px-2 lg:px-8 py-8 lg:py-0 lg:pb-8 min-w-0 overflow-hidden relative">
            {/* Mobile Hamburger Menu - Fixed Position */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden fixed top-[80px] z-10 hover:opacity-70 transition-opacity flex flex-col items-center gap-1 pb-5"
              style={{ left: '8px' }}
              aria-label="Open sidebar menu"
            >
              <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                <MenuIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#050505]">Open</span>
            </button>

            {/* Mobile Divider Line */}
            <div className="lg:hidden mt-11 mb-4">
              <div className="border-t border-[#E8E8E8]"></div>
            </div>

            {/* Mobile Book Title Input */}
            <div className="lg:hidden mb-4 flex-shrink-0">
              {/* Book Heading with Action Buttons */}
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-medium text-[#050505]">
                  <PreviewIcon className="w-4 h-4" stroke="#050505" />
                  Book
                </h2>
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      showNewBookConfirmation();
                      setMobileSidebarOpen(false);
                    }}
                    className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
                    type="button"
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                      <PlusIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-[#050505]">New Book</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleSaveBook();
                      setMobileSidebarOpen(false);
                    }}
                    className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
                    disabled={!!saveFeedback}
                    type="button"
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                      <SaveIcon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium text-[#050505] transition-all ${saveFeedback ? "text-green-600 font-semibold" : ""}`}>
                      {saveFeedback ? "Saved!" : "Save"}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleExportEPUB();
                      setMobileSidebarOpen(false);
                    }}
                    className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
                    type="button"
                  >
                    <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                      <DownloadIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-[#050505]">Export</span>
                  </button>
                </div>
              </div>
              <div className="pb-3 border-b border-[#E8E8E8]">
                <div className="flex items-center gap-3">
                  {lockedSections.bookInfo && (
                    <LockIcon className="w-5 h-5 opacity-60" />
                  )}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={lockedSections.bookInfo}
                    className="text-lg font-medium bg-white border border-transparent focus:border-black outline-none focus:outline-none focus:ring-0 flex-1 disabled:cursor-not-allowed px-2 py-1 rounded placeholder:text-[#a0a0a0]"
                    style={{ 
                      color: lockedSections.bookInfo ? "#737373" : (title ? "#23242a" : "#737373"),
                      boxShadow: "none"
                    }}
                    placeholder={lockedSections.bookInfo ? "Book title (locked)" : "Enter book title..."}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Header with Title and Toolbar */}
            <div className="hidden lg:block">
              {/* Book Heading */}
              <div className="mb-2">
                <h2 className="flex items-center gap-2 text-sm font-medium text-[#050505]">
                  <PreviewIcon className="w-4 h-4" stroke="#050505" />
                  Book
                </h2>
              </div>
              <div className="mb-3 pb-2 border-b border-[#E8E8E8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {lockedSections.bookInfo && (
                      <LockIcon className="w-5 h-5 opacity-60" />
                    )}
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={lockedSections.bookInfo}
                      className="text-lg font-medium bg-white border border-transparent focus:border-black outline-none focus:outline-none focus:ring-0 flex-1 disabled:cursor-not-allowed px-2 py-1 rounded placeholder:text-[#a0a0a0]"
                      style={{ 
                        color: lockedSections.bookInfo ? "#737373" : (title ? "#23242a" : "#737373"),
                        boxShadow: "none"
                      }}
                      placeholder={lockedSections.bookInfo ? "Book title (locked)" : "Enter book title..."}
                    />
                  </div>
                  <BookToolbar
                    onSave={handleSaveBook}
                    onExport={handleExportEPUB}
                    saveFeedback={saveFeedback}
                  />
                </div>
              </div>
            </div>

            {/* MOBILE OPTIMISED EDITOR - Full Viewport (including tablets) */}
            <div className="lg:hidden flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
              {/* Compact Chapter Header */}
              <div className="flex-shrink-0 bg-white border-b border-[#F2F2F2] pb-2">
                {/* Compact Chapter Tabs */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <ChaptersIcon className="w-5 h-5" />
                      <h3 className="text-sm font-bold text-[#050505]">Chapters</h3>
                    </div>
                    <div className="relative" ref={dropdownRef} style={{ marginLeft: '8px' }}>
                    <button
                      onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                      aria-label="Add new chapter"
                      className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
                    >
                      <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                        <PlusIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-[#050505]">Add</span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div className="absolute z-50 top-full right-0 mt-1 w-72 bg-white rounded border border-[#E8E8E8] shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-2">
                          <div className="space-y-3">
                            <div>
                              <div className="mb-2">
                                <h4 className="text-xs font-semibold text-[#050505] px-3 uppercase tracking-wider">Front Matter</h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Clicked template:', template);
                                      handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-2">
                                <h4 className="text-xs font-semibold text-[#050505] px-3 uppercase tracking-wider">Main Content</h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.content.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Clicked template:', template);
                                      handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-2">
                                <h4 className="text-xs font-semibold text-[#050505] px-3 uppercase tracking-wider">Back Matter</h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.backmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Clicked template:', template);
                                      handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
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
                <p className="text-[10px] text-[#737373] -mb-1">Drag to reorder</p>
                {/* Chapter Pills - Wrapping Layout */}
                <div className="chapter-pills-container flex flex-wrap gap-2 pb-2 pt-2" style={{userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none'}}>
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
                    return (
                      <div
                        key={i}
                        data-chapter-idx={i}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer select-none group relative focus:outline-none ${
                          dragOverIndex === i 
                            ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 scale-105 shadow-lg' 
                            : 'border-2 border-transparent'
                        } ${
                          isSelected 
                            ? "bg-[#181a1d] text-white shadow-sm" 
                            : "bg-[#F7F7F7] text-[#050505] hover:bg-[#F2F2F2]"
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
                        <div className="flex flex-col items-center gap-0 flex-1 justify-center">
                          <span className={`text-[10px] font-normal ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            {typeLabel}
                          </span>
                          <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-[#050505]'}`}>
                            {title}
                          </span>
                        </div>
                        {chapters.length > 1 && (
                          <button
                            className={`flex items-center justify-center focus:outline-none transition-all p-1 rounded ${
                              isSelected 
                                ? "opacity-100 hover:bg-white/30" 
                                : "opacity-70 hover:opacity-100 hover:bg-black/10"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChapter(i);
                            }}
                            aria-label="Delete Chapter"
                          >
                            <BinIcon 
                              key={`bin-${i}-${isSelected}`}
                              className="w-4 h-4 transition"
                              stroke={isSelected ? "#ffffff" : "#050505"}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Ghost Pill for Finger-Following Drag */}
                {ghostPillPosition.visible && (
                  <div
                    className="fixed z-50 pointer-events-none flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium shadow-xl"
                    style={{
                      left: ghostPillPosition.x,
                      top: ghostPillPosition.y,
                      backgroundColor: ghostPillContent.isSelected ? "#181a1d" : "#F7F7F7",
                      color: ghostPillContent.isSelected ? "white" : "#6a6c72",
                      transform: "scale(1.1)",
                      opacity: 0.9,
                    }}
                  >
                    <HandleDragIcon isSelected={ghostPillContent.isSelected} />
                    <div className="flex flex-col items-center gap-0 flex-1 justify-center">
                      <span className={`text-[10px] font-normal ${ghostPillContent.isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {ghostPillContent.type === 'frontmatter' && 'Frontmatter'}
                        {ghostPillContent.type === 'backmatter' && 'Backmatter'} 
                        {ghostPillContent.type === 'content' && 'Chapter'}
                      </span>
                      <span className={`text-xs font-medium ${ghostPillContent.isSelected ? 'text-white' : 'text-[#050505]'}`}>
                        {ghostPillContent.title}
                      </span>
                    </div>
                  </div>
                )}
                </div>
                
                {/* Compact Chapter Title Input in Header */}
                <div className="mt-2">
                  <label className="block text-xs text-[#737373] mb-1">Chapter title</label>
                  <input
                    className="w-full px-3 py-2 rounded text-sm bg-white border border-transparent focus:border-black focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] placeholder:text-sm touch-manipulation"
                    placeholder="Enter chapter title..."
                    value={chapters[selectedChapter]?.title ?? ""}
                    onChange={(e) =>
                      handleChapterTitleChange(selectedChapter, e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Rich Text Editor - Maximized for Writing */}
              <div className="flex-1 min-h-0 pb-20 sm:pb-0 relative flex flex-col">
                <div className="mt-2 mb-1 flex-shrink-0 flex items-start justify-between">
                  <label className="block text-xs text-[#737373]">Chapter content</label>
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
                        <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                          <Image
                            src="/undo-icon.svg"
                            alt="Undo"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                            style={{ borderRadius: '0', boxShadow: 'none' }}
                          />
                        </div>
                      </button>
                      <span className="text-xs font-medium text-[#050505] mt-1">Undo</span>
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
                        <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                          <Image
                            src="/redo-icon.svg"
                            alt="Redo"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                            style={{ borderRadius: '0', boxShadow: 'none' }}
                          />
                        </div>
                      </button>
                      <span className="text-xs font-medium text-[#050505] mt-1">Redo</span>
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
                        ? "Start writing your first chapter here..."
                        : "Start writing your chapter here..."
                    }
                    className="h-full"
                    onCreateEndnote={handleCreateEndnote}
                    chapterId={`chapter-${selectedChapter}`}
                  />
                </div>
              </div>
            </div>

            {/* DESKTOP layout */}
            <div className="hidden lg:flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
              {/* Compact Chapters Section */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <ChaptersIcon className="w-5 h-5" />
                      <h3 className="text-sm font-bold text-[#050505]">
                        Chapters
                      </h3>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#737373] -mb-1">Drag to reorder</p>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[8px] pt-1">
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
                    return (
                      <div
                        key={i}
                        ref={el => { chapterRefs.current[i] = el }}
                        className={`flex items-center px-3 py-1 cursor-pointer transition relative rounded flex-shrink-0
                          ${isSelected 
                            ? "bg-[#181a1d] text-white font-semibold" 
                            : "bg-[#F7F7F7] text-[#050505] hover:bg-[#F2F2F2]"}
                          ${dragOverIndex === i 
                            ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 scale-105 shadow-lg' 
                            : 'border-2 border-transparent'}
                          `}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragEnter={() => handleDragEnter(i)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => handleSelectChapter(i)}
                      >
                        <HandleDragIcon isSelected={isSelected} />
                        <div className="flex flex-col gap-0 ml-2 min-w-0">
                          <span className={`text-[10px] font-normal ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            {typeLabel}
                          </span>
                          <span className={`text-[12px] font-medium ${isSelected ? 'text-white' : 'text-[#050505]'}`}>
                            {title}
                          </span>
                        </div>
                        {chapters.length > 1 && (
                          <button
                            className={`ml-2 p-1 rounded transition focus:outline-none ${
                              isSelected 
                                ? "hover:bg-white/10 text-white/65 hover:text-white" 
                                : "hover:bg-black/10 text-[#050505]/65 hover:text-[#050505]"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChapter(i);
                            }}
                            aria-label="Delete Chapter"
                          >
                            <BinIcon 
                              key={`desktop-bin-${i}-${isSelected}`}
                              className="w-4 h-4"
                              stroke={isSelected ? "#ffffff" : "#050505"}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {/* Add Chapter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                      aria-label="Add new chapter"
                      className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
                    >
                      <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                        <PlusIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-[#050505]">Add</span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-white rounded border border-[#E8E8E8] shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-3">
                          <div className="space-y-4">
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-[#050505] px-3 uppercase tracking-wider">Front Matter</h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Desktop clicked template:', template);
                                      handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-[#050505] px-3 uppercase tracking-wider">Main Content</h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.content.map((template) => (
                                  <button
                                    key={template.title}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Desktop clicked template:', template);
                                      handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-[#050505] px-3 uppercase tracking-wider">Back Matter</h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.backmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Desktop clicked template:', template);
                                      handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
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
              
              {/* Editor Area - Prioritized for Writing */}
              <section className="flex flex-col min-w-0 flex-1 min-h-0">
                {/* Compact Chapter Title Header */}
                <div className="mb-1 flex-shrink-0 bg-white border-b border-[#F2F2F2] pb-2">
                  <label className="block text-xs text-[#737373] mb-1">Chapter title</label>
                  <input
                    className="w-full px-3 py-2 rounded text-sm bg-white border border-transparent focus:border-black focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] placeholder:text-sm"
                    placeholder="Enter chapter title..."
                    value={chapters[selectedChapter]?.title ?? ""}
                    onChange={(e) =>
                      handleChapterTitleChange(selectedChapter, e.target.value)
                    }
                  />
                </div>
                {/* Rich Text Editor - Maximum Space */}
                <div className="w-full max-w-full flex-1 min-h-0 flex flex-col">
                  <div className="mt-2 mb-1 flex-shrink-0 flex items-start justify-between">
                    <label className="block text-xs text-[#737373]">Chapter content</label>
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
                          <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                            <Image
                              src="/undo-icon.svg"
                              alt="Undo"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                              style={{ borderRadius: '0', boxShadow: 'none' }}
                            />
                          </div>
                        </button>
                        <span className="text-xs font-medium text-[#050505] mt-1">Undo</span>
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
                          <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                            <Image
                              src="/redo-icon.svg"
                              alt="Redo"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                              style={{ borderRadius: '0', boxShadow: 'none' }}
                            />
                          </div>
                        </button>
                        <span className="text-xs font-medium text-[#050505] mt-1">Redo</span>
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
                          ? "Start writing your first chapter here..."
                          : "Start writing your chapter here..."
                      }
                      className="h-full"
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
