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
      type="button"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-busy={isLoading || undefined}
    >
      <BookMindMark className="w-5 h-5 flex-shrink-0" thinking={isLoading} />
      <span className="text-xs font-medium text-[var(--clay)] whitespace-nowrap">
        Book Mind
      </span>
    </button>
  );
}
