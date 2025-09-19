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

  const [saveFeedback, setSaveFeedback] = useState(false);

  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [markerStyle, setMarkerStyle] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const el = chapterRefs.current[selectedChapter];
    if (el) {
      setMarkerStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
      });
    }
  }, [selectedChapter, chapters.length]);

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
    setCurrentBookId(undefined);
  }

  function handleNewBookConfirm() {
    // Save current book before starting new one
    if (title || author || chapters.some(ch => ch.content.trim())) {
      handleSaveBook();
    }
    
    // Clear all data for new book
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
      setChapters(mostRecent.chapters || []);
      setCurrentBookId(mostRecent.id);
    }

    if (!initialized) setInitialized(true);
  }, [searchParams, initialized, currentBookId, chapters.length]);

  async function handleExportEPUB() {
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
      chapters,
    });
  }

  function handleSaveBook() {
    const id = saveBookToLibrary({
      id: currentBookId,
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
    });
    setCurrentBookId(id);
    setLibraryBooks(loadBookLibrary());
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1300);
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
      setChapters(loaded.chapters || []);
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
          <aside className="hidden lg:flex flex-col w-full lg:max-w-xs border border-[#ececec] rounded-xl bg-white min-w-0 lg:min-w-[340px] lg:h-full overflow-y-auto shadow-sm p-4 gap-4">
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

          {/* Main Editor Panel - Mobile Optimized */}
          <main className="flex-1 flex flex-col overflow-x-auto bg-white rounded-xl shadow-sm border border-[#ececec] px-2 lg:px-8 py-2 lg:py-8 min-w-0 h-full overflow-y-auto">
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

            {/* MOBILE OPTIMIZED EDITOR - Full Viewport (including tablets) */}
            <div className="lg:hidden flex flex-col gap-4 h-full">
              {/* Chapter Selection - Compact Horizontal Scroll */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-[#6a6c72]">Chapters</h3>
                  <button
                    onClick={handleAddChapter}
                    aria-label="Add new chapter"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f4f4f5] hover:bg-[#ececec] text-xs font-semibold text-[#15161a] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
                {/* Chapter Pills - Wrapping Layout */}
                <div className="chapter-pills-container flex flex-wrap gap-2 pb-2" style={{userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none'}}>
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const titleText = ch.title?.trim() || '';
                    const truncatedTitle = titleText.length > 8 
                      ? titleText.substring(0, 8) + '...' 
                      : titleText;
                    const displayTitle = truncatedTitle 
                      ? `${i + 1}. ${truncatedTitle}` 
                      : `${i + 1}.`;
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
                        <span className="truncate max-w-[120px] flex-1 text-center">{displayTitle}</span>
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
                    <span className="truncate max-w-[120px] flex-1 text-center">
                      {ghostPillContent.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Chapter Title Input - Touch Optimized */}
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

              {/* Rich Text Editor - Maximized for Mobile with Safe Spacing */}
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
                  <button
                    onClick={handleAddChapter}
                    aria-label="Add new chapter"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[22px] border border-[#e5e5e6] bg-[#f7f8f9] text-[12px] font-semibold text-[#6d6f74] hover:text-[#15161a] hover:border-[#d3d4d6] active:scale-[0.97] transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add new chapter</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 min-h-[8px]">
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const displayTitle =
                      ch.title?.trim()
                        ? `${i + 1}. ${ch.title.trim()}`
                        : `${i + 1}.`;
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
                        <span className="ml-2 text-[12px] truncate min-w-0">
                          {displayTitle}
                        </span>
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