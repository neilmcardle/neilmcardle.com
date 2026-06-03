'use client';

// Grouped entry point for writing-surface modes (Focus + Flow). Replaces the
// standalone Focus button and the Flow toggle that used to live inside the
// Book Mind right panel — both are writing-experience features, not editorial
// surfaces, so they belong together on the editor toolbar.
//
// The trigger reflects active state when closed so users can see at a glance
// that a mode is on without opening the menu.

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFeatureAccess } from '@/lib/hooks/useSubscription';

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
        on ? 'bg-[#4070ff]' : 'bg-gray-300 dark:bg-[#3a3a3a]'
      }`}
      aria-hidden
    >
      <span
        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
          on ? 'translate-x-4' : ''
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
  // Flow piggybacks on Book Mind's AI; Pro-only. Per CLAUDE.md the row is
  // absent (not disabled) for Free users — no locks, no upsell-in-context.
  const hasFlow = useFeatureAccess('book_mind_ai');
  const flowOn = flowMode && hasFlow;
  const activeCount = (focusActive ? 1 : 0) + (flowOn ? 1 : 0);
  const anyActive = activeCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={anyActive ? `Writing modes (${activeCount} on)` : 'Focus and writing modes'}
          aria-label={anyActive ? `Writing modes, ${activeCount} on` : 'Focus and writing modes'}
          className={`flex items-center gap-1.5 px-3 h-10 rounded-lg transition-colors group ${
            anyActive
              ? 'bg-[#4070ff]/10 dark:bg-[#4070ff]/15'
              : 'bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#2f2f2f]'
          }`}
        >
          <svg
            className={`w-6 h-6 transition-colors ${
              anyActive
                ? 'text-[#4070ff]'
                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-[#d4d4d4]'
            }`}
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
            className={`text-xs transition-colors ${
              anyActive
                ? 'font-semibold text-[#4070ff]'
                : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-[#d4d4d4]'
            }`}
          >
            Focus{anyActive && activeCount > 1 ? ` (${activeCount})` : ''}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-1.5">
        {/* Focus — universal */}
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); onToggleFocus(); }}
          className="flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer focus:bg-gray-50 dark:focus:bg-[#262626]"
        >
          <svg className="w-4 h-4 mt-0.5 text-gray-500 dark:text-[#a3a3a3] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="7" strokeOpacity={0.5} />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-[#e5e5e5]">Focus mode</p>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-snug mt-0.5">
              Hide chrome and write without distractions.
            </p>
          </div>
          <div className="pt-1"><Switch on={focusActive} /></div>
        </DropdownMenuItem>

        {/* Flow — Pro only, absent for Free per CLAUDE.md */}
        {hasFlow && (
          <DropdownMenuItem
            onSelect={(e) => { e.preventDefault(); onToggleFlow(); }}
            className="flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer focus:bg-gray-50 dark:focus:bg-[#262626]"
          >
            <svg className="w-4 h-4 mt-0.5 text-[#4070ff] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-[#e5e5e5]">Flow mode</p>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-snug mt-0.5">
                AI suggests the next sentence when you pause. Tab to accept.
              </p>
            </div>
            <div className="pt-1"><Switch on={flowMode} /></div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
