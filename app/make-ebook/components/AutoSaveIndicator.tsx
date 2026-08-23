"use client";

import React from "react";
import { Cloud } from "lucide-react";
import { Spinner } from "./Spinner";

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  compact?: boolean;
  hasCloudSync?: boolean;
}

export function AutoSaveIndicator({
  isDirty,
  isSaving,
  lastSaved,
  compact = false,
  hasCloudSync = false,
}: AutoSaveIndicatorProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return "just now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isSaving) {
    if (compact) {
      return (
        <div
          className="flex items-center justify-center w-6 h-6"
          title="Saving..."
        >
          <Spinner size="md" className="text-gray-400" />
        </div>
      );
    }
    return (
      <div
        className="flex items-center gap-2 h-10 px-3 rounded-full bg-gray-100 dark:bg-[#262626] text-125 text-gray-500 dark:text-[#a3a3a3]"
        title="Saving..."
      >
        <Spinner size="md" />
        <span className="hidden xl:inline">Saving...</span>
      </div>
    );
  }

  if (isDirty) {
    if (compact) {
      return (
        <div
          className="flex items-center justify-center w-6 h-6"
          title="Unsaved changes"
        >
          <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
      );
    }
    return (
      <div
        className="flex items-center gap-2 h-10 px-3 rounded-full bg-gray-100 dark:bg-[#262626] text-125 text-gray-500 dark:text-[#a3a3a3]"
        title="Unsaved changes"
      >
        <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="hidden xl:inline">Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    const titleText = `Saved ${formatLastSaved(lastSaved)}`;

    if (compact) {
      return (
        <div
          className="flex items-center justify-center w-6 h-6"
          title={titleText}
        >
          {hasCloudSync ? (
            <Cloud className="w-4 h-4 text-green-500" />
          ) : (
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                key={lastSaved.getTime()}
                className="me-tick-draw"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      );
    }
    return (
      <div
        className="flex items-center gap-2 h-10 px-3 rounded-full bg-gray-100 dark:bg-[#262626] text-125 text-gray-500 dark:text-[#a3a3a3]"
        title={titleText}
      >
        {hasCloudSync ? (
          <Cloud className="w-4 h-4 text-green-500" />
        ) : (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              key={lastSaved.getTime()}
              className="me-tick-draw"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.6}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        <span className="hidden xl:inline whitespace-nowrap">
          Saved {formatLastSaved(lastSaved)}
        </span>
      </div>
    );
  }

  return null;
}

export default AutoSaveIndicator;
