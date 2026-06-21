"use client";

export function HandleDragIcon({ isSelected: _isSelected }: { isSelected: boolean }) {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex items-center justify-center text-gray-400 dark:text-[#737373]"
      aria-hidden="true"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="14" x2="21" y2="14" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="15.4 5 12 1.5 8.6 5" />
        <polyline points="8.6 19 12 22.4 15.4 19" />
      </svg>
    </span>
  );
}
