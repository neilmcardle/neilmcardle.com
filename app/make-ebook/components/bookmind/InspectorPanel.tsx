"use client";

// InspectorPanel — the four-tab right-panel surface.
//
// Chat is the default tab. Insights / Issues / Pre-flight read from
// the analytical cache stored on BookRecord.bookmindMemory. The tab
// bar is compact and delegates all content rendering to the child tabs.

import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatTab from "./tabs/ChatTab";
import InsightsTab from "./tabs/InsightsTab";
import IssuesTab from "./tabs/IssuesTab";
import PreflightTab from "./tabs/PreflightTab";
import type { Chapter, BookRecord } from "../../types";
import { loadBookById } from "../../utils/bookLibrary";
import type { AnalyticalKind } from "../../utils/bookmindMemory";

interface InspectorPanelProps {
  bookId?: string;
  userId?: string;
  title?: string;
  author?: string;
  genre?: string;
  chapters: Chapter[];
  selectedChapterIndex: number;
  selectedText?: string;
  coverFile?: string | null;
  onNavigateToChapter?: (chapterIndex: number) => void;
  onRefreshAnalytical?: (kind: AnalyticalKind) => void;
  onAddDisclosureChapter?: (content: string) => void;
  flowMode?: boolean;
  onToggleFlowMode?: () => void;
}

type TabKey = "chat" | "insights" | "issues" | "preflight";

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  {
    key: "chat",
    label: "Chat",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    key: "insights",
    label: "Insights",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    key: "issues",
    label: "Issues",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    key: "preflight",
    label: "Pre-flight",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function InspectorPanel(props: InspectorPanelProps) {
  const [active, setActive] = useState<TabKey>("chat");

  // Load the full BookRecord for the analytical tabs — they need the
  // bookmindMemory.analytical cache. This reads from localStorage (the
  // same source of truth the cache generator writes to), so it's always
  // current. Re-runs on every render, which is fine because localStorage
  // reads are ~0.1ms and the Inspector doesn't render on every keystroke.
  const book: BookRecord | undefined = useMemo(() => {
    if (!props.bookId || !props.userId) return undefined;
    return loadBookById(props.userId, props.bookId);
  }, [props.bookId, props.userId, active]); // re-read when switching tabs

  const chapterIndex = useMemo(
    () => props.chapters.map(c => ({ id: c.id, title: c.title })),
    [props.chapters],
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e]">
      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as TabKey)}
        className="flex flex-col h-full"
      >
        {/* Flow mode toggle — right-aligned with info tooltip */}
        {props.onToggleFlowMode && (
          <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-1.5 bg-gray-50 dark:bg-[#181818] border-b border-gray-100 dark:border-[#262626]">
            <span className="group relative">
              <svg className="w-3 h-3 text-gray-300 dark:text-[#525252] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="absolute top-full right-0 mt-1.5 w-48 px-3 py-2 rounded-lg bg-gray-900 dark:bg-[#2a2a2a] text-white text-[10px] leading-snug shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Suggests the next sentence as you write. Pauses for 4 seconds at the end of a sentence, then offers a continuation you can accept with Tab.
              </span>
            </span>
            <span className="text-2xs text-gray-400 dark:text-[#737373]">Flow mode</span>
            <button
              onClick={props.onToggleFlowMode}
              className={`relative w-8 h-4 rounded-full transition-colors ${
                props.flowMode
                  ? "bg-[#4070ff]"
                  : "bg-gray-300 dark:bg-[#3a3a3a]"
              }`}
              title={props.flowMode ? "Turn off Flow mode" : "Turn on Flow mode"}
              aria-label="Toggle Flow mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                  props.flowMode ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>
        )}
        <TabsList className="flex-shrink-0 h-11 w-full justify-start gap-0 bg-gray-50 dark:bg-[#181818] border-b border-gray-200 dark:border-[#2f2f2f] rounded-none p-0 mt-0">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="flex-1 h-11 rounded-none px-2 gap-1.5 text-xs text-gray-500 dark:text-[#737373] data-[state=active]:bg-white dark:data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-[#4070ff] dark:data-[state=active]:text-[#4070ff] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4070ff] transition-colors"
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="chat" className="flex-1 min-h-0 mt-0 outline-none">
          <ChatTab
            bookId={props.bookId}
            userId={props.userId}
            title={props.title}
            author={props.author}
            genre={props.genre}
            chapters={props.chapters}
            selectedChapterIndex={props.selectedChapterIndex}
            selectedText={props.selectedText}
            onNavigateToChapter={props.onNavigateToChapter}
          />
        </TabsContent>
        <TabsContent value="insights" className="flex-1 min-h-0 mt-0 outline-none">
          <InsightsTab
            book={book}
            userId={props.userId}
            chapters={chapterIndex}
            onNavigateToChapter={props.onNavigateToChapter}
            onRefresh={props.onRefreshAnalytical}
          />
        </TabsContent>
        <TabsContent value="issues" className="flex-1 min-h-0 mt-0 outline-none">
          <IssuesTab
            book={book}
            userId={props.userId}
            chapters={chapterIndex}
            onNavigateToChapter={props.onNavigateToChapter}
            onRefresh={props.onRefreshAnalytical}
          />
        </TabsContent>
        <TabsContent value="preflight" className="flex-1 min-h-0 mt-0 outline-none">
          <PreflightTab
            book={book}
            coverFile={props.coverFile ?? null}
            liveTitle={props.title}
            liveAuthor={props.author}
            liveChapters={props.chapters}
            liveGenre={props.genre}
            onAddDisclosureChapter={props.onAddDisclosureChapter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
