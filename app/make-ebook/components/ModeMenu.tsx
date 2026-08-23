"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFeatureAccess } from "@/lib/hooks/useSubscription";

interface ModeMenuProps {
  focusActive: boolean;
  onToggleFocus: () => void;
  flowMode: boolean;
  onToggleFlow: () => void;
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-block w-8 h-4 rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-[#008ff0]" : "bg-gray-300 dark:bg-[#3a3a3a]"
      }`}
      aria-hidden
    >
      <span
        className={`absolute top-1 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
          on ? "translate-x-4" : ""
        }`}
      />
    </span>
  );
}

export default function ModeMenu({
  focusActive,
  onToggleFocus,
  flowMode,
  onToggleFlow,
}: ModeMenuProps) {
  const hasFlow = useFeatureAccess("book_mind_ai");
  const flowOn = flowMode && hasFlow;
  const anyOn = flowOn || focusActive;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="Writing modes"
          aria-label="Writing modes"
          className="flex items-center gap-2 px-3 h-10 rounded-full bg-gray-100 dark:bg-[#262626] border border-gray-200 dark:border-transparent hover:bg-gray-200 dark:hover:bg-[#333] transition-colors duration-[var(--me-dur)]"
        >
          <svg
            className={`w-4 h-4 transition-colors duration-[var(--me-dur)] ${anyOn ? "text-[#008ff0]" : "text-gray-500 dark:text-[#a3a3a3]"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="7" strokeOpacity={0.5} />
          </svg>
          <span
            className={`text-125 font-medium transition-colors duration-[var(--me-dur)] ${anyOn ? "text-[#008ff0]" : "text-gray-700 dark:text-[#d4d4d4]"}`}
          >
            Modes
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onToggleFocus();
          }}
          className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4 mt-1 text-gray-500 dark:text-[#a3a3a3] flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="7" strokeOpacity={0.5} />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-125 font-medium text-gray-900 dark:text-[#e5e5e5]">
              Focus mode
            </p>
            <p className="text-11 text-gray-500 dark:text-[#a3a3a3] leading-snug mt-1">
              Hide chrome and write without distractions.
            </p>
          </div>
          <div className="pt-1">
            <Switch on={focusActive} />
          </div>
        </DropdownMenuItem>

        {hasFlow && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onToggleFlow();
            }}
            className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
          >
            <svg
              className="w-4 h-4 mt-1 text-[#008ff0] flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-125 font-medium text-gray-900 dark:text-[#e5e5e5]">
                Flow mode
              </p>
              <p className="text-11 text-gray-500 dark:text-[#a3a3a3] leading-snug mt-1">
                AI suggests the next sentence when you pause. Tab to accept.
              </p>
            </div>
            <div className="pt-1">
              <Switch on={flowMode} />
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
