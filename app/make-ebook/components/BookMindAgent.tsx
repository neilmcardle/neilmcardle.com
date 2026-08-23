"use client";

import React from "react";
import BookMindMark from "./bookmind/BookMindMark";

interface BookMindAgentProps {
  isLoading?: boolean;
  onOpen?: () => void;
}

export default function BookMindAgent({
  isLoading = false,
  onOpen,
}: BookMindAgentProps) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      title="Open Book Mind"
    >
      <div className="w-5 h-5 flex-shrink-0 text-gray-700 dark:text-gray-300">
        <BookMindMark className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Book Mind
      </span>
    </button>
  );
}
