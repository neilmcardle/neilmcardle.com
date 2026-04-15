"use client";

// InspectorPanel — the new four-tab right-panel surface replacing the
// old BookMindPanel. Chat is the default tab; Insights / Issues / Pre-flight
// are Phase A stubs that will become real in Phase C.
//
// The shell renders a compact tab bar at the top and a scrollable body
// below. Each tab owns its own header + content, so the tab bar is
// deliberately minimal — no extra header chrome above it, no title,
// nothing to compete with the tab content's own header.
//
// Sizing: this component lives inside ResizableRightPanel, which
// controls width. InspectorPanel just fills its container.

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatTab from "./tabs/ChatTab";
import InsightsTab from "./tabs/InsightsTab";
import IssuesTab from "./tabs/IssuesTab";
import PreflightTab from "./tabs/PreflightTab";
import type { Chapter } from "../../types";

interface InspectorPanelProps {
  bookId?: string;
  userId?: string;
  title?: string;
  author?: string;
  genre?: string;
  chapters: Chapter[];
  selectedChapterIndex: number;
  selectedText?: string;
  onNavigateToChapter?: (chapterIndex: number) => void;
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
        <path d="M9 19V6l12-3v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e]">
      {/* Tab bar */}
      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as TabKey)}
        className="flex flex-col h-full"
      >
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
          <InsightsTab />
        </TabsContent>
        <TabsContent value="issues" className="flex-1 min-h-0 mt-0 outline-none">
          <IssuesTab />
        </TabsContent>
        <TabsContent value="preflight" className="flex-1 min-h-0 mt-0 outline-none">
          <PreflightTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
