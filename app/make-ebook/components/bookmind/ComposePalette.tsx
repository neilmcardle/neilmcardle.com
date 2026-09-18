"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useBookMind } from "../../hooks/useBookMind";
import { toast } from "sonner";
import { useIsMac } from "../PlatformKey";
import { Spinner } from "../Spinner";

export interface ComposePaletteRequest {
  open: boolean;
  anchorRect: DOMRect | null;
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
    promptPrefix:
      "Continue the text naturally from where it left off. Match the voice, tense, and pacing.",
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
const ANCHOR_GAP = 4;

const CHROME_HEIGHT = 130;
const PALETTE_MAX = 480;

export default function ComposePalette({
  request,
  onClose,
  onInsert,
  bookId,
  userId,
}: ComposePaletteProps) {
  const { inlineEdit } = useBookMind({ bookId, userId });
  const isMac = useIsMac();
  const undoCombo = isMac ? "⌘Z" : "Ctrl+Z";

  const [filter, setFilter] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<ComposeCommand | null>(
    null,
  );
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const paletteRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const instructionRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!filter) return COMMANDS;
    const lower = filter.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower),
    );
  }, [filter]);

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

  useEffect(() => {
    if (!request.open) return;
    const handle = (e: MouseEvent) => {
      if (paletteRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handle),
      50,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handle);
    };
  }, [request.open, onClose]);

  useEffect(() => {
    if (!request.open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [request.open, onClose]);

  const layout = useMemo(() => {
    if (!request.anchorRect) return { top: 0, left: 0, maxHeight: PALETTE_MAX };
    const rect = request.anchorRect;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;

    let left = rect.left;
    if (left + PALETTE_WIDTH > vw - VIEWPORT_MARGIN)
      left = vw - PALETTE_WIDTH - VIEWPORT_MARGIN;
    left = Math.max(VIEWPORT_MARGIN, left);

    const spaceBelow = vh - rect.bottom - ANCHOR_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - ANCHOR_GAP - VIEWPORT_MARGIN;
    const minUsable = CHROME_HEIGHT + 60;

    let top: number;
    let maxHeight: number;
    if (spaceBelow >= minUsable || spaceBelow >= spaceAbove) {
      top = rect.bottom + ANCHOR_GAP;
      maxHeight = Math.min(PALETTE_MAX, spaceBelow);
    } else {
      maxHeight = Math.min(PALETTE_MAX, spaceAbove);
      top = rect.top - ANCHOR_GAP - maxHeight;
    }
    maxHeight = Math.max(maxHeight, minUsable);
    return { top: Math.max(VIEWPORT_MARGIN, top), left, maxHeight };
  }, [request.anchorRect]);

  const handleSelectCommand = (cmd: ComposeCommand) => {
    setSelectedCommand(cmd);

    if (cmd.id === "continue") {
      handleGenerate(cmd, "");
    } else {
      setTimeout(() => instructionRef.current?.focus(), 50);
    }
  };

  const handleGenerate = useCallback(
    async (cmd: ComposeCommand, userInstruction: string) => {
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
    },
    [inlineEdit],
  );

  const handleAccept = () => {
    if (!result) return;
    onInsert(result);
    toast.success("Draft inserted", { description: `Undo with ${undoCombo}.` });
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
        top: layout.top,
        left: layout.left,
        width: PALETTE_WIDTH,
        zIndex: 1000,
        maxHeight: layout.maxHeight,
      }}
      className="bg-white dark:bg-[var(--ink)] border border-gray-200 dark:border-[var(--rule)] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      role="dialog"
      aria-label="Compose with Book Mind"
    >
      {!selectedCommand ? (
        <>
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-100 dark:bg-[var(--ink-raised)]">
              <span className="text-xs text-gray-400 dark:text-[var(--clay-muted)] font-mono">
                /
              </span>
              <input
                ref={filterRef}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={handleFilterKey}
                placeholder="Type a command..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[var(--clay-muted)]"
              />
            </div>
          </div>

          <div className="overflow-y-auto pb-2">
            {filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleSelectCommand(cmd)}
                className="w-full flex items-start gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-[var(--ink-panel)] transition-colors"
              >
                <span className="text-xs font-mono text-[var(--acid)] dark:text-[var(--acid)] whitespace-nowrap mt-1">
                  {cmd.label}
                </span>
                <span className="text-xs text-gray-600 dark:text-[var(--clay-muted)] leading-relaxed">
                  {cmd.description}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-400 dark:text-[var(--clay-muted)] text-center">
                No matching commands
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-[var(--ink-raised)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[var(--acid)]">
                {selectedCommand.label}
              </span>
              <span className="text-xs text-gray-400 dark:text-[var(--clay-muted)]">
                {selectedCommand.description}
              </span>
            </div>
            {selectedCommand.id !== "continue" && !result && (
              <div className="flex gap-2">
                <input
                  ref={instructionRef}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={handleInstructionKey}
                  placeholder="Describe what you want..."
                  disabled={isLoading}
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-[var(--ink-raised)] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[var(--clay-muted)] disabled:opacity-50"
                />
                <button
                  onClick={() => handleGenerate(selectedCommand, instruction)}
                  disabled={
                    isLoading ||
                    (!instruction.trim() && selectedCommand.id !== "continue")
                  }
                  className="text-xs px-3 py-2 rounded-lg bg-[var(--paper)] text-[var(--ink-deep)] font-medium disabled:opacity-50 hover:bg-[var(--clay)] transition-colors"
                >
                  {isLoading ? "..." : "Go"}
                </button>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="px-4 py-4 flex items-center gap-2 text-xs text-gray-500 dark:text-[var(--clay-muted)]">
              <Spinner size="xs" />
              Writing...
            </div>
          )}

          {result && (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="text-sm text-gray-800 dark:text-[var(--paper)] leading-relaxed whitespace-pre-wrap">
                {result}
              </p>
            </div>
          )}

          {result && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-[var(--ink-raised)] bg-gray-50 dark:bg-[var(--ink-window)] flex items-center justify-between">
              <p className="text-2xs text-gray-400 dark:text-[var(--clay-muted)]">
                <kbd className="inline-flex items-center px-1 py-0 rounded border border-gray-200 dark:border-[var(--ink-hover)] bg-white dark:bg-[var(--ink-raised)] text-gray-600 dark:text-[var(--clay-muted)] font-mono text-[10px] mx-0.5">
                  Tab
                </kbd>{" "}
                to insert
              </p>
              <div className="flex gap-1">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setResult(null);
                    handleGenerate(selectedCommand, instruction);
                  }}
                  className="text-xs px-3 py-1 text-gray-600 dark:text-[var(--clay-muted)] hover:text-gray-900 dark:hover:text-white rounded transition-colors"
                >
                  Try again
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleAccept}
                  className="text-xs px-3 py-1 bg-[var(--paper)] text-[var(--ink-deep)] rounded font-medium hover:bg-[var(--clay)] transition-colors"
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
