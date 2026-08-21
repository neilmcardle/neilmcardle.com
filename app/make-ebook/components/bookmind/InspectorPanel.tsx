"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatTab from "./tabs/ChatTab";
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
  onClose?: () => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

type TabKey = "chat" | "issues" | "preflight";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "chat", label: "Chat" },
  { key: "issues", label: "Issues" },
  { key: "preflight", label: "Preflight" },
];

export default function InspectorPanel(props: InspectorPanelProps) {
  const isPro = props.isPro ?? true;
  const visibleTabs = isPro ? TABS : TABS.filter((t) => t.key === "chat");
  const [active, setActive] = useState<TabKey>("chat");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { onClose } = props;

  const handleDismissOrRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const book: BookRecord | undefined = useMemo(() => {
    if (!props.bookId || !props.userId) return undefined;
    return loadBookById(props.userId, props.bookId);
  }, [props.bookId, props.userId, active, refreshTrigger]);

  const chapterIndex = useMemo(
    () => props.chapters.map((c) => ({ id: c.id, title: c.title })),
    [props.chapters],
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#252525]">
      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as TabKey)}
        className="flex flex-col h-full w-full bg-white dark:bg-[#252525] overflow-hidden"
      >
        {!isPro && (
          <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 bg-[#f5f7ff] dark:bg-[#1a1d2e] border-b border-[#d6dcff] dark:border-[#3a3f55]">
            <div className="flex items-center gap-2 min-w-0">
              <svg
                className="w-3.5 h-3.5 text-[#008ff0] flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 22L12 18.5L5.5 22L7 14.5L2 9.5L9 8.5L12 2Z" />
              </svg>
              <span className="text-xs text-gray-700 dark:text-[#e5e5e5] truncate">
                Book Mind trial — one free analysis per book
              </span>
            </div>
            <button
              onClick={props.onUpgrade}
              className="flex-shrink-0 text-xs font-semibold text-[#008ff0] hover:text-[#3560e6] transition-colors whitespace-nowrap"
            >
              Upgrade
            </button>
          </div>
        )}

        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white dark:bg-[#252525]">
          <TabsList className="flex items-center h-auto gap-2 p-0 border-none bg-transparent -mx-3 px-3">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="py-1 px-3 text-xs font-medium transition-all whitespace-nowrap rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-[#2a2a2a] data-[state=active]:text-gray-900 dark:data-[state=active]:text-[#f5f5f5] data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-[#3a3a3a]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1" />
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-colors -mr-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <TabsContent
          value="chat"
          className="flex-1 min-h-0 outline-none w-full bg-white dark:bg-[#252525]"
        >
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
            trialMode={!isPro}
            onUpgrade={props.onUpgrade}
            isPro={isPro}
          />
        </TabsContent>
        <TabsContent
          value="issues"
          className="flex-1 min-h-0 mt-0 outline-none"
        >
          <IssuesTab
            book={book}
            userId={props.userId}
            chapters={chapterIndex}
            onNavigateToChapter={props.onNavigateToChapter}
            onRefresh={props.onRefreshAnalytical}
            onDismiss={handleDismissOrRefresh}
          />
        </TabsContent>
        <TabsContent
          value="preflight"
          className="flex-1 min-h-0 mt-0 outline-none"
        >
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
