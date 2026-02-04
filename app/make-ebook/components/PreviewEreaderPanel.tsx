"use client";
import React, { useEffect, useState } from "react";

type Chapter = {
  id?: string;
  title?: string;
  content?: string;
  type?: string;
};

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PreviewEreaderPanel({
  chapters,
  selectedChapter,
  setSelectedChapter,
  onClose,
}: {
  chapters: Chapter[];
  selectedChapter: number;
  setSelectedChapter: (i: number) => void;
  onClose: () => void;
}) {
  const [previewIndex, setPreviewIndex] = useState<number>(selectedChapter || 0);
  const [fontFamily, setFontFamily] = useState<string>("serif");

  useEffect(() => {
    setPreviewIndex(selectedChapter || 0);
  }, [selectedChapter]);

  useEffect(() => {
    // sync preview index back to main selection when changed here
    setSelectedChapter(previewIndex);
  }, [previewIndex]);

  const prev = () => setPreviewIndex((i) => Math.max(0, i - 1));
  const next = () => setPreviewIndex((i) => Math.min(chapters.length - 1, i + 1));

  const chapter = chapters[previewIndex] || { title: "", content: "" };
  const text = stripHtml(chapter.content || "");

  return (
    <aside className="fixed right-0 top-0 h-full w-[360px] bg-white dark:bg-[#0f0f0f] border-l border-gray-200 dark:border-[#323232] z-50 shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-[#262626]">
        <div className="flex items-center gap-2">
          <img src="/ereader-kindle.svg" alt="eReader" className="w-6 h-6" />
          <div className="text-sm font-medium text-[#050505] dark:text-[#e5e5e5]">e‑Reader Preview</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} aria-label="Close preview" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            ✕
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto">
        <div className="mb-3 flex items-center gap-2">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="px-2 py-1 text-sm rounded bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-800"
            aria-label="Select preview font"
          >
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans Serif</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Merriweather, serif">Merriweather</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Times New Roman, serif">Times New Roman</option>
          </select>
          <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">{previewIndex + 1}/{chapters.length}</div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-56 h-[360px] bg-transparent">
            <img src="/ereader-kindle.svg" alt="eReader device" className="w-full h-full object-contain" />
            {/* Screen overlay - positioned approximately; tweak if your SVG has exact coords */}
            <div
              className="absolute top-[12%] left-[12%] w-[76%] h-[72%] overflow-auto bg-transparent text-sm leading-relaxed text-[#111827] dark:text-[#e5e5e5]"
              style={{ fontFamily: fontFamily, WebkitFontSmoothing: 'antialiased' }}
            >
              <div className="p-3">
                <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">{chapter.title || 'Untitled'}</div>
                <div className="whitespace-pre-wrap text-[13px]">{text || 'No content in this chapter.'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-gray-100 dark:border-[#262626] flex items-center gap-2">
        <button onClick={prev} className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">◀ Chapter</button>
        <button onClick={next} className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">Chapter ▶</button>
      </div>
    </aside>
  );
}
