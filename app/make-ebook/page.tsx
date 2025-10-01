"use client";

import React, { Suspense, useState, useRef, useLayoutEffect, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/hooks/useAuth";
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, BookOpen, Menu, X, Save, Download } from "lucide-react";
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

function HandleDots() {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex flex-wrap content-center gap-[2px] opacity-70 group-hover:opacity-100 transition"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-[2px] bg-white/55 group-hover:bg-white transition"
        />
      ))}
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
      coverFile,
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
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      {/* Main Content */}
      <div className="bg-[#f7f9fa] text-[#15161a] pt-[64px]">
        {/* Library Panel */}
        {libraryOpen && (
          <div className="fixed inset-0 z-[120] bg-black/20 flex items-start justify-center">
            <div className="bg-white rounded-xl shadow-2xl p-6 mt-20 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6" /> Library
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
                        <Trash2 className="w-4 h-4" />
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
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Start New Book?</h2>
              <p className="text-gray-600 mb-6">
                This will save your current book and start a new one. All your current work will be preserved in the library.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewBookConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#ececec] text-sm font-medium hover:bg-[#f4f4f5] transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleNewBookConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#181a1d] text-white text-sm font-medium hover:bg-[#23252a] transition-colors"
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
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Save Book</h2>
              <p className="text-gray-600 mb-6">
                This book already exists in your library. Do you want to overwrite the existing version or save as a new version?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#ececec] text-sm font-medium hover:bg-[#f4f4f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverwriteBook}
                  className="flex-1 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Overwrite
                </button>
                <button
                  onClick={handleSaveAsNewVersion}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#181a1d] text-white text-sm font-medium hover:bg-[#23252a] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out">
              <div className="flex flex-col h-full">
                {/* Header with Actions */}
                <div className="flex items-center justify-end p-4 border-b border-[#ececec]">
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Tab Navigation */}
                <nav className="flex border-b border-[#ececec] p-4 gap-2 overflow-x-auto">
                  {["setup", "preview", "library"].map((key) => (
                    <button
                      key={key}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                        tab === key
                          ? "bg-[#f4f4f5] text-[#15161a] shadow-sm"
                          : "hover:bg-[#f4f4f5] text-[#86868B]"
                      }`}
                      onClick={() => setTab(key as any)}
                    >
                      {key === "setup"
                        ? "Metadata"
                        : key === "preview"
                        ? "Preview"
                        : key === "ai"
                        ? "AI"
                        : "Library"}
                    </button>
                  ))}
                </nav>
                
                {/* Additional Actions */}
                <div className="p-4 border-b border-[#ececec]">
                  <div className="flex justify-around gap-4">
                    <button
                      onClick={() => {
                        handleSaveBook();
                        setMobileSidebarOpen(false);
                      }}
                      className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs bg-transparent border-none outline-none"
                      disabled={!!saveFeedback}
                      type="button"
                    >
                      <Save className="w-5 h-5" />
                      <span className={`transition-all ${saveFeedback ? "text-green-600 font-semibold" : ""}`}>
                        {saveFeedback ? "Saved!" : "Save"}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        handleExportEPUB();
                        setMobileSidebarOpen(false);
                      }}
                      className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs bg-transparent border-none outline-none"
                      type="button"
                    >
                      <Download className="w-5 h-5" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => {
                        showNewBookConfirmation();
                        setMobileSidebarOpen(false);
                      }}
                      className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs bg-transparent border-none outline-none"
                      type="button"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Book</span>
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
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
                      <h3 className="text-lg font-semibold">Your Library</h3>
                      {libraryBooks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No saved books yet. Create and save a book to see it here.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {libraryBooks.map((b: any) => (
                            <li key={b.id} className="flex items-center justify-between p-3 border border-[#ececec] rounded-lg hover:bg-[#f4f4f5] transition-colors">
                              <button
                                className="flex-1 text-left"
                                onClick={() => {
                                  handleLoadBook(b.id);
                                  setMobileSidebarOpen(false);
                                }}
                                title={b.title}
                              >
                                <div className="font-semibold">{b.title || "Untitled"}</div>
                                <div className="text-sm text-gray-500">{b.author}</div>
                                <div className="text-xs text-gray-400">{new Date(b.savedAt).toLocaleString()}</div>
                              </button>
                              <button
                                className="text-gray-400 hover:text-red-500 p-1"
                                onClick={() => handleDeleteBook(b.id)}
                                title="Delete book"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main layout: Mobile-optimized */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:flex flex-col w-full lg:max-w-xs border border-[#ececec] rounded-xl bg-white min-w-0 lg:min-w-[340px] lg:h-full overflow-y-auto shadow-sm mt-4 ml-4 p-4 gap-4">
            <nav className="flex flex-row border-b border-[#ececec] items-center gap-2 pb-2">
              {["setup", "preview", "library"].map((key) => (
                <button
                  key={key}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                    tab === key
                      ? "bg-[#f4f4f5] text-[#15161a] shadow-sm"
                      : "hover:bg-[#f4f4f5] text-[#86868B]"
                  }`}
                  onClick={() => setTab(key as any)}
                >
                  {key === "setup"
                    ? "Metadata"
                    : key === "preview"
                    ? "Preview"
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
                  <h3 className="text-lg font-semibold">Your Library</h3>
                  {libraryBooks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No saved books yet. Create and save a book to see it here.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {libraryBooks.map((b: any) => (
                        <li key={b.id} className="flex items-center justify-between p-3 border border-[#ececec] rounded-lg hover:bg-[#f4f4f5] transition-colors">
                          <button
                            className="flex-1 text-left"
                            onClick={() => {
                              handleLoadBook(b.id);
                            }}
                            title={b.title}
                          >
                            <div className="font-semibold">{b.title || "Untitled"}</div>
                            <div className="text-sm text-gray-500">{b.author}</div>
                            <div className="text-xs text-gray-400">{new Date(b.savedAt).toLocaleString()}</div>
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-500 p-1"
                            onClick={() => handleDeleteBook(b.id)}
                            title="Delete book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Editor Panel - Mobile Optimised */}
          <main className="flex-1 flex flex-col overflow-x-auto bg-white rounded-xl shadow-sm border border-[#ececec] mt-4 ml-4 px-2 lg:px-8 py-2 lg:py-8 min-w-0 h-full overflow-y-auto">
            {/* Mobile Header with Hamburger Menu */}
            <div className="lg:hidden flex items-center justify-between mb-4 pb-2 border-b border-[#ececec]">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg bg-[#f4f4f5] hover:bg-[#ececec] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <div className="flex-1 text-center">
                  <h1 className="text-sm font-medium text-[#6a6c72] truncate px-4">
                    {title}
                  </h1>
                </div>
              )}
            </div>

            {/* Desktop Book Title and Toolbar */}
            <div className="hidden lg:block">
              {title && (
                <div className="mb-3 pb-2 border-b border-[#f4f4f5]">
                  <h1 className="text-lg font-medium text-[#23242a] truncate">
                    {title}
                  </h1>
                </div>
              )}
              <BookToolbar
                onNewBook={showNewBookConfirmation}
                onSave={handleSaveBook}
                onExport={handleExportEPUB}
                saveFeedback={saveFeedback}
              />
            </div>

            {/* MOBILE OPTIMISED EDITOR - Full Viewport (including tablets) */}
            <div className="lg:hidden flex flex-col gap-4 h-full">
              {/* Chapter Selection - Compact Horizontal Scroll */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-[#6a6c72]">Chapters</h3>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                      aria-label="Add new chapter"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f4f4f5] hover:bg-[#ececec] text-xs font-semibold text-[#15161a] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white rounded-lg border border-[#ececec] shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-2">
                          <div className="space-y-3">
                            {/* Most common selections at the top - no header */}
                            <div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.common.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Mobile clicked template:', template);
                                      handleAddChapter(template.type, template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-xs font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">F</span>
                                <h4 className="text-xs font-semibold text-[#6a6c72]">Front Matter</h4>
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
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-xs font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">C</span>
                                <h4 className="text-xs font-semibold text-[#6a6c72]">Main Content</h4>
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
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-xs font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">B</span>
                                <h4 className="text-xs font-semibold text-[#6a6c72]">Back Matter</h4>
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
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-xs font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
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
                {/* Chapter Pills - Wrapping Layout */}
                <div className="chapter-pills-container flex flex-wrap gap-2 pb-2" style={{userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none'}}>
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const titleText = ch.title?.trim() || '';
                    const displayTitle = (() => {
                      if (ch.type === 'frontmatter' || ch.type === 'backmatter') {
                        return titleText || `${ch.type === 'frontmatter' ? 'Front' : 'Back'} Matter`;
                      }
                      const contentChapterNum = getContentChapterNumber(chapters, i);
                      const truncatedTitle = titleText.length > 8 
                        ? titleText.substring(0, 8) + '...' 
                        : titleText;
                      return truncatedTitle 
                        ? `${contentChapterNum}. ${truncatedTitle}` 
                        : `${contentChapterNum}.`;
                    })();
                    return (
                      <div
                        key={i}
                        data-chapter-idx={i}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none group relative ${
                          dragOverIndex === i 
                            ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 scale-105 shadow-lg' 
                            : 'border-2 border-transparent'
                        } ${
                          isSelected 
                            ? "bg-[#181a1d] text-white shadow-sm" 
                            : "bg-[#f4f4f5] text-[#6a6c72] hover:bg-[#ececec]"
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
                        <HandleDots />
                        <div className="flex items-center gap-1.5 flex-1 justify-center">
                          {/* Chapter Type Badge */}
                          {ch.type === 'frontmatter' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">F</span>
                          )}
                          {ch.type === 'backmatter' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">B</span>
                          )}
                          {ch.type === 'content' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">C</span>
                          )}
                          <span className="truncate max-w-[100px]">{displayTitle}</span>
                        </div>
                        {chapters.length > 1 && (
                          <button
                            className="opacity-60 hover:opacity-100 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChapter(i);
                            }}
                            aria-label="Delete Chapter"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#9ca3af] mt-3">Drag and drop to re-order your chapters</p>
                
                {/* Ghost Pill for Finger-Following Drag */}
                {ghostPillPosition.visible && (
                  <div
                    className="fixed z-50 pointer-events-none flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium shadow-xl"
                    style={{
                      left: ghostPillPosition.x,
                      top: ghostPillPosition.y,
                      backgroundColor: ghostPillContent.isSelected ? "#181a1d" : "#f4f4f5",
                      color: ghostPillContent.isSelected ? "white" : "#6a6c72",
                      transform: "scale(1.1)",
                      opacity: 0.9,
                    }}
                  >
                    <HandleDots />
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                      {/* Chapter Type Badge */}
                      {ghostPillContent.type === 'frontmatter' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">F</span>
                      )}
                      {ghostPillContent.type === 'backmatter' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">B</span>
                      )}
                      {ghostPillContent.type === 'content' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">C</span>
                      )}
                      <span className="truncate max-w-[100px]">
                        {ghostPillContent.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter Title Input - Touch Optimised */}
              <div className="flex-shrink-0">
                <div className="mb-2">
                  <span className="text-xs text-[#9ca3af] whitespace-nowrap">Chapter title</span>
                </div>
                <input
                  className="w-full px-4 py-3.5 rounded-xl border border-[#e4e5e7] text-base bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] touch-manipulation"
                  placeholder="Chapter title..."
                  value={chapters[selectedChapter]?.title ?? ""}
                  onChange={(e) =>
                    handleChapterTitleChange(selectedChapter, e.target.value)
                  }
                />
              </div>

              {/* Rich Text Editor - Maximised for Mobile with Safe Spacing */}
              <div className="flex-1 min-h-0 pb-20 sm:pb-0 relative"> {/* Add bottom padding on mobile for toolbar */}
                <div className="mb-2">
                  <span className="text-xs text-[#9ca3af] whitespace-nowrap">Chapter content</span>
                </div>
                <RichTextEditor
                  value={chapters[selectedChapter]?.content || ""}
                  onChange={(html) => handleChapterContentChange(selectedChapter, html)}
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

            {/* DESKTOP layout */}
            <div className="hidden lg:flex flex-col gap-6">
              {/* Chapters Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#6a6c72]">
                    Chapters
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                      aria-label="Add new chapter"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[22px] border border-[#e5e5e6] bg-[#f7f8f9] text-[12px] font-semibold text-[#6d6f74] hover:text-[#15161a] hover:border-[#d3d4d6] active:scale-[0.97] transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new chapter</span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-white rounded-lg border border-[#ececec] shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-3">
                          <div className="space-y-4">
                            {/* Most common selections at the top - no header */}
                            <div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.common.map((template) => (
                                  <button
                                    key={template.title}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Desktop clicked template:', template);
                                      handleAddChapter(template.type, template.title);
                                      setChapterTypeDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">F</span>
                                <h4 className="text-sm font-semibold text-[#6a6c72]">Front Matter</h4>
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
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">C</span>
                                <h4 className="text-sm font-semibold text-[#6a6c72]">Main Content</h4>
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
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">B</span>
                                <h4 className="text-sm font-semibold text-[#6a6c72]">Back Matter</h4>
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
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f4f4f5] transition-colors"
                                  >
                                    <div className="text-sm font-medium text-[#15161a]">{template.title}</div>
                                    <div className="text-xs text-[#6a6c72]">{template.description}</div>
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
                <div className="flex flex-wrap gap-3 min-h-[8px]">
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const displayTitle = (() => {
                      const titleText = ch.title?.trim() || '';
                      if (ch.type === 'frontmatter' || ch.type === 'backmatter') {
                        return titleText || `${ch.type === 'frontmatter' ? 'Front' : 'Back'} Matter`;
                      }
                      const contentChapterNum = getContentChapterNumber(chapters, i);
                      return titleText ? `${contentChapterNum}. ${titleText}` : `${contentChapterNum}.`;
                    })();
                    return (
                      <div
                        key={i}
                        ref={el => { chapterRefs.current[i] = el }}
                        className={`flex items-center px-3 py-1 cursor-pointer transition relative rounded-full flex-shrink-0
                          ${isSelected 
                            ? "bg-[#181a1d] text-white font-semibold" 
                            : "bg-[#f4f4f5] text-[#6a6c72] hover:bg-[#ececec]"}
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
                        <HandleDots />
                        <div className="flex items-center gap-1.5 ml-2 min-w-0">
                          {/* Chapter Type Badge */}
                          {ch.type === 'frontmatter' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded flex-shrink-0">F</span>
                          )}
                          {ch.type === 'backmatter' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded flex-shrink-0">B</span>
                          )}
                          {ch.type === 'content' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded flex-shrink-0">C</span>
                          )}
                          <span className="text-[12px] truncate min-w-0">
                            {displayTitle}
                          </span>
                        </div>
                        {chapters.length > 1 && (
                          <button
                            className={`ml-2 p-1 rounded transition ${
                              isSelected 
                                ? "hover:bg-white/10 text-white/65 hover:text-white" 
                                : "hover:bg-black/10 text-[#6a6c72]/65 hover:text-[#6a6c72]"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChapter(i);
                            }}
                            aria-label="Delete Chapter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#9ca3af] mt-2">Drag and drop to re-order your chapters</p>
              </div>
              
              {/* Editor Area */}
              <section className="flex flex-col min-w-0">
                <div className="mb-8">
                  <div className="mb-2">
                    <span className="text-xs text-[#9ca3af] whitespace-nowrap">Chapter title</span>
                  </div>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e4e5e7] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8]"
                    placeholder="Enter the chapter title..."
                    value={chapters[selectedChapter]?.title ?? ""}
                    onChange={(e) =>
                      handleChapterTitleChange(selectedChapter, e.target.value)
                    }
                  />
                </div>
                <div className="w-full max-w-full overflow-hidden">
                  <div className="mb-2">
                    <span className="text-xs text-[#9ca3af] whitespace-nowrap">Chapter content</span>
                  </div>
                  <RichTextEditor
                    value={chapters[selectedChapter]?.content || ""}
                    onChange={(html) =>
                      handleChapterContentChange(selectedChapter, html)
                    }
                    minHeight={360}
                    showWordCount
                    placeholder={
                      selectedChapter === 0
                        ? "Start writing your first chapter here..."
                        : "Start writing your chapter here..."
                    }
                    onCreateEndnote={handleCreateEndnote}
                    chapterId={`chapter-${selectedChapter}`}
                  />
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
