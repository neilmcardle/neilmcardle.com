"use client";

// ComposePalette — slash-command palette triggered by typing "/" at the
// start of a line in the editor. Opens a small floating menu with
// compose commands: /draft, /continue, /transition, /describe,
// /dialogue, /scene break. Selecting a command opens a follow-up input
// for the instruction, then streams the output inline as draft text.
//
// The palette uses the same useBookMind.inlineEdit() path as Cmd-K
// but with a different voice block (compose mode, not rewrite mode).
// The output is inserted at the cursor via execCommand('insertHTML').

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useBookMind } from "../../hooks/useBookMind";
import { toast } from "sonner";

export interface ComposePaletteRequest {
  open: boolean;
  anchorRect: DOMRect | null;
  // The "/" character that triggered the palette — we delete it when
  // the user picks a command so it doesn't linger in the text.
  range: Range | null;
}

interface ComposePaletteProps {
  request: ComposePaletteRequest;
  onClose: () => void;
  onInsert: (text: string) => void;
  bookId?: string;
  userId?: string;
}

interface ComposeCommand {
  id: string;
  label: string;
  description: string;
  promptPrefix: string;
}

const COMMANDS: ComposeCommand[] = [
  {
    id: "draft",
    label: "/draft",
    description: "Write a new passage from a prompt",
    promptPrefix: "Draft a passage:",
  },
  {
    id: "continue",
    label: "/continue",
    description: "Continue from where the text left off",
    promptPrefix: "Continue the text naturally from where it left off. Match the voice, tense, and pacing.",
  },
  {
    id: "transition",
    label: "/transition",
    description: "Write a transition to the next scene",
    promptPrefix: "Write a smooth transition from the current scene to:",
  },
  {
    id: "describe",
    label: "/describe",
    description: "Describe a character, place, or moment",
    promptPrefix: "Write a vivid description of:",
  },
  {
    id: "dialogue",
    label: "/dialogue",
    description: "Draft a dialogue exchange",
    promptPrefix: "Write a dialogue exchange:",
  },
  {
    id: "scene-break",
    label: "/scene break",
    description: "Insert a scene break with a bridging sentence",
    promptPrefix: "Write a one-sentence scene break that bridges to:",
  },
];

const PALETTE_WIDTH = 320;
const VIEWPORT_MARGIN = 12;

