"use client";

import React from "react";
import { SaveIcon, DownloadIcon } from "../app/make-ebook/components/icons";

interface BookToolbarProps {
  onSave?: () => void;
  onExport?: () => void;
  saveFeedback?: boolean;
}

export function BookToolbar({
  onSave,
  onExport,
  saveFeedback,
}: BookToolbarProps) {

  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-2">
        {/* Individual action buttons */}
        <button
          onClick={() => onSave && onSave()}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
          disabled={!!saveFeedback}
          aria-label="Save Book"
          type="button"
        >
          <SaveIcon className="w-4 h-4" />
          <span className={`transition-all ${saveFeedback ? "text-green-600 font-semibold" : ""}`}>
            {saveFeedback ? "Saved!" : "Save to Library"}
          </span>
        </button>
        
        <button
          onClick={() => onExport && onExport()}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
          aria-label="Export for eReader"
          type="button"
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Export for eReader</span>
        </button>
      </div>
    </div>
  );
}