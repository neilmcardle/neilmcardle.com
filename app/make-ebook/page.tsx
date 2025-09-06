"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, UploadCloud, ChevronLeft, Trash2 } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Chinese"];
const GENRES = ["Fiction", "Non-fiction", "Romance", "Sci-fi", "Fantasy", "Memoir"];

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
  const [chapters, setChapters] = useState([{ title: "Chapter 1", content: "" }]);
  const [selectedChapter, setSelectedChapter] = useState(0);

  // Handlers
  function handleAddChapter() {
    setChapters((chs) => [
      ...chs,
      { title: `Chapter ${chs.length + 1}`, content: "" },
    ]);
    setSelectedChapter(chapters.length);
  }

  function handleSelectChapter(idx: number) {
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

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] text-[#15161a]">
      {/* Top Banner for Beta Notice */}
      <div className="w-full bg-gradient-to-r from-[#f4f4f5] to-[#eaeaec] border-b p-2 text-center flex items-center justify-center relative">
        <span className="text-xs text-[#86868B] font-medium">
          🚧 This page is under active development. <b>Coming as a public beta Autumn 2025.</b>
        </span>
      </div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-8 py-4 sm:py-6 border-b bg-white relative gap-2">
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
          className="w-full sm:w-auto px-4 py-2 rounded bg-[#15161a] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#23242a] transition"
        >
          Export EPUB
        </button>
      </header>
      {/* Main layout */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0">
        {/* Left Sidebar */}
        <aside className="w-full sm:max-w-xs border-r flex flex-col bg-white min-w-0 sm:min-w-[320px]">
          {/* Tabs */}
          <nav className="flex border-b sm:flex-col sm:border-b-0 sm:border-r items-center sm:items-start justify-between gap-2 px-2 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <button
              className={`flex-1 sm:flex-none rounded px-4 py-2 text-sm font-medium transition ${
                tab === "setup"
                  ? "bg-[#f4f4f5] text-[#15161a]"
                  : "hover:bg-[#f4f4f5] text-[#86868B]"
              }`}
              onClick={() => setTab("setup")}
            >
              Setup
            </button>
            <button
              className={`flex-1 sm:flex-none rounded px-4 py-2 text-sm font-medium transition ${
                tab === "ai"
                  ? "bg-[#f4f4f5] text-[#15161a]"
                  : "hover:bg-[#f4f4f5] text-[#86868B]"
              }`}
              onClick={() => setTab("ai")}
            >
              AI Chat
            </button>
            <button
              className={`flex-1 sm:flex-none rounded px-4 py-2 text-sm font-medium transition ${
                tab === "preview"
                  ? "bg-[#f4f4f5] text-[#15161a]"
                  : "hover:bg-[#f4f4f5] text-[#86868B]"
              }`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-6 pb-6">
            {tab === "setup" && (
              <div className="space-y-6">
                {/* Book Info */}
                <section>
                  <h2 className="text-sm font-semibold mb-2">Book Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Title *</label>
                      <input
                        className="w-full px-3 py-2 rounded border text-sm"
                        placeholder="Enter book title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Author *</label>
                      <input
                        className="w-full px-3 py-2 rounded border text-sm"
                        placeholder="Enter author name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Description/Blurb</label>
                      <textarea
                        className="w-full px-3 py-2 rounded border text-sm"
                        placeholder="Enter book description..."
                        value={blurb}
                        onChange={(e) => setBlurb(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </section>
                {/* Publishing Details */}
                <section>
                  <h2 className="text-sm font-semibold mb-2">Publishing Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Publisher</label>
                      <input
                        className="w-full px-3 py-2 rounded border text-sm"
                        placeholder="Enter publisher name"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Publication Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 rounded border text-sm"
                        value={pubDate}
                        onChange={(e) => setPubDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">ISBN</label>
                      <input
                        className="w-full px-3 py-2 rounded border text-sm"
                        placeholder="978-0-000000-00-0"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Language</label>
                      <select
                        className="w-full px-3 py-2 rounded border text-sm"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Genre</label>
                      <select
                        className="w-full px-3 py-2 rounded border text-sm"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
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
                <section>
                  <h2 className="text-sm font-semibold mb-2">Tags & Keywords</h2>
                  <div className="flex gap-2">
                    <input
                      className="w-full px-3 py-2 rounded border text-sm"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      className="px-3 rounded bg-[#15161a] text-white"
                      type="button"
                      onClick={handleAddTag}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#f4f4f5] text-xs px-2 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          className="ml-1 text-[#86868B]"
                          onClick={() => handleRemoveTag(tag)}
                          type="button"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
                {/* Cover Image */}
                <section>
                  <h2 className="text-sm font-semibold mb-2">Cover Image</h2>
                  <label
                    htmlFor="cover-upload"
                    className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg bg-[#fafafd] text-[#86868B] cursor-pointer hover:bg-[#f4f4f5] transition"
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
                    />
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-[#ececef] text-xs text-[#15161a] mt-2"
                    >
                      Choose File
                    </button>
                  </label>
                  {coverFile && (
                    <img
                      src={URL.createObjectURL(coverFile)}
                      alt="Book cover preview"
                      className="mt-2 rounded shadow max-h-40"
                    />
                  )}
                </section>
              </div>
            )}

            {tab === "ai" && (
              <div>
                <h2 className="text-sm font-semibold mb-4">AI Writing Assistant</h2>
                <div className="mb-4 text-xs text-[#86868B]">
                  Get help with writing, editing, and brainstorming
                </div>
                <div className="space-y-3 mb-4">
                  <button className="w-full text-left px-4 py-2 bg-[#f4f4f5] rounded hover:bg-[#ececef] text-sm font-medium">
                    Help me brainstorm ideas for my book
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-[#f4f4f5] rounded hover:bg-[#ececef] text-sm font-medium">
                    Improve the structure of my chapters
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-[#f4f4f5] rounded hover:bg-[#ececef] text-sm font-medium">
                    Write an engaging opening paragraph
                  </button>
                </div>
                <div className="p-3 bg-[#f4f4f5] rounded">
                  <div className="text-xs text-[#15161a] mb-2 font-medium">
                    Hello! I’m your AI writing assistant. I can help you with:
                  </div>
                  <ul className="text-xs text-[#15161a] list-disc pl-4 mb-2">
                    <li>Brainstorming ideas and plot development</li>
                    <li>Writing and editing content</li>
                    <li>Improving chapter structure</li>
                    <li>Creating compelling descriptions</li>
                    <li>Suggesting titles and keywords</li>
                  </ul>
                  <div className="text-xs text-[#86868B]">What would you like to work on today?</div>
                  <div className="text-[10px] text-[#86868B] mt-2">23:20:33</div>
                </div>
              </div>
            )}

            {tab === "preview" && (
              <div className="space-y-4">
                <section>
                  <h2 className="text-sm font-semibold mb-2">Book Preview</h2>
                  <div className="aspect-[3/4] w-full max-w-[160px] bg-gradient-to-br from-[#f4f4f5] to-[#ececef] flex flex-col items-center justify-center rounded shadow mb-2">
                    <span className="text-base font-bold">{title || "Untitled Book"}</span>
                    <span className="text-xs text-[#86868B]">by {author || "Unknown Author"}</span>
                  </div>
                </section>
                <section>
                  <h2 className="text-sm font-semibold mb-2">Statistics</h2>
                  <div className="grid grid-cols-2 text-xs gap-y-1">
                    <span>Chapters</span>
                    <span className="text-right">{chapters.length}</span>
                    <span>Total Words</span>
                    <span className="text-right">
                      {chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0)}
                    </span>
                    <span>Est. Pages</span>
                    <span className="text-right">
                      {Math.max(1, Math.ceil(chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0) / 300))}
                    </span>
                    <span>Est. Reading Time</span>
                    <span className="text-right">
                      {Math.max(1, Math.ceil(chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0) / 200))} min
                    </span>
                  </div>
                </section>
                <section>
                  <h2 className="text-sm font-semibold mb-2">Book Details</h2>
                  <div className="text-xs">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="material-icons text-base">event</span>
                      <span>Published: {pubDate}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="material-icons text-base">language</span>
                      <span>Language: {language.slice(0,2).toUpperCase()}</span>
                    </div>
                  </div>
                </section>
                <section>
                  <h2 className="text-sm font-semibold mb-2">Table of Contents</h2>
                  <div className="text-xs">
                    {chapters.map((ch, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{ch.title || `Chapter ${i + 1}`}</span>
                        <span>{ch.content.split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </aside>

        {/* Main Editor Panel */}
        <main className="flex-1 flex flex-col overflow-x-auto px-2 sm:px-6 py-6 sm:py-8 bg-[#fcfcfd] min-w-0">
          {/* Title + Author */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
            <div>
              <h1 className="text-2xl font-bold">{title || "Untitled Book"}</h1>
              <span className="text-sm text-[#86868B]">by {author || "Unknown Author"}</span>
            </div>
          </div>
          {/* Chapter Tabs */}
          <div className="flex flex-row gap-2 mb-2 overflow-x-auto">
            <div className="flex gap-1">
              <span className="font-medium mr-2 pt-1">Chapters</span>
              <button
                className="px-3 py-1 rounded bg-[#15161a] text-white text-sm font-medium hover:bg-[#23242a] flex items-center gap-2"
                onClick={handleAddChapter}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Add Chapter</span>
              </button>
            </div>
            <div className="flex-1 flex gap-1 overflow-x-auto hide-scrollbar">
              {chapters.map((ch, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded-t bg-white border-t border-l border-r border-b-0 font-medium text-sm transition ${
                    selectedChapter === i ? "bg-[#fcfcfd] border-b-2 border-[#fcfcfd]" : "border-[#ececef] text-[#86868B]"
                  }`}
                  onClick={() => handleSelectChapter(i)}
                  style={{ minWidth: 120 }}
                >
                  {ch.title || `Chapter ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
          {/* Editor row: chapter list and editor */}
          <div className="flex flex-1 min-h-0 gap-2">
            {/* Chapter List */}
            <div className="w-40 sm:w-60 min-w-[120px] sm:min-w-[220px] max-w-[260px] flex flex-col gap-2 pt-2">
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-4 py-3 rounded cursor-pointer group transition ${
                    selectedChapter === i ? "bg-[#15161a] text-white" : "bg-[#f4f4f5] text-[#15161a]"
                  }`}
                  onClick={() => handleSelectChapter(i)}
                >
                  <span className="font-medium">{ch.title || `Chapter ${i + 1}`}</span>
                  <span className="ml-auto text-xs opacity-60">{ch.content.length} characters</span>
                  {chapters.length > 1 && (
                    <button className="ml-1 text-xs text-[#86868B] opacity-0 group-hover:opacity-100 transition" onClick={(e) => {e.stopPropagation(); handleRemoveChapter(i);}}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Main Editor */}
            <section className="flex-1 flex flex-col min-w-0">
              <div className="w-full flex flex-col">
                {/* Editable Chapter Title */}
                <input
                  className="w-full mb-2 px-2 py-1 rounded border text-base font-semibold"
                  placeholder={`Chapter ${selectedChapter + 1} Title`}
                  value={chapters[selectedChapter]?.title}
                  onChange={e => handleChapterTitleChange(selectedChapter, e.target.value)}
                />
                <div className="bg-[#f4f4f5] rounded p-4 flex-1 min-h-[400px]">
                  <textarea
                    className="w-full h-full resize-none border-none bg-transparent focus:outline-none text-base min-h-[300px]"
                    placeholder="Start writing your first chapter here..."
                    value={chapters[selectedChapter]?.content}
                    onChange={e => handleChapterContentChange(selectedChapter, e.target.value)}
                  />
                </div>
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