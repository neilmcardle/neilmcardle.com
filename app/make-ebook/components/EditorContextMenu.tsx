"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ContextMenuAction {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  accent?: boolean;
  onSelect: () => void;
}

export interface ContextMenuGroup {
  id: string;
  items: ContextMenuAction[];
}

interface EditorContextMenuProps {
  x: number;
  y: number;
  groups: ContextMenuGroup[];
  onClose: () => void;
}

const MENU_WIDTH = 236;
const VIEWPORT_MARGIN = 10;

export default function EditorContextMenu({
  x,
  y,
  groups,
  onClose,
}: EditorContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight ?? 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x;
    let top = y;
    if (left + MENU_WIDTH > vw - VIEWPORT_MARGIN)
      left = vw - MENU_WIDTH - VIEWPORT_MARGIN;
    if (top + height > vh - VIEWPORT_MARGIN)
      top = Math.max(VIEWPORT_MARGIN, y - height);
    setPos({ top, left });
  }, [x, y]);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    const t = window.setTimeout(
      () => document.addEventListener("mousedown", onPointer),
      0,
    );
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  const visible = groups.filter((g) => g.items.length > 0);
  if (visible.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className="me-rise-in fixed z-[300] p-1.5 rounded-[10px] bg-[#1c1c1c] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.32)]"
      style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {visible.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && <div className="h-px bg-white/10 my-1" />}
          {group.items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                item.onSelect();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded-[7px] text-125 text-white/85 hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.icon && (
                <span
                  className={`flex-shrink-0 flex items-center ${item.accent ? "text-[#7fc8ff]" : "text-white/50"}`}
                >
                  {item.icon}
                </span>
              )}
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.shortcut && (
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono leading-none text-white/50">
                  {item.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>,
    document.body,
  );
}
