"use client";

// PreflightTab — the Amazon KDP guard. Runs hard deterministic checks
// (word count, title, author, cover) instantly, and surfaces AI-check
// results from the analytical cache (inconsistencies and word frequency
// overlap). The disclosure helper asks how the book was written and
// generates the exact text to paste into KDP's disclosure field.
//
// Hard checks fire on every render from the props — no API call, no
// loading state. AI checks read from bookmindMemory.analytical, same
// as InsightsTab and IssuesTab.

import React, { useState, useEffect } from "react";
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
  // Add the disclosure as a new backmatter chapter in the editor
  onAddDisclosureChapter?: (content: string) => void;
}

const DISCLOSURE_OPTIONS = [
  { id: "human", label: "Written entirely by a human", disclosure: "This book was written entirely by a human author without AI assistance." },
  { id: "ai-assisted", label: "AI-assisted (editing, brainstorming, suggestions)", disclosure: "This book was written by a human author with AI assistance for editing, brainstorming, and suggestions. All creative decisions and final content are the author's own." },
  { id: "ai-generated", label: "Substantially AI-generated", disclosure: "Substantial portions of this book were generated using AI tools. The author directed the creative vision, curated the output, and edited the final manuscript." },
  { id: "mixed", label: "Mix of human and AI writing", disclosure: "This book contains a mix of human-written and AI-generated content. The author wrote, directed, and edited all material to ensure quality and coherence." },
];

export default function PreflightTab({ book, coverFile, liveTitle, liveAuthor, liveChapters, liveLanguage, liveGenre, onAddDisclosureChapter }: PreflightTabProps) {
  const [selectedDisclosure, setSelectedDisclosure] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedChapter, setAddedChapter] = useState(false);

  useEffect(() => {
    track('preflight_viewed', { source: 'tab' });
  }, []);

  if (!book) {
    return <EmptyState message="Open a book to run pre-flight checks." />;
  }

  // Use live props (updated on every keystroke) when available,
  // falling back to the book snapshot from localStorage.
  const title = liveTitle ?? book.title;
  const author = liveAuthor ?? book.author;
  const chapters = liveChapters ?? book.chapters;
  const language = liveLanguage ?? book.language;
  const genre = liveGenre ?? book.genre;

  const { checks, blocks, warns, allClear } = runPreflightChecks({
    title, author, chapters, coverFile, language, genre,
  });

  const activeDisclosure = DISCLOSURE_OPTIONS.find(d => d.id === selectedDisclosure);

  const handleCopyDisclosure = async () => {
    if (!activeDisclosure) return;
    try {
      await navigator.clipboard.writeText(activeDisclosure.disclosure);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-sm font-medium">Pre-flight</span>
        </div>
        {allClear && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Ready to export
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-6">
        {/* Checks summary */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-3">
            Export checks
          </h3>
          <ul className="space-y-2">
            {checks.map(check => (
              <li key={check.id} className="flex items-start gap-2.5">
                <StatusDot status={check.status} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {check.label}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed mt-0.5">
                    {check.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {blocks.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
              <p className="text-xs font-medium text-red-700 dark:text-red-400">
                {blocks.length} blocking {blocks.length === 1 ? "issue" : "issues"} must be fixed before exporting.
              </p>
            </div>
          )}

          {allClear && warns.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {warns.length} {warns.length === 1 ? "recommendation" : "recommendations"} worth addressing before publishing.
              </p>
            </div>
          )}

          {allClear && warns.length === 0 && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                All checks pass. Your book is ready to export.
              </p>
            </div>
          )}
        </div>

        {/* AI disclosure helper */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
            AI disclosure (KDP requirement)
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-3 leading-relaxed">
            Amazon requires authors to disclose AI involvement. Select how this book was written and copy the text into KDP's disclosure field.
          </p>
          <div className="space-y-1.5">
            {DISCLOSURE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedDisclosure(opt.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                  selectedDisclosure === opt.id
                    ? "bg-[#4070ff]/10 dark:bg-[#4070ff]/15 text-[#4070ff] font-medium"
                    : "bg-gray-50 dark:bg-[#262626] text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {activeDisclosure && (
            <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f]">
              <p className="text-xs text-gray-700 dark:text-[#d4d4d4] leading-relaxed mb-2">
                {activeDisclosure.disclosure}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyDisclosure}
                  className="text-xs font-medium text-[#4070ff] hover:text-[#3560e6] transition-colors"
                >
                  {copied ? "Copied to clipboard" : "Copy disclosure text"}
                </button>
                {onAddDisclosureChapter && (
                  <button
                    onClick={() => {
                      onAddDisclosureChapter(
                        `<h2>AI Disclosure</h2><p>${activeDisclosure.disclosure}</p>`
                      );
                      setAddedChapter(true);
                      setTimeout(() => setAddedChapter(false), 2000);
                    }}
                    disabled={addedChapter}
                    className="text-xs font-medium text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors disabled:text-emerald-600 dark:disabled:text-emerald-400"
                  >
                    {addedChapter ? "Added to book" : "Add as back matter chapter"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "pass" | "warn" | "block" }) {
  const colors = {
    pass: "bg-emerald-500",
    warn: "bg-amber-500",
    block: "bg-red-500",
  };
  return (
    <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
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
