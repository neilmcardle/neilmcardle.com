'use client';

import React from 'react';

interface NotesPanelProps {
  outlineNotes: string;
  setOutlineNotes: (value: string) => void;
}

export default function NotesPanel({ outlineNotes, setOutlineNotes }: NotesPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 py-2 px-2 flex-shrink-0">
        <svg className="w-5 h-5 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Notes</span>
      </div>
      <textarea
        value={outlineNotes}
        onChange={(e) => setOutlineNotes(e.target.value)}
        placeholder="Plan your chapters, map out your plot, jot down ideas — anything that helps you write."
        className="flex-1 w-full resize-none px-3 py-2 text-sm text-[#333] dark:text-[#d4d4d4] bg-transparent border-0 placeholder:text-gray-300 dark:placeholder:text-[#444] focus:outline-none focus:ring-0 leading-relaxed"
      />
    </div>
  );
}
