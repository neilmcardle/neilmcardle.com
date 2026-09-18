"use client";

import React, { useState } from "react";
import { PlusIcon } from "../icons";
import GenerateCoverModal from "./GenerateCoverModal";

interface BookDetailsPanelProps {
  title: string;
  setTitle: (value: string) => void;
  author: string;
  setAuthor: (value: string) => void;
  blurb: string;
  setBlurb: (value: string) => void;
  publisher: string;
  setPublisher: (value: string) => void;
  pubDate: string;
  setPubDate: (value: string) => void;
  isbn: string;
  setIsbn: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  genre: string;
  setGenre: (value: string) => void;
  tags: string[];
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  coverFile: string | null;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCoverFile?: (dataUrl: string) => void;
  lockedSections: {
    bookInfo: boolean;
    publishing: boolean;
    tags: boolean;
    cover: boolean;
  };
}

const LANGUAGES = [
  "en - English",
  "es - Spanish",
  "fr - French",
  "de - German",
  "it - Italian",
  "pt - Portuguese",
  "ru - Russian",
  "ja - Japanese",
  "zh - Chinese",
  "ar - Arabic",
];

export default function BookDetailsPanel({
  title,
  setTitle,
  author,
  setAuthor,
  blurb,
  setBlurb,
  publisher,
  setPublisher,
  pubDate,
  setPubDate,
  isbn,
  setIsbn,
  language,
  setLanguage,
  genre,
  setGenre,
  tags,
  handleAddTag,
  handleRemoveTag,
  tagInput,
  setTagInput,
  coverFile,
  handleCoverChange,
  setCoverFile,
  lockedSections,
}: BookDetailsPanelProps) {
  const [generateOpen, setGenerateOpen] = useState(false);
  return (
    <div
      data-tour="book-details"
      className="border-b border-gray-200 dark:border-[var(--rule)] pb-3"
    >
      <div className="flex items-center gap-2 py-3 px-3">
        <svg
          className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-[var(--clay-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <span className="text-125 font-semibold text-gray-900 dark:text-[var(--paper)]">
            Book
          </span>
          {title && (
            <span className="text-11 text-gray-500 dark:text-[var(--clay-muted)] truncate">
              {title}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 px-3 py-2">
        <div>
          <label
            htmlFor="bd-cover-image"
            className="block text-11 font-medium text-gray-600 dark:text-[var(--clay-muted)] mb-2"
          >
            Cover Image
          </label>
          <div className="w-full aspect-[2/3] max-h-52 bg-gray-50 dark:bg-[var(--ink-raised)] rounded-card border border-gray-200 dark:border-[var(--rule)] overflow-hidden flex items-center justify-center mb-2">
            {coverFile ? (
              <img
                src={coverFile}
                alt="Cover"
                className="w-full h-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
              />
            ) : (
              <img
                src="/image-icon.svg"
                alt=""
                className="w-8 h-8 opacity-30 dark:opacity-20"
              />
            )}
          </div>
          <input
            id="bd-cover-image"
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            disabled={lockedSections.cover}
            className="w-full text-12 text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-chip file:border-0 file:text-11 file:font-medium file:bg-gray-100 dark:file:bg-[var(--ink-raised)] file:text-gray-700 dark:file:text-[var(--clay)] hover:file:bg-gray-200 dark:hover:file:bg-[var(--rule)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {setCoverFile && (
            <button
              type="button"
              onClick={() => setGenerateOpen(true)}
              disabled={lockedSections.cover}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2 text-11 font-medium rounded-card bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate a cover from your title, author, and genre"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
              Generate cover
            </button>
          )}
        </div>

        <div>
          <label
            htmlFor="bd-title"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Title
          </label>
          <input
            id="bd-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-12 rounded-card bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-gray-400 dark:focus:border-[var(--ink-hover)] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-[var(--paper)] placeholder-gray-400 dark:placeholder-[var(--clay-muted)]"
            placeholder="Book title"
          />
        </div>

        <div>
          <label
            htmlFor="bd-author"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Author
          </label>
          <input
            id="bd-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-12 rounded-card bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-gray-400 dark:focus:border-[var(--ink-hover)] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-[var(--paper)] placeholder-gray-400 dark:placeholder-[var(--clay-muted)]"
            placeholder="Author name"
          />
        </div>

        <div>
          <label
            htmlFor="bd-description"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Description
          </label>
          <textarea
            id="bd-description"
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[var(--ink-deep)] dark:text-[var(--paper)] resize-none placeholder-[var(--clay-muted)]"
            placeholder="Brief description or back cover blurb (optional)"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="bd-publisher"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Publisher
          </label>
          <input
            id="bd-publisher"
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-12 rounded-card bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-gray-400 dark:focus:border-[var(--ink-hover)] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-[var(--paper)] placeholder-gray-400 dark:placeholder-[var(--clay-muted)]"
            placeholder="Publisher name"
          />
        </div>

        <div>
          <label
            htmlFor="bd-publication-date"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Publication Date
          </label>
          <input
            id="bd-publication-date"
            type="date"
            value={pubDate}
            onChange={(e) => setPubDate(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[var(--ink-deep)] dark:text-[var(--paper)]"
          />
        </div>

        <div>
          <label
            htmlFor="bd-language"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Language
          </label>
          <select
            id="bd-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[var(--ink-deep)] dark:text-[var(--paper)]"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="bd-genre"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Genre
          </label>
          <input
            id="bd-genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-12 rounded-card bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-gray-400 dark:focus:border-[var(--ink-hover)] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-[var(--paper)] placeholder-gray-400 dark:placeholder-[var(--clay-muted)]"
            placeholder="e.g. Fiction, Mystery"
          />
        </div>

        <div>
          <label
            htmlFor="bd-isbn"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            ISBN (optional)
          </label>
          <input
            id="bd-isbn"
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            disabled={lockedSections.bookInfo}
            className="w-full px-3 py-2 text-12 rounded-card bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-gray-400 dark:focus:border-[var(--ink-hover)] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-[var(--paper)] placeholder-gray-400 dark:placeholder-[var(--clay-muted)]"
            placeholder="978-0-123456-78-9"
          />
          <p className="mt-2 text-10 text-gray-500 dark:text-[var(--clay-muted)] leading-relaxed">
            ISBNs must be purchased from official agencies (e.g., £93 from{" "}
            <a
              href="https://www.nielsenisbnstore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 dark:hover:text-[var(--clay)] transition-colors"
            >
              Nielsen UK
            </a>
            ). They cannot be invented.
          </p>
        </div>

        <div>
          <label
            htmlFor="bd-tags"
            className="block text-xs font-medium text-gray-700 dark:text-[var(--clay-muted)] mb-2"
          >
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="bd-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              disabled={lockedSections.bookInfo}
              className="flex-1 px-3 py-2 text-12 rounded-card bg-white dark:bg-[var(--ink-raised)] border border-gray-200 dark:border-[var(--rule)] focus:border-gray-400 dark:focus:border-[var(--ink-hover)] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-[var(--paper)] placeholder-gray-400 dark:placeholder-[var(--clay-muted)]"
              placeholder="e.g., fiction, thriller, mystery"
            />
            <button
              onClick={handleAddTag}
              disabled={lockedSections.bookInfo}
              className="flex items-center justify-center h-9 w-9 px-0 rounded-chip bg-gray-100 dark:bg-[var(--ink-raised)] hover:bg-gray-200 dark:hover:bg-[var(--rule)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.96]"
              title="Add tag"
            >
              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-[var(--clay)]" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-2 text-11 rounded-chip bg-gray-100 dark:bg-[var(--ink-raised)] text-gray-700 dark:text-[var(--clay)]"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 dark:text-[var(--clay-muted)] hover:text-gray-600 dark:hover:text-[var(--clay-muted)] transition-colors"
                    title={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {setCoverFile && (
        <GenerateCoverModal
          open={generateOpen}
          onClose={() => setGenerateOpen(false)}
          title={title}
          author={author}
          genre={genre}
          onAccept={setCoverFile}
        />
      )}
    </div>
  );
}
