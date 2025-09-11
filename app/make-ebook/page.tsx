"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, UploadCloud, ChevronLeft, Trash2, GripVertical, Lock, Unlock, Pencil, Calendar, Languages, Menu
} from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import { SignInButton } from "../../components/SignInButton.DISABLED";
import { SignOutButton } from "../../components/SignOutButton.DISABLED";
import SimpleTooltip from "./components/SimpleTooltip";
import { LANGUAGES, GENRES, today } from "./utils/constants";
import MetaTabContent from "./components/MetaTabContent";
import PreviewPanel from "./components/PreviewPanel";
import AiTabContent from "./components/AiTabContent";
import ChapterEditor from "./components/ChapterEditor";
import { app } from "./firebase.DISABLED";
// Custom hooks and utilities
import { useChapters } from "./hooks/useChapters";
import { useTags } from "./hooks/useTags";
import { useCover } from "./hooks/useCover";
import { useLockedSections } from "./hooks/useLockedSections";
import { exportEpub } from "./utils/exportEpub";

export default function MakeEbookPage() {
  // Auth
  const { user, loading } = useAuth();

  // Custom hooks
  const {
    lockedSections,
    setLockedSections,
    toggleSection,
  } = useLockedSections();

  const {
    coverFile,
    setCoverFile,
    handleCoverChange,
    coverUrl,
  } = useCover();

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
    tags,
    setTags,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
  } = useTags();

  // Local state
  const [tab, setTab] = useState<"setup" | "ai" | "preview">("setup");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pubDate, setPubDate] = useState(today);
  const [isbn, setIsbn] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [genre, setGenre] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  async function handleExportEPUB() {
    await exportEpubs({
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4 text-lg font-semibold">Sign in to use makeEbook</div>
        <SignInButton />
      </div>
    );
  }

  const totalWords = chapters.reduce(
    (sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const pageCount = Math.max(1, Math.ceil(totalWords / 300));
  const readingTime = Math.max(1, Math.round(totalWords / 200));

  return (
    <div className="flex flex-col min-h-screen h-screen bg-[#f7f9fa] text-[#15161a]">
      {/* Top Beta Banner */}
      <div className="w-full bg-gradient-to-r from-[#f4f4f5] to-[#eaeaec] border-b border-[#ececec] p-2 text-center flex items-center justify-center relative">
        <span className="text-xs text-[#86868B] font-medium">
          🚧 This page is under active development. <b>Coming as a public beta Autumn 2025.</b>
        </span>
      </div>
      {/* Mobile Topbar */}
      <div className="flex items-center justify-between sm:hidden px-4 py-2 bg-white border-b border-[#ececec]">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Show menu"
          className="p-2"
        >
          <Menu className="w-7 h-7" />
        </button>
        <span className="font-bold text-lg flex items-center gap-2">
          <Image src="/caveman.svg" alt="makeEbook logo" width={28} height={28} />
          makeEbook
        </span>
        <div style={{ width: 40 }} /> {/* right spacer */}
      </div>
      {/* Desktop Header */}
      <header className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-8 py-4 sm:py-6 border-b border-[#ececec] bg-white rounded-b-xl shadow-sm relative gap-2">
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
        {/* You can place SignOutButton here if you want */}
        <div>
          <SignOutButton />
        </div>
        <button
          className="w-full sm:w-auto px-6 py-2 rounded-full bg-[#15161a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#23242a] transition text-base shadow"
          onClick={handleExportEPUB}
        >
          Export EPUB
        </button>
      </header>
      {/* Mobile Export button */}
      <button
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 sm:hidden px-10 py-4 rounded-full bg-[#15161a] text-white text-lg font-bold shadow-lg"
        onClick={handleExportEPUB}
        style={{ minWidth: 220 }}
      >
        Export EPUB
      </button>
      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex sm:hidden">
          <div className="bg-white w-4/5 max-w-xs h-full shadow-xl p-4 flex flex-col overflow-y-auto relative">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="mb-4 self-end"
              aria-label="Close menu"
            >
              <span className="text-2xl">&times;</span>
            </button>
            {/* Mobile Tabs */}
            <nav className="flex flex-row border-b border-[#ececec] items-center gap-2 pb-2 mb-4">
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
            <div>
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
          </div>
          <div
            className="flex-1 bg-black/20"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}
      {/* Main layout */}
      <div className="flex flex-1 min-h-0 h-0">
        {/* Left Sidebar (Desktop only) */}
        <aside className="hidden sm:flex w-full sm:max-w-xs border border-[#ececec] rounded-xl bg-white min-w-0 sm:min-w-[340px] h-full overflow-y-auto shadow-sm p-4 flex-col gap-4">
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
        <main className="flex-1 flex flex-col overflow-x-auto bg-white rounded-xl shadow-sm border border-[#ececec] px-2 sm:px-8 py-4 sm:py-8 min-w-0">
          {/* --- Mobile: Stacked with horizontal chapter tabs and delete button --- */}
          <div className="sm:hidden flex flex-col gap-2">
            {/* Add Chapter Button */}
            <button
              className="mb-2 px-3 py-2 rounded-full bg-[#15161a] text-white text-sm font-semibold hover:bg-[#23242a] flex items-center gap-2 justify-center shadow"
              onClick={handleAddChapter}
              aria-label="Add Chapter"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter</span>
            </button>
            {/* Horizontal chapter tabs with delete button on selected tab */}
            <div className="flex flex-col gap-2 pb-2">
              {chapters.map((ch, i) => {
                const isSelected = selectedChapter === i;
                return (
                  <div
                    key={i}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition select-none border border-[#ececec]
                      ${isSelected ? "bg-[#15161a] text-white shadow" : "bg-[#f4f4f5] text-[#15161a]"}
                    `}
                    onClick={() => handleSelectChapter(i)}
                    style={{ minHeight: 56 }}
                  >
                    {/* Drag Handle */}
                    <span className="flex items-center mr-2 opacity-70">
                      <GripVertical className="w-4 h-4" />
                    </span>
                    {/* Chapter Title */}
                    <span className="font-bold text-lg flex-1 truncate">
                      {ch.title ? ch.title : `Chapter ${i + 1}`}
                    </span>
                    {/* Character Count */}
                    <span className={`ml-2 text-base opacity-60 whitespace-nowrap ${isSelected ? "text-[#d1d1d1]" : "text-[#86868B]"}`}>
                      {typeof ch.content === "string" ? `${ch.content.length} characters` : "0 characters"}
                    </span>
                    {/* Delete Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveChapter(i);
                      }}
                      className="ml-2 p-1 rounded text-[#86868B] opacity-80 hover:opacity-100 transition"
                      tabIndex={-1}
                      aria-label="Delete Chapter"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Chapter Title Input */}
            <input
              className="w-full mb-2 px-3 py-2 rounded-lg border border-[#ececec] text-base bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] placeholder:font-normal"
              placeholder="Enter the chapter title..."
              value={chapters[selectedChapter]?.title ?? ""}
              onChange={e => handleChapterTitleChange(selectedChapter, e.target.value)}
            />
            {/* Writing Area */}
            <textarea
              className="w-full flex-1 px-3 py-4 rounded-lg border border-[#ececec] text-base min-h-[220px] bg-[#fafbfc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e6e6e6] placeholder:text-[#b0b3b8] transition-colors"
              placeholder={
                selectedChapter === 0
                  ? "Start writing your first chapter here..."
                  : "Start writing your chapter here..."
              }
              value={chapters[selectedChapter]?.content}
              onChange={e => handleChapterContentChange(selectedChapter, e.target.value)}
              style={{ minHeight: 180 }}
            />
            <div className="mt-1 text-xs text-[#86868B] flex justify-end">
              Words: {chapters[selectedChapter]?.content.split(/\s+/).filter(Boolean).length || 0} | Characters: {chapters[selectedChapter]?.content.length || 0}
            </div>
          </div>
          {/* --- Desktop: Columns layout --- */}
          <div className="hidden sm:flex flex-row gap-4 mb-4">
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
                    <span className="flex-1 min-w-0 flex items-center">
                      <GripVertical className="w-4 h-4 mr-2 opacity-70 cursor-grab" />
                      <span className="font-bold truncate block">
                        {ch.title ? ch.title : `Chapter ${i + 1}`}
                      </span>
                    </span>
                    <span className="ml-2 text-xs opacity-60 whitespace-nowrap">{ch.content.length} characters</span>
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