export default function ComposePalette({
  request,
  onClose,
  onInsert,
  bookId,
  userId,
}: ComposePaletteProps) {
  const { inlineEdit } = useBookMind({ bookId, userId });

  const [filter, setFilter] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<ComposeCommand | null>(null);
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const paletteRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const instructionRef = useRef<HTMLInputElement>(null);

  // Filter commands by what the user has typed after "/"
  const filtered = useMemo(() => {
    if (!filter) return COMMANDS;
    const lower = filter.toLowerCase();
    return COMMANDS.filter(
      c => c.label.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower),
    );
  }, [filter]);

  // Reset on open
  useEffect(() => {
    if (request.open) {
      setFilter("");
      setSelectedCommand(null);
      setInstruction("");
      setIsLoading(false);
      setResult(null);
      setTimeout(() => filterRef.current?.focus(), 50);
    }
  }, [request.open]);

  // Close on outside click
  useEffect(() => {
    if (!request.open) return;
    const handle = (e: MouseEvent) => {
      if (paletteRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handle), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handle); };
  }, [request.open, onClose]);

  // Escape closes
  useEffect(() => {
    if (!request.open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [request.open, onClose]);

  // Position
  const position = useMemo(() => {
    if (!request.anchorRect) return { top: 0, left: 0 };
    const rect = request.anchorRect;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    let left = rect.left;
    if (left + PALETTE_WIDTH > vw - VIEWPORT_MARGIN) left = vw - PALETTE_WIDTH - VIEWPORT_MARGIN;
    return { top: rect.bottom + 4, left: Math.max(VIEWPORT_MARGIN, left) };
  }, [request.anchorRect]);

  const handleSelectCommand = (cmd: ComposeCommand) => {
    setSelectedCommand(cmd);
    // /continue doesn't need a follow-up instruction
    if (cmd.id === "continue") {
      handleGenerate(cmd, "");
    } else {
      setTimeout(() => instructionRef.current?.focus(), 50);
    }
  };

  const handleGenerate = useCallback(async (cmd: ComposeCommand, userInstruction: string) => {
    setIsLoading(true);
    setResult(null);
    const fullPrompt = userInstruction.trim()
      ? `${cmd.promptPrefix} ${userInstruction.trim()}`
      : cmd.promptPrefix;

    try {
      const output = await inlineEdit({
        selectedText: "",
        instruction: fullPrompt,
      });
      if (output) {
        setResult(output);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Compose failed");
    } finally {
      setIsLoading(false);
    }
  }, [inlineEdit]);

  const handleAccept = () => {
    if (!result) return;
    onInsert(result);
    toast.success("Draft inserted", { description: "Undo with \u2318Z." });
    onClose();
  };

  const handleFilterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelectCommand(filtered[0]);
    }
  };

  const handleInstructionKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && selectedCommand) {
      e.preventDefault();
      handleGenerate(selectedCommand, instruction);
    }
  };

  if (!request.open || !request.anchorRect) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={paletteRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: PALETTE_WIDTH,
        zIndex: 1000,
        maxHeight: 400,
      }}
      className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2f2f2f] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      role="dialog"
      aria-label="Compose with Book Mind"
    >
      {!selectedCommand ? (
        <>
          {/* Filter input */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626]">
              <span className="text-xs text-gray-400 dark:text-[#737373] font-mono">/</span>
              <input
                ref={filterRef}
                value={filter}
                onChange={e => setFilter(e.target.value)}
                onKeyDown={handleFilterKey}
                placeholder="Type a command..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
              />
            </div>
          </div>

          {/* Command list */}
          <div className="overflow-y-auto pb-2">
            {filtered.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => handleSelectCommand(cmd)}
                className="w-full flex items-start gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#232323] transition-colors"
              >
                <span className="text-xs font-mono text-[#4070ff] dark:text-[#4070ff] whitespace-nowrap mt-0.5">
                  {cmd.label}
                </span>
                <span className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed">
                  {cmd.description}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-400 dark:text-[#737373] text-center">
                No matching commands
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Selected command + instruction input */}
          <div className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-[#262626]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#4070ff]">{selectedCommand.label}</span>
              <span className="text-xs text-gray-400 dark:text-[#737373]">{selectedCommand.description}</span>
            </div>
            {selectedCommand.id !== "continue" && !result && (
              <div className="flex gap-1.5">
                <input
                  ref={instructionRef}
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  onKeyDown={handleInstructionKey}
                  placeholder="Describe what you want..."
                  disabled={isLoading}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373] disabled:opacity-50"
                />
                <button
                  onClick={() => handleGenerate(selectedCommand, instruction)}
                  disabled={isLoading || (!instruction.trim() && selectedCommand.id !== "continue")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#4070ff] text-white font-medium disabled:opacity-50 hover:bg-[#3560e6] transition-colors"
                >
                  {isLoading ? "..." : "Go"}
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="px-4 py-4 flex items-center gap-2 text-xs text-gray-500 dark:text-[#a3a3a3]">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Writing...
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="text-sm text-gray-800 dark:text-[#f5f5f5] leading-relaxed whitespace-pre-wrap">
                {result}
              </p>
            </div>
          )}

          {/* Actions */}
          {result && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-[#262626] bg-gray-50 dark:bg-[#181818] flex items-center justify-between">
              <p className="text-2xs text-gray-400 dark:text-[#737373]">
                <kbd className="inline-flex items-center px-1 py-0 rounded border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#262626] text-gray-600 dark:text-[#a3a3a3] font-mono text-[10px] mx-0.5">Tab</kbd>
                {" "}to insert
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => { setResult(null); handleGenerate(selectedCommand, instruction); }}
                  className="text-xs px-2.5 py-1 text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white rounded transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={handleAccept}
                  className="text-xs px-3 py-1 bg-[#4070ff] text-white rounded font-medium hover:bg-[#3560e6] transition-colors"
                >
                  Insert
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>,
    document.body,
  );
}
