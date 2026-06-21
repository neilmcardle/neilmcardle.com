"use client";

// Collapsible memory editor: rules, characters, remembered decisions.
// Everything stored here is injected into every Book Mind call.
// Collapsed state shows a content summary so users know what's stored.

import React, { useState } from "react";
import {
  getMemory,
  addRule,
  removeRule,
  setCharacter,
  removeCharacter,
} from "../../utils/bookmindMemory";
import { loadBookById } from "../../utils/bookLibrary";
import { useBookMind } from "../../hooks/useBookMind";

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
  const [version, setVersion] = useState(0);
  const bump = () => setVersion(v => v + 1);

  const { inlineEdit } = useBookMind({ bookId, userId });

  if (!bookId || !userId) return null;

  const book = loadBookById(userId, bookId);
  const memory = getMemory(book);

  const ruleCount = memory.rules.length;
  const charCount = Object.keys(memory.characters).length;
  const decisionCount = memory.decisions.length;
  const totalCount = ruleCount + charCount + decisionCount;

  // Collapsed subtitle: show a summary of what's stored, or a prompt if empty.
  const summary = totalCount === 0
    ? "Nothing stored yet"
    : [
        ruleCount > 0 && `${ruleCount} ${ruleCount === 1 ? "rule" : "rules"}`,
        charCount > 0 && `${charCount} ${charCount === 1 ? "character" : "characters"}`,
        decisionCount > 0 && `${decisionCount} remembered`,
      ].filter(Boolean).join(" · ");

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
    <div className="border-t border-gray-100 dark:border-[#2a2a2a]">
      {/* Collapsed toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-[#232323] transition-colors"
      >
        <span className="flex flex-col text-left gap-0.5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#737373]">
            Memory
          </span>
          <span className="text-2xs text-gray-300 dark:text-[#525252]">
            {summary}
          </span>
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 dark:text-[#525252] transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-5">

          {/* Rules */}
          <div>
            <div className="mb-2">
              <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3]">Writing rules</p>
              <p className="text-2xs text-gray-400 dark:text-[#737373] mt-0.5">Sent with every message. E.g. "no em dashes" or "British spelling".</p>
            </div>
            {ruleCount > 0 && (
              <ul className="space-y-1 mb-2">
                {memory.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 group">
                    <span className="text-xs text-gray-700 dark:text-[#d4d4d4] leading-relaxed flex-1">{rule}</span>
                    <button
                      onClick={() => handleRemoveRule(rule)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all mt-0.5"
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
                placeholder="Add a rule…"
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
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
            <div className="mb-2">
              <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3]">Characters</p>
              <p className="text-2xs text-gray-400 dark:text-[#737373] mt-0.5">Book Mind will always know who these people are.</p>
            </div>
            {charCount > 0 && (
              <ul className="space-y-1.5 mb-3">
                {Object.entries(memory.characters).map(([name, desc]) => (
                  <li key={name} className="flex items-start gap-2 group">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{name}</span>
                      {desc && desc !== "No description yet" && (
                        <span className="text-xs text-gray-500 dark:text-[#a3a3a3] ml-1.5">{desc}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCharacter(name)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all mt-0.5"
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
              <input
                value={newCharName}
                onChange={e => setNewCharName(e.target.value)}
                placeholder="Name"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
              />
              <input
                value={newCharDesc}
                onChange={e => setNewCharDesc(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCharacter()}
                placeholder={isGeneratingDesc ? "Generating…" : "Description (optional)"}
                disabled={isGeneratingDesc}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373] disabled:opacity-50"
              />
              {newCharName.trim() && !newCharDesc.trim() && !isGeneratingDesc && (
                <button
                  onClick={handleGenerateDesc}
                  className="text-2xs text-[#008ff0] hover:text-[#3560e6] transition-colors"
                >
                  Generate description from manuscript
                </button>
              )}
              {isGeneratingDesc && (
                <p className="text-2xs text-gray-400 dark:text-[#737373]">Generating from manuscript…</p>
              )}
              <button
                onClick={handleAddCharacter}
                disabled={!newCharName.trim()}
                className="w-full text-xs py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
              >
                Add character
              </button>
            </div>
          </div>

          {/* Remembered decisions — only shown if any exist */}
          {decisionCount > 0 && (
            <div>
              <div className="mb-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3]">Remembered</p>
                <p className="text-2xs text-gray-400 dark:text-[#737373] mt-0.5">Added via "Remember this" in chat.</p>
              </div>
              <ul className="space-y-1">
                {memory.decisions.slice(-5).reverse().map((d, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                    {d.note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {totalCount === 0 && (
            <p className="text-xs text-gray-400 dark:text-[#737373] text-center py-1 leading-relaxed">
              Everything you add here is injected into every Book Mind message.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
