import React from "react";
import { Lock, Unlock, UploadCloud } from "lucide-react";
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
    <div className="space-y-6">
      {/* Book Info */}
      <section className="p-4 rounded-xl border border-[#ececec] bg-white relative">
        <h2 className="text-sm font-semibold mb-2 flex items-center">
          Book Information
          <button
            type="button"
            className="ml-2 text-[#b0b3b8] hover:text-[#86868B]"
            title={lockedSections.bookInfo ? "Unlock to edit" : "Lock section"}
            onClick={() => setLockedSections((s: any) => ({ ...s, bookInfo: !s.bookInfo }))}
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
            onClick={() => setLockedSections((s: any) => ({ ...s, publishing: !s.publishing }))}
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
            onClick={() => setLockedSections((s: any) => ({ ...s, tags: !s.tags }))}
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
          {tags.map((tag: string) => (
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
            onClick={() => setLockedSections((s: any) => ({ ...s, cover: !s.cover }))}
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
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Book cover preview"
            className="mt-2 rounded-xl shadow max-h-40 border border-[#ececec]"
          />
        )}
      </section>
    </div>
  );
}