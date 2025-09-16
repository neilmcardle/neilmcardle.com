"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
// import { ProtectedRoute } from "@/components/ProtectedRoute"; 
import { Header } from "@/components/Header";
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, BookOpen } from "lucide-react";
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
    handleSelectChapter,
  } = useChapters();

  const {
    tags, setTags, tagInput, setTagInput, handleAddTag, handleRemoveTag
  } = useTags();

  const [tab, setTab] = useState<"setup" | "ai" | "preview">("setup");
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

  function handleNewBook() {
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
    removeBookFromLibrary(id);
    setLibraryBooks(loadBookLibrary());
    if (currentBookId === id) {
      handleNewBook();
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

        {/* Main layout: viewport does not scroll, only aside/main panels */}
        <div className="flex flex-col sm:flex-row h-[calc(100vh-64px)]">
          {/* Aside */}
          <aside className="flex flex-col w-full sm:max-w-xs border border-[#ececec] rounded-xl bg-white min-w-0 sm:min-w-[340px] h-[320px] sm:h-full overflow-y-auto shadow-sm p-4 gap-4 mb-4 sm:mb-0">
            <nav className="flex flex-row border-b border-[#ececec] items-center gap-2 pb-2">
              {["setup", "preview", "ai"].map((key) => (
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
                    : "AI"}
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
              {tab === "ai" && <AiTabContent />}
            </div>
          </aside>

          {/* Main Editor Panel */}
          <main className="flex-1 flex flex-col overflow-x-auto bg-white rounded-xl shadow-sm border border-[#ececec] px-2 sm:px-8 py-4 sm:py-8 min-w-0 h-[320px] sm:h-full overflow-y-auto">
            {/* Book-level toolbar here */}
            <BookToolbar
              onNewBook={handleNewBook}
              onSave={handleSaveBook}
              onExport={handleExportEPUB}
              saveFeedback={saveFeedback}
            />

            {/* MOBILE CHAPTERS PANEL */}
            <div className="sm:hidden flex flex-col gap-3 mb-4">
              <div className="flex flex-col gap-3">
                {chapters.map((ch, i) => {
                  const isSelected = selectedChapter === i;
                  const displayTitle =
                    ch.title?.trim()
                      ? `Chapter ${i + 1}: ${ch.title.trim()}`
                      : `Chapter ${i + 1}`;
                  return (
                    <div
                      key={i}
                      className={`flex items-center rounded-[28px] px-4 py-2 mb-2 cursor-pointer transition
                        ${isSelected ? "text-white" : "text-white/75"}
                        bg-[#181a1d] hover:bg-[#23252a] hover:text-white
                        relative
                      `}
                      data-chapter-idx={i}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragEnter={() => handleDragEnter(i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onTouchStart={() => handleTouchStart(i)}
                      onTouchMove={(e) => handleTouchMove(i, e)}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => handleSelectChapter(i)}
                    >
                      <HandleDots />
                      <span
                        className={
                          "ml-2 text-[12px] truncate flex-1 min-w-0 " +
                          (isSelected ? "font-bold underline underline-offset-4" : "")
                        }
                      >
                        {displayTitle}
                      </span>
                      <span className="ml-3 text-[11px] font-medium whitespace-nowrap">
                        {plainText(ch.content).length} chars
                      </span>
                      <button
                        className="ml-3 p-1 rounded hover:bg-white/10 text-white/65 hover:text-white transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveChapter(i);
                        }}
                        aria-label="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                {/* Add Button (mobile) */}
                <div className="flex justify-end">
                  <button
                    onClick={handleAddChapter}
                    aria-label="Add new chapter"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[20px] border border-[#e5e5e6] bg-[#f7f8f9] text-[12px] font-semibold text-[#6d6f74] hover:text-[#15161a] hover:border-[#d3d4d6] active:scale-[0.97] transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="pr-1">Add chapter</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-[#e4e5e7] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8]"
                placeholder="Enter the chapter title..."
                value={chapters[selectedChapter]?.title ?? ""}
                onChange={(e) =>
                  handleChapterTitleChange(selectedChapter, e.target.value)
                }
              />

              {/* Rich Text Editor */}
              <RichTextEditor
                value={chapters[selectedChapter]?.content || ""}
                onChange={(html) => handleChapterContentChange(selectedChapter, html)}
                minHeight={220}
                showWordCount
                placeholder={
                  selectedChapter === 0
                    ? "Start writing your first chapter here..."
                    : "Start writing your chapter here..."
                }
              />
            </div>

            {/* DESKTOP layout */}
            <div className="hidden sm:flex flex-row gap-6">
              {/* Chapters Column (redesigned) */}
              <div className="flex flex-col min-w-[250px] w-[270px] gap-4">
                <div className="flex items-center justify-between">
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
                <div className="relative flex flex-col gap-3 pr-1 min-h-[120px]">
                  <ChapterCapsuleMarker markerStyle={markerStyle} />
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
                        className={`flex items-center px-6 py-2.5 mb-2 cursor-pointer transition
                          ${isSelected ? "text-white font-semibold" : "text-white/75"}
                          rounded-full
                          relative
                          `}
                        style={{
                          backgroundColor: "#181a1d",
                          borderRadius: 9999,
                        }}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragEnter={() => handleDragEnter(i)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => handleSelectChapter(i)}
                      >
                        <HandleDots />
                        <span className="ml-3 text-[12px] truncate flex-1 min-w-0">
                          {displayTitle}
                        </span>
                        <span className="ml-4 text-[11px] font-medium whitespace-nowrap">
                          {plainText(ch.content).length} chars
                        </span>
                        <button
                          className="ml-4 p-1 rounded hover:bg-white/10 text-white/65 hover:text-white transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveChapter(i);
                          }}
                          aria-label="Delete Chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editor Area */}
              <section className="flex-1 flex flex-col min-w-0">
                <input
                  className="w-full mb-3 px-4 py-2.5 rounded-xl border border-[#e4e5e7] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8]"
                  placeholder="Enter the chapter title..."
                  value={chapters[selectedChapter]?.title ?? ""}
                  onChange={(e) =>
                    handleChapterTitleChange(selectedChapter, e.target.value)
                  }
                />
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
              </section>
            </div>
          </main>
        </div>

        {/* --- Begin: Floating Legal Links --- */}
        <div
          className="fixed bottom-4 right-6 z-50 flex flex-col items-end space-y-1"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="bg-white/90 rounded-md px-3 py-1 shadow border border-gray-200 text-xs text-gray-500 space-x-3"
            style={{ pointerEvents: "auto" }}
          >
            <Link
              href="/terms"
              className="hover:underline text-gray-500"
              target="_blank"
            >
              Terms of Service
            </Link>
            <span className="mx-1 text-gray-300">|</span>
            <Link
              href="/privacy"
              className="hover:underline text-gray-500"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        {/* --- End: Floating Legal Links --- */}
      </div>
    </>
  );
}

export default function ProtectedMakeEbookPage() {
  return <MakeEbookPage />;
}

