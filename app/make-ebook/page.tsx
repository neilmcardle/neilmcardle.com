"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import {
  Plus, UploadCloud, ChevronLeft, Trash2, GripVertical, Lock, Unlock, Pencil, Calendar, Languages
} from "lucide-react";

// --- Instant Tooltip component ---
function SimpleTooltip({ text, children }: { text: string, children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap shadow pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

const today = new Date().toISOString().slice(0, 10);
const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Chinese"];
const GENRES = ["Fiction", "Non-fiction", "Romance", "Sci-fi", "Fantasy", "Memoir"];

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function MakeEbookPage() {
  // Book state
  const [tab, setTab] = useState<"setup" | "ai" | "preview">("setup");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pubDate, setPubDate] = useState(today);
  const [isbn, setIsbn] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Chapters state
  const [chapters, setChapters] = useState([{ title: "", content: "" }]);
  const [selectedChapter, setSelectedChapter] = useState(0);

  // Section lock states
  const [lockedSections, setLockedSections] = useState({
    bookInfo: false,
    publishing: false,
    tags: false,
    cover: false,
  });

  // For inline editing of title and author
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);

  // Drag and drop state for chapters
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function handleDragStart(index: number) { dragItem.current = index; }
  function handleDragEnter(index: number) { dragOverItem.current = index; }
  function handleDragEnd() {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) { dragItem.current = null; dragOverItem.current = null; return; }
    const updated = [...chapters];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setChapters(updated);
    setSelectedChapter(to);
    dragItem.current = null;
    dragOverItem.current = null;
  }
  function handleTouchStart(index: number, e: React.TouchEvent) { dragItem.current = index; }
  function handleTouchMove(index: number, e: React.TouchEvent) {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;
    const chapterEls = Array.from(document.querySelectorAll('[data-chapter-idx]'));
    for (const el of chapterEls) {
      if (el.contains(target)) {
        const idx = Number((el as HTMLElement).dataset.chapterIdx);
        if (!isNaN(idx)) dragOverItem.current = idx;
      }
    }
  }
  function handleTouchEnd() { handleDragEnd(); }
  function handleAddChapter() {
    setChapters((chs) => [
      ...chs,
      { title: "", content: "" },
    ]);
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
    setSelectedChapter((prev) => (prev === idx ? 0 : Math.max(0, prev - 1)));
  }
  function handleAddTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }
  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }
  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setCoverFile(e.target.files[0]);
  }

  // --- EPUB Export ---
  async function handleExportEPUB() {
    const bookId = isbn.trim() ? isbn.trim() : "urn:uuid:" + uuidv4();
    const safeTitle = title.trim() || "Untitled";
    const safeAuthor = author.trim() || "Unknown Author";
    const safeLang = language || "en";
    const d = new Date(pubDate);
    const safeDate = isNaN(d.getTime()) ? today : d.toISOString().slice(0, 10);

    const zip = new JSZip();

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file(
      "META-INF/container.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>`
    );
    let coverHref = "";
    let coverItem = "";
    if (coverFile) {
      const ext = coverFile.type === "image/png" ? "png" : "jpg";
      coverHref = `cover.${ext}`;
      zip.file(
        "OEBPS/cover.xhtml",
        `<?xml version="1.0" encoding="utf-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head><title>Cover</title></head>
          <body style="margin:0;padding:0;">
            <img src="${coverHref}" alt="cover" style="width:100%;height:auto;"/>
          </body>
        </html>`
      );
      const coverData = await coverFile.arrayBuffer();
      zip.file(`OEBPS/${coverHref}`, coverData, { binary: true });
      coverItem = `<item id="cover-image" href="${coverHref}" media-type="${coverFile.type}" />
                   <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`;
    }
    const chapterHrefs: string[] = [];
    chapters.forEach((ch, idx) => {
      const filename = `chapter${idx + 1}.xhtml`;
      chapterHrefs.push(filename);
      zip.file(
        `OEBPS/${filename}`,
        `<?xml version="1.0" encoding="utf-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head><title>${ch.title || `Chapter ${idx + 1}`}</title></head>
          <body>
            <h2>${ch.title || `Chapter ${idx + 1}`}</h2>
            <div>${ch.content.replace(/\n/g, "<br/>")}</div>
          </body>
        </html>`
      );
    });
    const subjects = [genre, ...tags].filter(Boolean);
    const coverMeta = coverFile ? `<meta name="cover" content="cover-image"/>` : "";
    const manifestItems = [
      coverItem,
      ...chapterHrefs.map(
        (fn, i) =>
          `<item id="chapter${i + 1}" href="${fn}" media-type="application/xhtml+xml"/>`
      ),
      `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
    ]
      .filter(Boolean)
      .join("\n      ");
    const spineItems = [
      coverFile ? `<itemref idref="cover" linear="no"/>` : "",
      ...chapterHrefs.map((_, i) => `<itemref idref="chapter${i + 1}"/>`)
    ]
      .filter(Boolean)
      .join("\n      ");
    zip.file(
      "OEBPS/content.opf",
      `<?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:identifier id="BookId">${bookId}</dc:identifier>
          <dc:title>${safeTitle}</dc:title>
          <dc:language>${safeLang}</dc:language>
          <dc:creator>${safeAuthor}</dc:creator>
          <dc:description>${blurb}</dc:description>
          <dc:publisher>${publisher}</dc:publisher>
          <dc:date>${safeDate}</dc:date>
          ${subjects.map(s => `<dc:subject>${s}</dc:subject>`).join("\n          ")}
          ${coverMeta}
          <meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta>
        </metadata>
        <manifest>
          ${manifestItems}
        </manifest>
        <spine toc="ncx">
          ${spineItems}
        </spine>
      </package>`
    );
    zip.file(
      "OEBPS/toc.ncx",
      `<?xml version="1.0" encoding="UTF-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
        <head>
          <meta name="dtb:uid" content="${bookId}"/>
          <meta name="dtb:depth" content="1"/>
          <meta name="dtb:totalPageCount" content="0"/>
          <meta name="dtb:maxPageNumber" content="0"/>
        </head>
        <docTitle><text>${safeTitle}</text></docTitle>
        <navMap>
          ${chapters
            .map(
              (ch, i) => `<navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
                <navLabel><text>${ch.title || `Chapter ${i + 1}`}</text></navLabel>
                <content src="${chapterHrefs[i]}"/>
              </navPoint>`
            )
            .join("\n")}
        </navMap>
      </ncx>`
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // --- Preview panel helpers
  const totalWords = chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0);
  const pageCount = Math.max(1, Math.ceil(totalWords / 300));
  const readingTime = Math.max(1, Math.round(totalWords / 200));
  const coverUrl = coverFile ? URL.createObjectURL(coverFile) : null;

  return (
    <div className="flex flex-col min-h-screen h-screen bg-[#f7f9fa] text-[#15161a]">
      {/* Top Banner for Beta Notice */}
      <div className="w-full bg-gradient-to-r from-[#f4f4f5] to-[#eaeaec] border-b border-[#ececec] p-2 text-center flex items-center justify-center relative">
        <span className="text-xs text-[#86868B] font-medium">
          🚧 This page is under active development. <b>Coming as a public beta Autumn 2025.</b>
        </span>
      </div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-8 py-4 sm:py-6 border-b border-[#ececec] bg-white rounded-b-xl shadow-sm relative gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="Back to home" className="group">
              <ChevronLeft className="w-6 h-6 text-[#86868B] group-hover:text-[#15161a] transition" />
            </Link>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <Image src="/caveman.svg" alt="makeEbook logo" width={32} height={32} />
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">makeEbook</span>
            </Link>
          </div>
          <span className="text-xs text-[#86868B] sm:ml-2 ml-10 sm:mt-0 mt-[-10px]">
            Create professional ebooks with AI assistance
          </span>
        </div>
        <button
          className="w-full sm:w-auto px-6 py-2 rounded-full bg-[#15161a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#23242a] transition text-base shadow"
          onClick={handleExportEPUB}
        >
          Export EPUB
        </button>
      </header>
      {/* Main layout */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0 h-0 gap-4 px-2 sm:px-8 py-4">
        {/* Left Sidebar */}
        <aside className="w-full sm:max-w-xs border border-[#ececec] rounded-xl bg-white min-w-0 sm:min-w-[340px] h-[340px] sm:h-full overflow-y-auto shadow-sm p-4 flex flex-col gap-4">
          {/* Tabs */}
          <nav className="flex flex-row border-b border-[#ececec] items-center gap-2 pb-2">
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                tab === "setup"
                  ? "bg-[#f4f4f5] text-[#15161a] shadow-sm"
                  : "hover:bg-[#f4f4f5] text-[#86868B]"
              }`}
              onClick={() => setTab("setup")}
            >
              Metadata
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                tab === "preview"
                  ? "bg-[#f4f4f5] text-[#15161a] shadow-sm"
                  : "hover:bg-[#f4f4f5] text-[#86868B]"
              }`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                tab === "ai"
                  ? "bg-[#f4f4f5] text-[#15161a] shadow-sm"
                  : "hover:bg-[#f4f4f5] text-[#86868B]"
              }`}
              onClick={() => setTab("ai")}
            >
              AI
            </button>
          </nav>
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === "setup" && (
              <div className="space-y-6">
                {/* Book Info */}
                <section className="p-4 rounded-xl border border-[#ececec] bg-white relative">
                  <h2 className="text-sm font-semibold mb-2 flex items-center">
                    Book Information
                    <button
                      type="button"
                      className="ml-2 text-[#b0b3b8] hover:text-[#86868B]"
                      title={lockedSections.bookInfo ? "Unlock to edit" : "Lock section"}
                      onClick={() => setLockedSections(s => ({...s, bookInfo: !s.bookInfo }))}
                      tabIndex={0}
                    >
                      {lockedSections.bookInfo ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Title *</label>
                      <input
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-base bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.bookInfo ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="Enter book title..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={lockedSections.bookInfo}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Author *</label>
                      <input
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-base bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.bookInfo ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="Enter author name..."
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        disabled={lockedSections.bookInfo}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Description/Blurb</label>
                      <textarea
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.bookInfo ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="Enter book description..."
                        value={blurb}
                        onChange={e => setBlurb(e.target.value)}
                        rows={2}
                        disabled={lockedSections.bookInfo}
                      />
                    </div>
                  </div>
                </section>
                {/* Publishing Details */}
                <section className="p-4 rounded-xl border border-[#ececec] bg-white relative">
                  <h2 className="text-sm font-semibold mb-2 flex items-center">
                    Publishing Details
                    <button
                      type="button"
                      className="ml-2 text-[#b0b3b8] hover:text-[#86868B]"
                      title={lockedSections.publishing ? "Unlock to edit" : "Lock section"}
                      onClick={() => setLockedSections(s => ({...s, publishing: !s.publishing }))}
                      tabIndex={0}
                    >
                      {lockedSections.publishing ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Publisher</label>
                      <input
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.publishing ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="Enter publisher name..."
                        value={publisher}
                        onChange={e => setPublisher(e.target.value)}
                        disabled={lockedSections.publishing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Publication Date</label>
                      <input
                        type="date"
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.publishing ? "opacity-60 cursor-not-allowed" : ""}`}
                        value={pubDate}
                        onChange={(e) => setPubDate(e.target.value)}
                        disabled={lockedSections.publishing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">ISBN</label>
                      <input
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.publishing ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="978-0-000000-00-0"
                        value={isbn}
                        onChange={e => setIsbn(e.target.value)}
                        disabled={lockedSections.publishing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Language</label>
                      <select
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.publishing ? "opacity-60 cursor-not-allowed" : ""}`}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={lockedSections.publishing}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Genre</label>
                      <select
                        className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.publishing ? "opacity-60 cursor-not-allowed" : ""}`}
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        disabled={lockedSections.publishing}
                      >
                        <option value="">Select genre</option>
                        {GENRES.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>
                {/* Tags */}
                <section className="p-4 rounded-xl border border-[#ececec] bg-white relative">
                  <h2 className="text-sm font-semibold mb-2 flex items-center">
                    Tags & Keywords
                    <button
                      type="button"
                      className="ml-2 text-[#b0b3b8] hover:text-[#86868B]"
                      title={lockedSections.tags ? "Unlock to edit" : "Lock section"}
                      onClick={() => setLockedSections(s => ({...s, tags: !s.tags }))}
                      tabIndex={0}
                    >
                      {lockedSections.tags ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                  </h2>
                  <div className="flex gap-2">
                    <input
                      className={`w-full px-3 py-2 rounded-lg border border-[#ececec] text-sm bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal ${lockedSections.tags ? "opacity-60 cursor-not-allowed" : ""}`}
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      disabled={lockedSections.tags}
                    />
                    <button
                      className={`px-3 rounded-full bg-[#15161a] text-white font-semibold ${lockedSections.tags ? "opacity-60 cursor-not-allowed" : ""}`}
                      type="button"
                      onClick={handleAddTag}
                      disabled={lockedSections.tags}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#f4f4f5] text-xs px-2 py-1 rounded-full flex items-center border border-[#ececec]"
                      >
                        {tag}
                        <button
                          className="ml-1 text-[#86868B] focus:outline-none"
                          onClick={() => handleRemoveTag(tag)}
                          type="button"
                          disabled={lockedSections.tags}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
                {/* Cover Image */}
                <section className="p-4 rounded-xl border border-[#ececec] bg-white relative">
                  <h2 className="text-sm font-semibold mb-2 flex items-center">
                    Cover Image
                    <button
                      type="button"
                      className="ml-2 text-[#b0b3b8] hover:text-[#86868B]"
                      title={lockedSections.cover ? "Unlock to edit" : "Lock section"}
                      onClick={() => setLockedSections(s => ({...s, cover: !s.cover }))}
                      tabIndex={0}
                    >
                      {lockedSections.cover ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                  </h2>
                  <label
                    htmlFor="cover-upload"
                    className={`w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-[#ececec] rounded-xl bg-[#fafafd] text-[#86868B] cursor-pointer hover:bg-[#f4f4f5] transition ${lockedSections.cover ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                    style={{ minHeight: 120 }}
                  >
                    <UploadCloud className="w-7 h-7 mb-2" />
                    <span className="text-xs mb-1">Upload cover image</span>
                    <span className="text-[10px] mb-2">Recommended: 1600x2560px, JPG/PNG, 300dpi</span>
                    <input
                      type="file"
                      id="cover-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverChange}
                      disabled={lockedSections.cover}
                    />
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full bg-[#ececef] text-xs text-[#15161a] mt-2"
                      disabled={lockedSections.cover}
                    >
                      Choose File
                    </button>
                  </label>
                  {coverFile && (
                    <img
                      src={URL.createObjectURL(coverFile)}
                      alt="Book cover preview"
                      className="mt-2 rounded-xl shadow max-h-40 border border-[#ececec]"
                    />
                  )}
                </section>
              </div>
            )}

            {/* AI tab */}
            {tab === "ai" && (
              <div className="space-y-4">
                <section className="p-4 rounded-xl border border-[#ececec] bg-white">
                  <h2 className="text-sm font-semibold mb-4">AI Writing Assistant</h2>
                  <div className="mb-4 text-xs text-[#86868B]">
                    Get help with writing, editing, and brainstorming
                  </div>
                  <div className="space-y-3 mb-4">
                    <button className="w-full mb-2 px-3 py-2 rounded-full bg-[#15161a] text-white text-sm font-semibold hover:bg-[#23242a] flex items-center gap-2 justify-center shadow">
                      Plugin my favourite AI tool
                    </button>
                   <div className="mb-4 text-xs text-[#86868B]">
                    Requires an active subscription with ChatGPT, Grok etc.
                  </div>
                  </div>
                  
                </section>
              </div>
            )}

            {/* Preview Panel */}
            {tab === "preview" && (
              <div className="w-full max-w-xs mx-auto pt-2 pb-8">
                <h2 className="font-bold text-xl mb-5">Book Preview</h2>
                {/* Book Cover + Info */}
                <div className="w-full flex flex-col items-center mb-6">
                  <div className="w-56 h-80 rounded-xl bg-gradient-to-br from-[#f5f5f7] to-[#ececef] border border-[#ececec] shadow flex items-center justify-center overflow-hidden mb-3 relative">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Book cover" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <span className="font-bold text-2xl text-[#23242a]">{title || "Untitled Book"}</span>
                        <span className="text-[#86868B] mt-2">{author || "by Unknown Author"}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Statistics */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2 text-lg">Statistics</h3>
                  <div className="flex flex-col gap-1 text-base">
                    <div className="flex justify-between">
                      <span>Chapters</span>
                      <span>{chapters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Words</span>
                      <span>{totalWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Pages</span>
                      <span>{pageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Reading Time</span>
                      <span>{readingTime} min</span>
                    </div>
                  </div>
                </div>
                {/* Book Details */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2 text-lg">Book Details</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-[#23242a]" />
                    <span className="font-medium">Published:</span>
                    <span>{pubDate || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Languages className="w-5 h-5 text-[#23242a]" />
                    <span className="font-medium">Language:</span>
                    <span>{language ? language.slice(0, 2).toUpperCase() : "—"}</span>
                  </div>
                  {genre && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Genre:</span>
                      <span>{genre}</span>
                    </div>
                  )}
                  {tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Tags:</span>
                      {tags.map(tag => (
                        <span key={tag} className="bg-[#f4f4f5] rounded-full px-2 py-1 text-xs border border-[#ececec] text-[#86868B]">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Table of Contents */}
                <div>
                  <h3 className="font-bold mb-2 text-lg">Table of Contents</h3>
                  <ul className="flex flex-col gap-1 text-base">
                    {chapters.map((ch, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{ch.title || `Chapter ${i + 1}`}</span>
                        <span className="text-[#b0b3b8]">{ch.content.split(/\s+/).filter(Boolean).length} words</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>
        {/* Main Editor Panel */}
        <main className="flex-1 flex flex-col overflow-x-auto bg-white rounded-xl shadow-sm border border-[#ececec] px-8 py-8 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
            <div>
              {/* Editable Title */}
              <div className="flex items-center gap-2 group">
                {editingTitle ? (
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                    autoFocus
                    className="text-2xl font-bold border-b border-[#ececec] bg-white px-1"
                    disabled={lockedSections.bookInfo}
                  />
                ) : lockedSections.bookInfo ? (
                  <SimpleTooltip text="Unlock Book Information to edit">
                    <span
                      className="text-2xl font-bold text-[#b0b3b8] cursor-not-allowed"
                      tabIndex={-1}
                    >
                      {title || "Untitled Book"}
                    </span>
                  </SimpleTooltip>
                ) : (
                  <span
                    className={`text-2xl font-bold group-hover:bg-[#f4f4f5] rounded px-1 cursor-pointer flex items-center`}
                    onClick={() => setEditingTitle(true)}
                    tabIndex={0}
                  >
                    {title || "Untitled Book"}
                    <Pencil className="inline-block ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                )}
              </div>
              {/* Editable Author */}
              <div className="flex items-center gap-2 group">
                {editingAuthor ? (
                  <input
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    onBlur={() => setEditingAuthor(false)}
                    onKeyDown={e => e.key === "Enter" && setEditingAuthor(false)}
                    autoFocus
                    className="text-sm border-b border-[#ececec] bg-white px-1"
                    disabled={lockedSections.bookInfo}
                  />
                ) : lockedSections.bookInfo ? (
                  <SimpleTooltip text="Unlock Book Information to edit">
                    <span
                      className="text-sm text-[#b0b3b8] cursor-not-allowed"
                      tabIndex={-1}
                    >
                      by {author || "Unknown Author"}
                    </span>
                  </SimpleTooltip>
                ) : (
                  <span
                    className={`text-sm text-[#86868B] group-hover:bg-[#f4f4f5] rounded px-1 cursor-pointer flex items-center`}
                    onClick={() => setEditingAuthor(true)}
                    title="Edit author"
                    tabIndex={0}
                  >
                    by {author || "Unknown Author"}
                    <Pencil className="inline-block ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-4 mb-4">
            <div className="flex flex-col w-40 sm:w-60 min-w-[140px] sm:min-w-[220px] max-w-[260px]">
              <button
                className="w-full mb-2 px-3 py-2 rounded-full bg-[#15161a] text-white text-sm font-semibold hover:bg-[#23242a] flex items-center gap-2 justify-center shadow"
                onClick={handleAddChapter}
                aria-label="Add Chapter"
              >
                <Plus className="w-4 h-4" />
                <span>Add Chapter</span>
              </button>
              <div className="flex flex-col gap-2">
                {chapters.map((ch, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer group transition select-none border border-[#ececec]
                      ${selectedChapter === i ? "bg-[#15161a] text-white shadow" : "bg-[#f4f4f5] text-[#15161a]"}
                    `}
                    data-chapter-idx={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnter={() => handleDragEnter(i)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    onTouchStart={e => handleTouchStart(i, e)}
                    onTouchMove={e => handleTouchMove(i, e)}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => handleSelectChapter(i)}
                    style={{ touchAction: "none" }}
                  >
                    <span className="flex items-center">
                      <GripVertical className="w-4 h-4 mr-2 opacity-70 cursor-grab" />
                      <span className="font-medium">
                        {ch.title ? ch.title : `Chapter ${i + 1}`}
                      </span>
                    </span>
                    <span className="ml-auto text-xs opacity-60">{ch.content.length} characters</span>
                    {chapters.length > 1 && (
                      <button
                        className="ml-1 text-xs text-[#86868B] opacity-0 group-hover:opacity-100 transition"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveChapter(i);
                        }}
                        aria-label="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Main Editor */}
            <section className="flex-1 flex flex-col min-w-0">
              <div className="w-full flex flex-col">
                {/* Editable Chapter Title */}
                <input
                  className="w-full mb-2 px-3 py-2 rounded-lg border border-[#ececec] text-base bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal"
                  placeholder="Enter the chapter title..."
                  value={chapters[selectedChapter]?.title ?? ""}
                  onChange={e => handleChapterTitleChange(selectedChapter, e.target.value)}
                />
                <textarea
                  className="w-full px-3 py-4 rounded-lg border border-[#ececec] text-base min-h-[300px] bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] transition-colors"
                  placeholder={
                    selectedChapter === 0
                      ? "Start writing your first chapter here..."
                      : "Start writing your chapter here..."
                  }
                  value={chapters[selectedChapter]?.content}
                  onChange={e => handleChapterContentChange(selectedChapter, e.target.value)}
                />
                <div className="mt-1 text-xs text-[#86868B] flex justify-end">
                  Words: {chapters[selectedChapter]?.content.split(/\s+/).filter(Boolean).length || 0} | Characters: {chapters[selectedChapter]?.content.length || 0}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}