"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, SaveIcon, DownloadIcon } from "../app/make-ebook/components/icons";
import { Library, Trash2, MoreHorizontal } from "lucide-react";
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
  const [actionsOpen, setActionsOpen] = useState(false);

  function handleNewBookClick() {
    if (onNewBook) onNewBook();
    setStartedFeedback(true);
    setTimeout(() => setStartedFeedback(false), 1500);
  }

  function handleClearChapter() {
    if (onClearChapter) onClearChapter();
    setClearDialogOpen(false);
  }

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsOpen && !(event.target as Element).closest('.relative')) {
        setActionsOpen(false);
      }
    };

    if (actionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [actionsOpen]);

  return (
    <div className="flex justify-end">
      <div className="relative">
        <button
          onClick={() => setActionsOpen(!actionsOpen)}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal className="w-5 h-5 text-[#23242a]" />
        </button>
        
        {/* Dropdown Menu */}
        {actionsOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  handleNewBookClick();
                  setActionsOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-2 text-[#23242a] hover:bg-[#F7F7F7] transition text-sm"
                type="button"
              >
                <PlusIcon className="w-4 h-4" />
                <span className={`transition-all ${startedFeedback ? "text-green-600 font-semibold" : ""}`}>
                  {startedFeedback ? "Started!" : "New Book"}
                </span>
              </button>
              <button
                onClick={() => {
                  onSave && onSave();
                  setActionsOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-2 text-[#23242a] hover:bg-[#F7F7F7] transition text-sm"
                disabled={!!saveFeedback}
                type="button"
              >
                <SaveIcon className="w-4 h-4" />
                <span className={`transition-all ${saveFeedback ? "text-green-600 font-semibold" : ""}`}>
                  {saveFeedback ? "Saved!" : "Save Book"}
                </span>
              </button>
              <button
                onClick={() => {
                  onExport && onExport();
                  setActionsOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-2 text-[#23242a] hover:bg-[#F7F7F7] transition text-sm"
                type="button"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Export for eReader</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}