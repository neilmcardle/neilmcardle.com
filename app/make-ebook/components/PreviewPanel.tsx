import React from "react";
import { CalendarIcon, LanguagesIcon } from "./icons";
import { Chapter } from "../types";

interface PreviewPanelProps {
  coverUrl: string | null;
  title: string;
  author: string;
  pubDate: string;
  language: string;
  genre: string;
  tags: string[];
  chapters: Chapter[];
  totalWords: number;
  pageCount: number;
  readingTime: number;
}

export default function PreviewPanel({
  coverUrl,
  title,
  author,
  pubDate,
  language,
  genre,
  tags,
  chapters,
  totalWords,
  pageCount,
  readingTime,
}: PreviewPanelProps) {
  return (
    <div className="w-full max-w-xs mx-auto pt-2 pb-8 px-4">
      {/* Book Cover + Info */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-56 h-80 rounded bg-gradient-to-br from-[#f5f5f7] to-[#ececef] border border-[#E8E8E8] shadow flex items-center justify-center overflow-hidden mb-3 relative">
          {coverUrl ? (
            <img src={coverUrl} alt="Book cover" className="object-cover w-full h-full" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <span className="font-bold text-2xl text-[#23242a]">{title || "Untitled Book"}</span>
              <span className="text-[#737373] mt-2">{author || "by Unknown Author"}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Table of Contents */}
      <div className="mb-6">
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
          <CalendarIcon className="w-5 h-5 text-[#23242a]" />
          <span className="font-medium">Published:</span>
          <span>{pubDate || "—"}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <img src="/dark-languages-icon.svg" alt="Language" className="w-5 h-5 hidden dark:block" />
          <LanguagesIcon className="w-5 h-5 text-[#23242a] dark:hidden" />
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
            {tags.map((tag) => (
              <span key={tag} className="bg-[#F7F7F7] rounded px-2 py-1 text-xs border border-[#E8E8E8] text-[#737373]">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}