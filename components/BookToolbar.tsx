"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Library, Save, Download, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog";

interface BookToolbarProps {
  onNewBook?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  saveFeedback?: boolean;
  onClearChapter?: () => void; // Add this prop for clearing chapter
}

export function BookToolbar({
  onNewBook,
  onSave,
  onExport,
  saveFeedback,
  onClearChapter,
}: BookToolbarProps) {
  const [startedFeedback, setStartedFeedback] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  function handleNewBookClick() {
    if (onNewBook) onNewBook();
    setStartedFeedback(true);
    setTimeout(() => setStartedFeedback(false), 1500);
  }

  function handleClearChapter() {
    if (onClearChapter) onClearChapter();
    setClearDialogOpen(false);
  }

  return (
    <div className="flex flex-wrap gap-4 sm:gap-8 items-center mb-4">
      <button
        onClick={handleNewBookClick}
        className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs bg-transparent border-none outline-none"
        type="button"
        title="New Book"
      >
        <Plus className="w-6 h-6" />
        <span className={`transition-all ${startedFeedback ? "text-green-600 font-semibold" : ""}`}>
          {startedFeedback ? "Started!" : "New Book"}
        </span>
      </button>
      <Link
        href="/my-ebooks"
        className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs"
        title="Library"
      >
        <Library className="w-6 h-6" />
        <span>Library</span>
      </Link>
      <button
        onClick={onSave}
        className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs bg-transparent border-none outline-none"
        disabled={!!saveFeedback}
        title="Save book"
        type="button"
      >
        <Save className="w-6 h-6" />
        <span className={`transition-all ${saveFeedback ? "text-green-600 font-semibold" : ""}`}>
          {saveFeedback ? "Saved!" : "Save book"}
        </span>
      </button>
      <button
        onClick={onExport}
        className="flex flex-col items-center gap-1 text-[#23242a] hover:text-black transition min-w-[64px] text-xs bg-transparent border-none outline-none"
        title="Export ePub"
        type="button"
      >
        <Download className="w-6 h-6" />
        <span>Export ePub</span>
      </button>
      {/* MISC > Clear chapter
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogTrigger asChild>
          <button
            className="flex flex-col items-center gap-1 text-[#9B1C1C] hover:text-red-700 transition min-w-[64px] text-xs bg-transparent border-none outline-none"
            type="button"
            title="Clear chapter"
          >
            <Trash2 className="w-6 h-6" />
            <span>Clear chapter</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear chapter</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            Do you want to do this?
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="destructive" onClick={handleClearChapter}>
              Confirm
            </Button>
            <Button variant="secondary" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}