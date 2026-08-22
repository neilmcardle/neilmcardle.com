"use client";

import React, { useState, useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { BookRecord } from "../../../types";
import { BookMindIcon as BookIcon } from "../../BookMindShared";
import { runPreflightChecks } from "../../../utils/preflightChecks";

interface PreflightTabProps {
  book: BookRecord | undefined;
  coverFile: string | null;
  liveTitle?: string;
  liveAuthor?: string;
  liveChapters?: Array<{ content: string }>;
  liveLanguage?: string;
  liveGenre?: string;

  onAddDisclosureChapter?: (content: string) => void;
  onExport?: () => void;
}

const DISCLOSURE_OPTIONS = [
  {
    id: "human",
    label: "Written entirely by a human",
    disclosure:
      "This book was written entirely by a human author without AI assistance.",
  },
  {
    id: "ai-assisted",
    label: "AI-assisted (editing, brainstorming, suggestions)",
    disclosure:
      "This book was written by a human author with AI assistance for editing, brainstorming, and suggestions. All creative decisions and final content are the author's own.",
  },
  {
    id: "ai-generated",
    label: "Substantially AI-generated",
    disclosure:
      "Substantial portions of this book were generated using AI tools. The author directed the creative vision, curated the output, and edited the final manuscript.",
  },
  {
    id: "mixed",
    label: "Mix of human and AI writing",
    disclosure:
      "This book contains a mix of human-written and AI-generated content. The author wrote, directed, and edited all material to ensure quality and coherence.",
  },
];

export default function PreflightTab({
  book,
  coverFile,
  liveTitle,
  liveAuthor,
  liveChapters,
  liveLanguage,
  liveGenre,
  onAddDisclosureChapter,
  onExport,
}: PreflightTabProps) {
  const [selectedDisclosure, setSelectedDisclosure] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [addedChapter, setAddedChapter] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track("preflight_viewed", { source: "tab" });
  }, []);

  if (!book) {
    return <EmptyState message="Open a book to run pre-flight checks." />;
  }

  const title = liveTitle ?? book.title;
  const author = liveAuthor ?? book.author;
  const chapters = liveChapters ?? book.chapters;
  const language = liveLanguage ?? book.language;
  const genre = liveGenre ?? book.genre;

  const { checks, blocks, warns } = runPreflightChecks({
    title,
    author,
    chapters,
    coverFile,
    language,
    genre,
  });

  const activeDisclosure = DISCLOSURE_OPTIONS.find(
    (d) => d.id === selectedDisclosure,
  );

  const handleCopyDisclosure = async () => {
    if (!activeDisclosure) return;
    try {
      await navigator.clipboard.writeText(activeDisclosure.disclosure);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const passes = checks.filter((c) => c.status === "pass");
  const needsAttention = [...blocks, ...warns];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#252525] text-gray-900 dark:text-white">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[40px] font-bold leading-none tabular-nums text-gray-900 dark:text-white"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {passes.length}
            </span>
            <span className="text-125 text-gray-500 dark:text-[#a3a3a3]">
              of {checks.length} checks clear
            </span>
          </div>
          <div className="flex gap-1 mt-3.5">
            {checks.map((check) => (
              <span
                key={check.id}
                title={check.label}
                className={`flex-1 h-1 rounded-full ${
                  check.status === "pass"
                    ? "bg-emerald-500"
                    : check.status === "warn"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              />
            ))}
          </div>
        </div>

        {needsAttention.length > 0 && (
          <div className="px-3">
            <h3 className="px-1 pb-2 text-10 font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-[#a3a3a3]">
              Needs you
            </h3>
            <div className="space-y-2">
              {needsAttention.map((check) => {
                const isBlock = check.status === "block";
                return (
                  <div
                    key={check.id}
                    className={`p-3 rounded-card border ${
                      isBlock
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
                        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isBlock ? (
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0 text-red-600 dark:text-red-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.9}
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v5M12 16h.01" />
                        </svg>
                      ) : (
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.9}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 4 2.5 20h19z" />
                          <path d="M12 10v4M12 17h.01" />
                        </svg>
                      )}
                      <span className="text-125 font-semibold text-gray-900 dark:text-white">
                        {check.label}
                      </span>
                    </div>
                    <p className="text-11 leading-relaxed text-gray-600 dark:text-[#a3a3a3] mt-1.5">
                      {check.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {passes.length > 0 && (
          <div className="px-3 pt-5">
            <h3 className="px-1 pb-1.5 text-10 font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-[#a3a3a3]">
              Clear
            </h3>
            <div>
              {passes.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center gap-2.5 px-1 py-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="4 12 9 17 20 6" />
                  </svg>
                  <span
                    className="flex-1 min-w-0 text-125 text-gray-700 dark:text-[#d4d4d4] truncate"
                    title={check.message}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={disclosureRef} className="px-3 pt-6 pb-5">
          <h3 className="px-1 pb-1.5 text-10 font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-[#a3a3a3]">
            AI disclosure
          </h3>
          <p className="px-1 text-11 text-gray-500 dark:text-[#a3a3a3] mb-3 leading-relaxed">
            Amazon delists for undisclosed AI, not for using it. Pick how this
            book was written and we write the text for KDP.
          </p>
          <div className="space-y-1.5">
            {DISCLOSURE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedDisclosure(opt.id)}
                className={`w-full text-left px-3 py-2.5 rounded-control text-11 transition-colors ${
                  selectedDisclosure === opt.id
                    ? "bg-[#008ff0]/10 dark:bg-[#008ff0]/15 text-[#008ff0] font-medium"
                    : "bg-gray-50 dark:bg-[#262626] text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {activeDisclosure && (
            <div className="mt-3 p-3 rounded-card bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f]">
              <p className="text-11 text-gray-700 dark:text-[#d4d4d4] leading-relaxed mb-2">
                {activeDisclosure.disclosure}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyDisclosure}
                  className="text-11 font-medium text-[#008ff0] hover:text-[#3560e6] transition-colors"
                >
                  {copied ? "Copied to clipboard" : "Copy disclosure text"}
                </button>
                {onAddDisclosureChapter && (
                  <button
                    onClick={() => {
                      onAddDisclosureChapter(
                        `<h2>AI Disclosure</h2><p>${activeDisclosure.disclosure}</p>`,
                      );
                      setAddedChapter(true);
                      setTimeout(() => setAddedChapter(false), 2000);
                    }}
                    disabled={addedChapter}
                    className="text-11 font-medium text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors disabled:text-emerald-600 dark:disabled:text-emerald-400"
                  >
                    {addedChapter
                      ? "Added to book"
                      : "Add as back matter chapter"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {onExport && (
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-[#2f2f2f]">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-pill bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export book</span>
          </button>
          <p className="text-10 text-center text-gray-400 dark:text-[#737373] mt-2.5">
            {blocks.length > 0
              ? `${blocks.length} blocking ${blocks.length === 1 ? "issue" : "issues"} to fix first.`
              : warns.length > 0
                ? "You can export now. The items above are what Amazon checks."
                : "All checks pass."}
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#252525] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-sm font-medium">Pre-flight</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-[260px]">
          <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">{message}</p>
        </div>
      </div>
    </div>
  );
}
