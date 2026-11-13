"use client";

import React, { useState } from "react";
import { PlusIcon } from "../icons";

type ChapterType = "frontmatter" | "content" | "backmatter";

const CHAPTER_TEMPLATES = {
  frontmatter: [
    { title: "Title Page" },
    { title: "Copyright" },
    { title: "Dedication" },
    { title: "Foreword" },
    { title: "Preface" },
    { title: "Acknowledgements" },
    { title: "Introduction" },
    { title: "Prologue" },
    { title: "Custom Front Matter" },
  ],
  content: [
    { title: "Chapter" },
    { title: "Part" },
    { title: "Custom Chapter" },
  ],
  backmatter: [
    { title: "Epilogue" },
    { title: "Afterword" },
    { title: "Appendix" },
    { title: "Notes" },
    { title: "Glossary" },
    { title: "Bibliography" },
    { title: "Index" },
    { title: "About the Author" },
    { title: "Custom Back Matter" },
  ],
};

export default function AddChapterMenu({
  handleAddChapter,
}: {
  handleAddChapter: (type: ChapterType, title?: string) => void;
}) {
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
        className="flex items-center justify-center h-8 w-8 rounded-chip text-gray-500 dark:text-[var(--clay-muted)] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] hover:text-gray-700 dark:hover:text-[var(--clay)] transition duration-150"
        title="Add chapter"
        data-testid="add-chapter"
      >
        <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-[var(--clay)]" />
      </button>

      {chapterTypeDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[var(--ink-panel)] rounded-card shadow-lg border border-gray-200 dark:border-[var(--rule)] z-50 py-1 max-h-96 overflow-y-auto">
          <div className="space-y-1">
            <div>
              <div className="px-3 py-2 text-10 font-semibold text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-[0.08em]">
                Front Matter
              </div>
              {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                <button
                  key={template.title}
                  onClick={() => {
                    handleAddChapter(
                      "frontmatter",
                      template.title === "Custom Front Matter"
                        ? ""
                        : template.title,
                    );
                    setChapterTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] text-125 text-gray-900 dark:text-[var(--paper)] transition-colors"
                >
                  {template.title}
                </button>
              ))}
            </div>

            <div>
              <div className="px-3 py-2 text-10 font-semibold text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-[0.08em]">
                Main Content
              </div>
              {CHAPTER_TEMPLATES.content.map((template) => (
                <button
                  key={template.title}
                  onClick={() => {
                    handleAddChapter(
                      "content",
                      template.title === "Custom Chapter" ? "" : template.title,
                    );
                    setChapterTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] text-125 text-gray-900 dark:text-[var(--paper)] transition-colors"
                >
                  {template.title}
                </button>
              ))}
            </div>

            <div>
              <div className="px-3 py-2 text-10 font-semibold text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-[0.08em]">
                Back Matter
              </div>
              {CHAPTER_TEMPLATES.backmatter.map((template) => (
                <button
                  key={template.title}
                  onClick={() => {
                    handleAddChapter(
                      "backmatter",
                      template.title === "Custom Back Matter"
                        ? ""
                        : template.title,
                    );
                    setChapterTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[6px] hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] text-125 text-gray-900 dark:text-[var(--paper)] transition-colors"
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
