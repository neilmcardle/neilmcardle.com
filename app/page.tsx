"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { LANGUAGES, today } from "./utils/constants";
import MetaTabContent from "./components/MetaTabContent";
import PreviewPanel from "./components/PreviewPanel";
import AiTabContent from "./components/AiTabContent";
import { useChapters } from "./hooks/useChapters";
import { useTags } from "./hooks/useTags";
import { useCover } from "./hooks/useCover";
import { useLockedSections } from "./hooks/useLockedSections";
import { exportEpub } from "./utils/exportEpub";
import RichTextEditor from "./components/RichTextEditor";

const BOOK_LIBRARY_KEY = "makeebook_library";

// --- Book Library Helpers ---
// ... unchanged ...

function MakeEbookPage() {
  // ... all your state/logic unchanged ...
  // You can keep your chapter, tag, and book logic as before.

  return (
    <>
      <Header
        onSave={handleSaveBook}
        onExport={handleExportEPUB}
        onNewBook={handleNewBook}
        saveFeedback={saveFeedback}
      />
      <div className="min-h-screen bg-[#f7f9fa] text-[#15161a] mt-4">
        {/* Main layout (unchanged), everything under header */}
        <div className="flex flex-1 min-h-0 h-0">
          {/* Left sidebar, main panel, etc. */}
          {/* ... your original main layout ... */}
        </div>
        {/* Floating legal links (unchanged) */}
        <div
          className="fixed bottom-4 right-6 z-50 flex flex-col items-end space-y-1"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="bg-white/90 rounded-md px-3 py-1 shadow border border-gray-200 text-xs text-gray-500 space-x-3"
            style={{ pointerEvents: "auto" }}
          >
            <Link
              href="/terms"
              className="hover:underline text-gray-500"
              target="_blank"
            >
              Terms of Service
            </Link>
            <span className="mx-1 text-gray-300">|</span>
            <Link
              href="/privacy"
              className="hover:underline text-gray-500"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProtectedMakeEbookPage() {
  return (
    <ProtectedRoute>
      <MakeEbookPage />
    </ProtectedRoute>
  )
}