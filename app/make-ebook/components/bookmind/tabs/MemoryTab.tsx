"use client";

import React, { useState, useRef, useEffect } from "react";
import { BookRecord } from "../../../types";
import { getMemory, removeRule, removeCharacter, addRule, setCharacter } from "../../../utils/bookmindMemory";
import { BookMindIcon as BookIcon } from "../../BookMindShared";

interface MemoryTabProps {
  book: BookRecord | undefined;
  userId?: string;
  onUpdate?: () => void;
}

type MemoryEntry = {
  id: string;
  type: "rule" | "character" | "analytical";
  title: string;
  content: string;
  timestamp?: number;
  deleteKey?: string | number; // for deleting: rule string or character name
};

export default function MemoryTab({
  book,
  userId,
  onUpdate,
}: MemoryTabProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState("");
  const [newCharName, setNewCharName] = useState("");
  const [newCharDesc, setNewCharDesc] = useState("");

  if (!book) {
    return <EmptyState message="Open a book to view memory." />;
  }

  const memory = getMemory(book);

  // Build memory entries list
  const entries: MemoryEntry[] = [];

  // Add rules
  (memory.rules ?? []).forEach((rule, idx) => {
    entries.push({
      id: `rule-${idx}`,
      type: "rule",
      title: "Rule",
      content: rule,
      timestamp: Date.now(),
      deleteKey: rule, // store the actual rule string for deletion
    });
  });

  // Add characters
  Object.entries(memory.characters ?? {}).forEach(([name, desc]) => {
    entries.push({
      id: `character-${name}`,
      type: "character",
      title: name,
      content: desc,
      timestamp: Date.now(),
      deleteKey: name, // store the character name for deletion
    });
  });

  // Add analytical entries if they exist
  if (memory.analytical) {
    entries.push({
      id: "analytical",
      type: "analytical",
      title: "Book Analysis",
      content: `Themes, characters, pacing, and word frequency analysis cached`,
      timestamp: Date.now(),
    });
  }

  const handleAddRule = () => {
    if (!userId || !book || !newRule.trim()) return;
    addRule(userId, book.id, newRule.trim());
    setNewRule("");
    onUpdate?.();
  };

  const handleAddCharacter = () => {
    if (!userId || !book || !newCharName.trim() || !newCharDesc.trim()) return;
    setCharacter(userId, book.id, newCharName.trim(), newCharDesc.trim());
    setNewCharName("");
    setNewCharDesc("");
    onUpdate?.();
  };


  const handleDeleteRule = (rule: string) => {
    if (!userId || !book) return;
    removeRule(userId, book.id, rule);
    setDeletingId(null);
    onUpdate?.();
  };

  const handleDeleteCharacter = (name: string) => {
    if (!userId || !book) return;
    removeCharacter(userId, book.id, name);
    setDeletingId(null);
    onUpdate?.();
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium">Memory</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3 max-w-[260px]">
            <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
            <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">No memory yet. Use the chat to teach Book Mind about your manuscript.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium">Memory</span>
          <span className="text-xs text-gray-400 dark:text-[#737373]">
            {entries.length}
          </span>
        </div>
      </div>

      {/* Add to Memory section */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-[#2f2f2f] px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
            placeholder="Add a rule..."
            className="flex-1 text-11 px-3 py-2 rounded bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#888] outline-none focus:border-gray-300 dark:focus:border-[#3a3a3a]"
          />
          <button
            onClick={handleAddRule}
            disabled={!newRule.trim()}
            className="px-3 py-2 text-11 font-medium rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors active:scale-[0.96]"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            placeholder="Character name..."
            className="flex-1 text-11 px-3 py-2 rounded bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#888] outline-none focus:border-gray-300 dark:focus:border-[#3a3a3a]"
          />
          <input
            type="text"
            value={newCharDesc}
            onChange={(e) => setNewCharDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCharacter()}
            placeholder="Description..."
            className="flex-1 text-11 px-3 py-2 rounded bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#888] outline-none focus:border-gray-300 dark:focus:border-[#3a3a3a]"
          />
          <button
            onClick={handleAddCharacter}
            disabled={!newCharName.trim() || !newCharDesc.trim()}
            className="px-3 py-2 text-11 font-medium rounded bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors active:scale-[0.96]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Memory entries */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {entries.map((entry, idx) => (
          <MemoryCard
            key={entry.id}
            entry={entry}
            onDelete={() => {
              if (entry.type === "rule" && typeof entry.deleteKey === "string") {
                handleDeleteRule(entry.deleteKey);
              } else if (entry.type === "character" && typeof entry.deleteKey === "string") {
                handleDeleteCharacter(entry.deleteKey);
              }
            }}
            isDeleting={deletingId === entry.id}
            onDeleteStart={() => setDeletingId(entry.id)}
            onDeleteCancel={() => setDeletingId(null)}
          />
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
}

function MemoryCard({
  entry,
  onDelete,
  isDeleting,
  onDeleteStart,
  onDeleteCancel,
}: {
  entry: MemoryEntry;
  onDelete: () => void;
  isDeleting: boolean;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
}) {
  const typeColors = {
    rule: {
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
      text: "text-blue-600 dark:text-blue-400",
      label: "Rule",
    },
    character: {
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
      text: "text-purple-600 dark:text-purple-400",
      label: "Character",
    },
    analytical: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      label: "Analysis",
    },
  };

  const colors = typeColors[entry.type];

  return (
    <div
      className="group p-3 rounded-lg bg-gray-50 dark:bg-[#262626] border border-gray-100 dark:border-[#2f2f2f] hover:border-gray-200 dark:hover:border-[#3a3a3a] transition-all"
      style={{ animation: "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
          {colors.label}
        </span>
        {!isDeleting ? (
          <button
            onClick={onDeleteStart}
            className="opacity-0 group-hover:opacity-100 text-2xs text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-1"
            title="Delete"
          >
            Delete
          </button>
        ) : (
          <div className="opacity-100 flex items-center gap-1">
            <button
              onClick={onDelete}
              className="text-2xs text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Yes
            </button>
            <span className="text-gray-400 dark:text-[#737373]">/</span>
            <button
              onClick={onDeleteCancel}
              className="text-2xs text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>
      {entry.type === "character" && (
        <p className="text-11 text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
          <span className="text-gray-900 dark:text-white font-medium">{entry.title}</span> {entry.content}
        </p>
      )}
      {entry.type !== "rule" && entry.type !== "character" && (
        <h3 className="text-12 font-medium text-gray-900 dark:text-white mb-1">
          {entry.title}
        </h3>
      )}
      {entry.type !== "character" && (
        <p className="text-11 text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
          {entry.content}
        </p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#2c2c2c] text-gray-900 dark:text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium">Memory</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-[260px]">
          <BookIcon className="w-8 h-8 text-gray-300 dark:text-[#737373] mx-auto" />
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">{message}</p>
        </div>
      </div>
    </div>
  );
}
