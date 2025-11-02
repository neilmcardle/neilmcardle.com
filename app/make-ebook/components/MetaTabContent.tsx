import React, { useRef } from "react";
import { Edit2 } from "lucide-react";
import { LockIcon, UnlockIcon, PlusIcon, UploadIcon } from "./icons";
import { LANGUAGES, GENRES } from "../utils/constants";

interface MetaTabContentProps {
  title: string;
  setTitle: (v: string) => void;
  author: string;
  setAuthor: (v: string) => void;
  blurb: string;
  setBlurb: (v: string) => void;
  publisher: string;
  setPublisher: (v: string) => void;
  pubDate: string;
  setPubDate: (v: string) => void;
  isbn: string;
  setIsbn: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  coverFile: File | null;
  setCoverFile: (f: File | null) => void;
  lockedSections: any;
  setLockedSections: (s: any) => void;
  handleAddTag: () => void;
  handleRemoveTag: (t: string) => void;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calendarIcon?: React.ReactNode;
  chevronIcon?: React.ReactNode;
  cornerExpandIcon?: React.ReactNode;
}

export default function MetaTabContent({
  title, setTitle,
  author, setAuthor,
  blurb, setBlurb,
  publisher, setPublisher,
  pubDate, setPubDate,
  isbn, setIsbn,
  language, setLanguage,
  genre, setGenre,
  tags, setTags,
  tagInput, setTagInput,
  coverFile, setCoverFile,
  lockedSections, setLockedSections,
  handleAddTag,
  handleRemoveTag,
  handleCoverChange,
  calendarIcon,
  chevronIcon,
  cornerExpandIcon,
}: MetaTabContentProps) {
  // Memoize and cleanup cover preview url
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (coverFile instanceof File) {
      const url = URL.createObjectURL(coverFile);
      setCoverUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverUrl(null);
    }
  }, [coverFile]);

  return (
    <div className="space-y-3 pb-8">
      {/* Cover Image */}
      <section className="p-4 rounded bg-white dark:bg-[#1a1a1a] relative">
        <h2 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
          Cover Image
          <button
            type="button"
            className="ml-2 text-[#050505] dark:text-[#e5e5e5] hover:text-[#050505] dark:hover:text-[#e5e5e5] focus:outline-none"
            title={lockedSections.cover ? "Unlock to edit" : "Lock section"}
            onClick={() => setLockedSections((s: any) => ({ ...s, cover: !s.cover }))}
            tabIndex={0}
          >
            {lockedSections.cover ? <LockIcon className="w-4 h-4" /> : <UnlockIcon className="w-4 h-4" />}
          </button>
        </h2>
        {!coverUrl ? (
          <label
            htmlFor="cover-upload"
            className={`w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-[#E8E8E8] dark:border-gray-700 rounded bg-white dark:bg-[#1a1a1a] text-[#737373] dark:text-gray-400 cursor-pointer hover:bg-[#F9F9F9] dark:hover:bg-[#2a2a2a] transition ${lockedSections.cover ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
            style={{ minHeight: 120 }}
          >
            <UploadIcon className="w-5 h-5 mb-2" />
            <span className="text-xs mb-1">Upload cover image</span>
            <span className="text-[10px] mb-2">Recommended: 1600x2560px, JPG/PNG, 300dpi</span>
            <button
              type="button"
              className="px-3 py-1 rounded bg-[#ececef] dark:bg-[#2a2a2a] text-xs text-[#15161a] dark:text-[#e5e5e5] mt-2"
              disabled={lockedSections.cover}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('cover-upload')?.click();
              }}
            >
              Choose File
            </button>
          </label>
        ) : (
          <div className="relative">
            <img
              src={coverUrl}
              alt="Book cover preview"
              className="mt-2 rounded shadow max-h-40 w-auto mx-auto"
            />
            <button
              type="button"
              className="absolute bottom-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 p-2 rounded-full shadow-md transition-all duration-200 flex items-center justify-center"
              style={{ right: '40px' }}
              onClick={() => document.getElementById('cover-upload')?.click()}
              disabled={lockedSections.cover}
              title="Edit cover image"
            >
              <Edit2 className="w-4 h-4 text-[#15161a] dark:text-[#e5e5e5]" />
            </button>
          </div>
        )}
        
        <input
          type="file"
          id="cover-upload"
          className="hidden"
          accept="image/*"
          onChange={handleCoverChange}
          disabled={lockedSections.cover}
        />
        {/* New Feature: Offer cover design if no cover uploaded */}
        {!coverUrl && (
          <div className="flex items-center mt-4">
            <img
              alt="Neil McArdle"
              width={22}
              height={22}
              decoding="async"
              data-nimg="1"
              className="rounded-full object-cover w-[22px] h-[22px] border-none p-0"
              style={{ color: "transparent" }}
              src="/neil-avatar.png"
            />
            <span className="text-xs text-[#15161a] dark:text-[#e5e5e5] ml-2">
              Did you know Neil is a published book cover designer? Let him design yours.{' '}
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1da1f2] underline"
              >
                Get in touch on X
              </a>
              .
            </span>
          </div>
        )}

      </section>
      
      {/* Book Info */}
      <section className="p-4 rounded bg-white dark:bg-[#1a1a1a] relative">
        <h2 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
          Book Information
          <button
            type="button"
            className="ml-2 text-[#050505] dark:text-[#e5e5e5] hover:text-[#050505] dark:hover:text-[#e5e5e5] focus:outline-none"
            title={lockedSections.bookInfo ? "Unlock to edit" : "Lock section"}
            onClick={() => setLockedSections((s: any) => ({ ...s, bookInfo: !s.bookInfo }))}
            tabIndex={0}
          >
            {lockedSections.bookInfo ? <LockIcon className="w-4 h-4" /> : <UnlockIcon className="w-4 h-4" />}
          </button>
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Title *</label>
            <input
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] dark:placeholder:text-[#666666] placeholder:text-sm ${lockedSections.bookInfo ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="Enter book title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={lockedSections.bookInfo}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Author *</label>
            <input
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] dark:placeholder:text-[#666666] placeholder:text-sm ${lockedSections.bookInfo ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="Enter author name..."
              value={author}
              onChange={e => setAuthor(e.target.value)}
              disabled={lockedSections.bookInfo}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Description/Blurb</label>
            <textarea
              className={`w-full px-3 py-2 rounded text-sm bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] dark:placeholder:text-[#666666] placeholder:text-sm ${lockedSections.bookInfo ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="Enter book description..."
              value={blurb}
              onChange={e => setBlurb(e.target.value)}
              rows={2}
              disabled={lockedSections.bookInfo}
            />
          </div>
        </div>
      </section>
      
      {/* Publishing details */}
      <section className="p-4 rounded bg-white dark:bg-[#1a1a1a] relative">
        <h2 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
          Publishing Details
          <button
            type="button"
            className="ml-2 text-[#050505] dark:text-[#e5e5e5] hover:text-[#050505] dark:hover:text-[#e5e5e5] focus:outline-none"
            title={lockedSections.publishingDetails ? "Unlock to edit" : "Lock section"}
            onClick={() => setLockedSections((s: any) => ({ ...s, publishingDetails: !s.publishingDetails }))}
            tabIndex={0}
          >
            {lockedSections.publishingDetails ? <LockIcon className="w-4 h-4" /> : <UnlockIcon className="w-4 h-4" />}
          </button>
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Publisher</label>
            <input
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] dark:placeholder:text-[#666666] placeholder:text-sm ${lockedSections.publishingDetails ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="Enter publisher name..."
              value={publisher}
              onChange={e => setPublisher(e.target.value)}
              disabled={lockedSections.publishingDetails}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Publication Date</label>
            <input
              type="date"
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 ${lockedSections.publishingDetails ? "opacity-60 cursor-not-allowed" : ""}`}
              value={pubDate}
              onChange={e => setPubDate(e.target.value)}
              disabled={lockedSections.publishingDetails}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">ISBN</label>
            <input
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] dark:placeholder:text-[#666666] placeholder:text-sm ${lockedSections.publishingDetails ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="Enter ISBN..."
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
              disabled={lockedSections.publishingDetails}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Language</label>
            <select
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 ${lockedSections.publishingDetails ? "opacity-60 cursor-not-allowed" : ""}`}
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={lockedSections.publishingDetails}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">Genre</label>
            <select
              className={`w-full px-3 py-2 rounded text-base bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 ${lockedSections.publishingDetails ? "opacity-60 cursor-not-allowed" : ""}`}
              value={genre}
              onChange={e => setGenre(e.target.value)}
              disabled={lockedSections.publishingDetails}
            >
              <option value="">Select a genre...</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="biography">Biography</option>
              <option value="science-fiction">Science Fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </section>
      {/* Tags */}
      <section className="p-4 rounded bg-white dark:bg-[#1a1a1a] relative">
        <h2 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
          Tags & Keywords
          <button
            type="button"
            className="ml-2 text-[#050505] dark:text-[#e5e5e5] hover:text-[#050505] dark:hover:text-[#e5e5e5] focus:outline-none"
            title={lockedSections.tags ? "Unlock to edit" : "Lock section"}
            onClick={() => setLockedSections((s: any) => ({ ...s, tags: !s.tags }))}
            tabIndex={0}
          >
            {lockedSections.tags ? <LockIcon className="w-4 h-4" /> : <UnlockIcon className="w-4 h-4" />}
          </button>
        </h2>
        <div className="flex gap-2">
          <input
            className={`w-full px-3 py-2 rounded text-sm bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-transparent focus:border-black dark:focus:border-white focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0] dark:placeholder:text-[#666666] placeholder:text-sm ${lockedSections.tags ? "opacity-60 cursor-not-allowed" : ""}`}
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            disabled={lockedSections.tags}
          />
          <button
            className={`w-8 h-8 rounded border transition-colors touch-manipulation flex items-center justify-center overflow-visible bg-white dark:bg-[#2a2a2a] text-[#6a6c72] dark:text-[#e5e5e5] border-[#E8E8E8] dark:border-gray-700 hover:bg-[#F7F7F7] dark:hover:bg-[#3a3a3a] ${lockedSections.tags ? "opacity-60 cursor-not-allowed" : ""}`}
            type="button"
            onClick={handleAddTag}
            disabled={lockedSections.tags}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="bg-[#F7F7F7] dark:bg-[#2a2a2a] text-gray-900 dark:text-[#e5e5e5] text-xs px-2 py-1 rounded flex items-center"
            >
              {tag}
              <button
                className="ml-1 text-[#86868B] dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
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
    </div>
  );
}
