"use client";

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
  const structured = tryParseAnalyticalResponse(content);

  const handleNavigate = (chapterIndex: number, chapterId?: string) => {
    onOpenChange(false);
    setTimeout(() => onNavigate?.(chapterIndex, chapterId), 50);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[min(80vw,880px)] p-0 bg-white dark:bg-[var(--ink-window)] border-l border-gray-200 dark:border-[var(--rule)]"
      >
        <div className="h-full flex flex-col">
          <SheetHeader className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-[var(--ink-raised)] text-left space-y-1">
            <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-[var(--clay-muted)] font-medium">
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
                  className="text-[15px] leading-[1.75] text-gray-800 dark:text-[var(--paper)] [&>p+p]:mt-4 [&>p]:m-0"
                  dangerouslySetInnerHTML={{
                    __html: formatBookMindMessage(content),
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
