"use client";

import React from "react";
import EditorContextMenu, {
  type ContextMenuGroup,
} from "../components/EditorContextMenu";

export type ContextTarget = {
  x: number;
  y: number;
  selectedText: string;
  range: Range;
  rect: DOMRect;
};

export type ContextHandlers = {
  modKey: string;
  onInlineEditRequest?: (args: {
    selectedText: string;
    range: Range;
    rect: DOMRect;
    instruction?: string;
  }) => void;
  onComposeRequest?: (args: { range: Range; rect: DOMRect }) => void;
  canEndnote: boolean;
  bold: () => void;
  italic: () => void;
  endnote: () => void;
  image: () => void;
  anchor: () => void;
  copy: () => void;
  cut: () => void;
};

function Stroke({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const sparkle = (
  <Stroke>
    <path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
  </Stroke>
);

function Letter({ children, italic }: { children: string; italic?: boolean }) {
  return (
    <span
      className={`w-3.5 text-center text-[12px] font-bold${italic ? " italic" : ""} leading-none`}
    >
      {children}
    </span>
  );
}

export function contextGroups(
  target: ContextTarget,
  h: ContextHandlers,
): ContextMenuGroup[] {
  const { selectedText, range, rect } = target;
  const hasSelection = selectedText.length > 0;
  const edit = h.onInlineEditRequest;

  const ai: ContextMenuGroup["items"] = [];
  if (hasSelection && edit) {
    ai.push(
      {
        id: "rewrite",
        label: "Rewrite",
        accent: true,
        icon: sparkle,
        onSelect: () =>
          edit({
            selectedText,
            range,
            rect,
            instruction: "Rewrite this passage.",
          }),
      },
      {
        id: "tighten",
        label: "Tighten",
        icon: (
          <Stroke>
            <path d="M4 7h16M7 12h10M10 17h4" />
          </Stroke>
        ),
        onSelect: () =>
          edit({
            selectedText,
            range,
            rect,
            instruction: "Tighten this passage. Same meaning, fewer words.",
          }),
      },
      {
        id: "ask",
        label: "Ask Book Mind",
        shortcut: `${h.modKey}K`,
        icon: (
          <Stroke>
            <path d="M12 3a6 6 0 0 1 6 6c0 2.4-1.4 3.6-2 4.8V16H8v-2.2c-.6-1.2-2-2.4-2-4.8a6 6 0 0 1 6-6z" />
            <path d="M9 20h6" />
          </Stroke>
        ),
        onSelect: () => edit({ selectedText, range, rect }),
      },
    );
  }
  if (!hasSelection && h.onComposeRequest) {
    const compose = h.onComposeRequest;
    ai.push({
      id: "continue",
      label: "Continue writing",
      accent: true,
      shortcut: `${h.modKey}K`,
      icon: sparkle,
      onSelect: () => compose({ range, rect }),
    });
  }

  const format: ContextMenuGroup["items"] = hasSelection
    ? [
        {
          id: "bold",
          label: "Bold",
          shortcut: `${h.modKey}B`,
          icon: <Letter>B</Letter>,
          onSelect: h.bold,
        },
        {
          id: "italic",
          label: "Italic",
          shortcut: `${h.modKey}I`,
          icon: <Letter italic>I</Letter>,
          onSelect: h.italic,
        },
      ]
    : [];

  const insert: ContextMenuGroup["items"] = [];
  if (hasSelection && h.canEndnote) {
    insert.push({
      id: "endnote",
      label: "Add endnote",
      icon: (
        <Stroke>
          <path d="M4 6h16M4 11h16M4 16h9" />
          <circle cx="18" cy="17" r="3" />
        </Stroke>
      ),
      onSelect: h.endnote,
    });
  }
  if (!hasSelection) {
    insert.push(
      {
        id: "image",
        label: "Insert image",
        icon: (
          <Stroke>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="m21 16-5-5-6 6" />
          </Stroke>
        ),
        onSelect: h.image,
      },
      {
        id: "anchor",
        label: "Insert anchor",
        icon: (
          <Stroke>
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v14M5 13a7 7 0 0 0 14 0" />
          </Stroke>
        ),
        onSelect: h.anchor,
      },
    );
  }

  const clipboard: ContextMenuGroup["items"] = hasSelection
    ? [
        {
          id: "copy",
          label: "Copy",
          shortcut: `${h.modKey}C`,
          icon: (
            <Stroke>
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </Stroke>
          ),
          onSelect: h.copy,
        },
        {
          id: "cut",
          label: "Cut",
          shortcut: `${h.modKey}X`,
          icon: (
            <Stroke>
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M8.6 15.4 18 4M15.4 15.4 6 4" />
            </Stroke>
          ),
          onSelect: h.cut,
        },
      ]
    : [];

  return [
    { id: "ai", items: ai },
    { id: "format", items: format },
    { id: "insert", items: insert },
    { id: "clipboard", items: clipboard },
  ];
}

export function ChapterContextMenu({
  target,
  handlers,
  onClose,
}: {
  target: ContextTarget;
  handlers: ContextHandlers;
  onClose: () => void;
}) {
  return (
    <EditorContextMenu
      x={target.x}
      y={target.y}
      groups={contextGroups(target, handlers)}
      onClose={onClose}
    />
  );
}
