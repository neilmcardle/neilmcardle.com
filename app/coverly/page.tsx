"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import the TLDraw canvas to avoid SSR issues
const BookCoverCanvas = dynamic(
  () => import("./components/BookCoverCanvas"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading canvas...</p>
        </div>
      </div>
    )
  }
);

export default function BookCoverDesignerPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-gray-950">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }>
        <BookCoverCanvas />
      </Suspense>
    </div>
  );
}
