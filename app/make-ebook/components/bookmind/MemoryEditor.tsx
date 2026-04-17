"use client";

// MemoryEditor — the "Book Mind knows" panel.
//
// Renders inside the Chat tab as a collapsible section above the input.
// Shows the persistent per-book memory: rules the author has set,
// characters they've confirmed, and recent editorial decisions. Each
// entry is editable inline and deletable. New rules can be added via a
// small input at the bottom.
//
// Memory lives on BookRecord.bookmindMemory and is injected into every
// Book Mind system prompt, so anything the author stores here shapes
// every future interaction — chat, Cmd-K, compose, analytical.
//
// The editor reads/writes via the bookmindMemory helpers, which persist
// to localStorage through saveBookToLibrary.

import React, { useState } from "react";
import {
  getMemory,
  addRule,
  removeRule,
  setCharacter,
  removeCharacter,
  addDecision,
} from "../../utils/bookmindMemory";
import { loadBookById } from "../../utils/bookLibrary";
import { useBookMind } from "../../hooks/useBookMind";
import type { BookMindMemory } from "../../types";

interface MemoryEditorProps {
  bookId?: string;
  userId?: string;
}

export default function MemoryEditor({ bookId, userId }: MemoryEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [newCharName, setNewCharName] = useState("");
  const [newCharDesc, setNewCharDesc] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  // Force re-render after mutations (localStorage writes don't trigger React state)
  const [version, setVersion] = useState(0);
  const bump = () => setVersion(v => v + 1);

  // Used for auto-generating character descriptions from the manuscript.
  const { inlineEdit } = useBookMind({ bookId, userId });

  if (!bookId || !userId) return null;

  const book = loadBookById(userId, bookId);
  const memory = getMemory(book);
  const hasContent =
    memory.rules.length > 0 ||
    Object.keys(memory.characters).length > 0 ||
    memory.decisions.length > 0;

  const handleAddRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    addRule(userId, bookId, trimmed);
    setNewRule("");
    bump();
  };

  const handleRemoveRule = (rule: string) => {
    removeRule(userId, bookId, rule);
    bump();
  };

  const handleAddCharacter = () => {
    const name = newCharName.trim();
    const desc = newCharDesc.trim();
    if (!name) return;
    setCharacter(userId, bookId, name, desc || "No description yet");
    setNewCharName("");
    setNewCharDesc("");
    bump();
  };

  const handleRemoveCharacter = (name: string) => {
    removeCharacter(userId, bookId, name);
    bump();
  };

  const handleGenerateDesc = async () => {
    const name = newCharName.trim();
    if (!name) return;
    setIsGeneratingDesc(true);
    try {
      const desc = await inlineEdit({
        selectedText: name,
        instruction: `Who is "${name}" in this book? Return ONLY a one-sentence description of their role, personality, or defining trait. No preamble, no quote marks. If the character doesn't appear in the manuscript, say "Not found in the manuscript."`,
      });
      if (desc) setNewCharDesc(desc.trim());
    } catch {
      setNewCharDesc("Could not generate description.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-[#262626]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#232323] transition-colors"
      >
        <span className="flex flex-col text-left">
          <span className="text-2xs font-medium uppercase tracking-wider text-gray-400 dark:text-[#737373]">
            Book Mind knows
          </span>
          <span className="text-2xs font-normal text-gray-300 dark:text-[#525252] normal-case tracking-normal">
            Set writing rules and add characters
          </span>
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 dark:text-[#737373] transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-4">
          {/* Rules */}
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
              Rules
            </h4>
            {memory.rules.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-[#737373] italic mb-2">
                No rules set. Tell Book Mind things like "no em dashes" or "always use British spelling."
              </p>
            ) : (
              <ul className="space-y-1 mb-2">
                {memory.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 group">
                    <span className="text-xs text-gray-700 dark:text-[#d4d4d4] leading-relaxed flex-1">
                      {rule}
                    </span>
                    <button
                      onClick={() => handleRemoveRule(rule)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                      title="Remove rule"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-1.5">
              <input
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddRule()}
                placeholder="Add a rule..."
                className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
              />
              <button
                onClick={handleAddRule}
                disabled={!newRule.trim()}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Characters */}
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
              Characters
            </h4>
            {Object.keys(memory.characters).length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-[#737373] italic mb-2">
                No characters confirmed. Add key characters so Book Mind remembers who they are.
              </p>
            ) : (
              <ul className="space-y-1.5 mb-2">
                {Object.entries(memory.characters).map(([name, desc]) => (
                  <li key={name} className="flex items-start gap-2 group">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{name}</span>
                      <span className="text-xs text-gray-500 dark:text-[#a3a3a3] ml-1.5">{desc}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCharacter(name)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                      title="Remove character"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  value={newCharName}
                  onChange={e => setNewCharName(e.target.value)}
                  placeholder="Name"
                  className="w-24 text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
                />
                <input
                  value={newCharDesc}
                  onChange={e => setNewCharDesc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddCharacter()}
                  placeholder={isGeneratingDesc ? "Generating..." : "Description"}
                  disabled={isGeneratingDesc}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373] disabled:opacity-50"
                />
                <button
                  onClick={handleAddCharacter}
                  disabled={!newCharName.trim()}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              {newCharName.trim() && !newCharDesc.trim() && (
                <button
                  onClick={handleGenerateDesc}
                  disabled={isGeneratingDesc || !newCharName.trim()}
                  className="text-2xs text-[#4070ff] hover:text-[#3560e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingDesc ? "Generating from manuscript..." : "Auto-generate description from manuscript"}
                </button>
              )}
            </div>
          </div>

          {/* Recent decisions */}
          {memory.decisions.length > 0 && (
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
                Recent decisions
              </h4>
              <ul className="space-y-1">
                {memory.decisions.slice(-5).reverse().map((d, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                    {d.note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!hasContent && (
            <p className="text-xs text-gray-400 dark:text-[#737373] text-center py-2 leading-relaxed">
              Anything you add here is injected into every Book Mind call, so the AI never forgets.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
