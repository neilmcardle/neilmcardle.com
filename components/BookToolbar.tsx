"use client";

import React from "react";
import { SaveIcon, DownloadIcon, PlusIcon } from "../app/make-ebook/components/icons";

interface BookToolbarProps {
  onSave?: () => void;
  onExport?: () => void;
  onNewBook?: () => void;
  saveFeedback?: boolean;
}

export function BookToolbar({
  onSave,
  onExport,
  onNewBook,
  saveFeedback,
}: BookToolbarProps) {

  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-2">
        {/* Individual action buttons */}
        {onNewBook && (
          <button
            onClick={() => onNewBook()}
            className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
            aria-label="New Book"
            type="button"
          >
            <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
              <PlusIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-[#050505]">New Book</span>
          </button>
        )}
        
        <button
          onClick={() => onSave && onSave()}
          className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
          disabled={!!saveFeedback}
          aria-label="Save Book"
          type="button"
        >
          <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
            <SaveIcon className="w-4 h-4" />
          </div>
          <span className={`text-xs font-medium text-[#050505] transition-all ${saveFeedback ? "text-green-600 font-semibold" : ""}`}>
            {saveFeedback ? "Saved!" : "Save"}
          </span>
        </button>
        
        <button
          onClick={() => onExport && onExport()}
          className="hover:opacity-70 transition-opacity flex flex-col items-center gap-1"
          aria-label="Export for eReader"
          type="button"
        >
          <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
            <DownloadIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-[#050505]">Export</span>
        </button>
      </div>
    </div>
  );
}