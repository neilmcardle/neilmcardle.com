"use client";

import React from "react";
import Link from "next/link";
import { Plus, Library, FilePlus2, Save, Download } from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onNewBook?: () => void;
  saveFeedback?: boolean;
  isMakeEbook?: boolean;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  open,
  onClose,
  onSave,
  onExport,
  onNewBook,
  saveFeedback,
  isMakeEbook,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-lg">Menu</span>
          <button className="text-2xl text-gray-400" onClick={onClose} aria-label="Close menu">
            &times;
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <Link
            href="/make-ebook"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 font-medium text-[#23242a]"
            onClick={onClose}
          >
            <Plus className="w-5 h-5" />
            Create
          </Link>
          <Link
            href="/my-ebooks"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 font-medium text-[#23242a]"
            onClick={onClose}
          >
            <Library className="w-5 h-5" />
            Library
          </Link>
          {isMakeEbook && (
            <>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 font-medium text-[#23242a] bg-transparent border-none"
                onClick={() => {
                  onNewBook && onNewBook();
                  onClose();
                }}
                type="button"
              >
                <FilePlus2 className="w-5 h-5" />
                New book
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 font-medium text-[#23242a] bg-transparent border-none"
                onClick={() => {
                  onSave && onSave();
                  onClose();
                }}
                type="button"
                disabled={!!saveFeedback}
              >
                <Save className="w-5 h-5" />
                {saveFeedback ? "Saved!" : "Save book"}
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 font-medium text-[#23242a] bg-transparent border-none"
                onClick={() => {
                  onExport && onExport();
                  onClose();
                }}
                type="button"
              >
                <Download className="w-5 h-5" />
                Export ePub
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};