"use client";

// Full slide-over for long analytical responses. Renders content in a
// generous reading width with serif typography. Citation pills still
// work here so the user can jump into the editor.

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CardRenderer, { tryParseAnalyticalResponse } from "./CardRenderer";
import { formatBookMindMessage } from "../BookMindShared";

interface ReadingViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  bookTitle?: string;
  chapters: Array<{ id: string; title: string }>;
  onNavigate?: (chapterIndex: number, chapterId?: string) => void;
}

export default function ReadingView({
  open,
  onOpenChange,
  content,
  bookTitle,
  chapters,
  onNavigate,
}: ReadingViewProps) {
  // Try the structured path first; fall back to markdown rendering.
  const structured = tryParseAnalyticalResponse(content);

  const handleNavigate = (chapterIndex: number, chapterId?: string) => {
    onOpenChange(false);
    setTimeout(() => onNavigate?.(chapterIndex, chapterId), 50);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[min(80vw,880px)] p-0 bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-[#2f2f2f]"
      >
        <div className="h-full flex flex-col">
          <SheetHeader className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-[#262626] text-left space-y-1">
            <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-[#737373] font-medium">
              Book Mind reading view
            </p>
            <SheetTitle
              className="text-2xl font-normal text-gray-900 dark:text-white leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {bookTitle && bookTitle.trim() ? bookTitle : "Analysis"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div
              className="max-w-[640px] mx-auto prose-reading"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {structured ? (
                <CardRenderer
                  response={structured}
                  chapters={chapters}
                  onNavigate={handleNavigate}
                />
              ) : (
                <div
                  className="text-[15px] leading-[1.75] text-gray-800 dark:text-[#e5e5e5] [&>p+p]:mt-4 [&>p]:m-0"
                  dangerouslySetInnerHTML={{ __html: formatBookMindMessage(content) }}
                />
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
