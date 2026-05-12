"use client";

import { useEffect, useRef, useState } from "react";

interface EditableLabelProps {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  // Single line (default): Enter commits. Multiline: Shift+Enter or Enter inserts newline; only blur commits.
  multiline?: boolean;
  placeholder?: string;
  // Outer wrapper element. Defaults to span.
  as?: "span" | "div";
}

export function EditableLabel({
  value,
  onChange,
  className,
  multiline = false,
  placeholder = "",
  as = "span",
}: EditableLabelProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  }, [editing]);

  function commit() {
    const next = (ref.current?.textContent ?? "").replace(/ /g, " ");
    if (next !== value) onChange(next);
    setEditing(false);
  }

  function cancel() {
    if (ref.current) ref.current.textContent = value;
    setEditing(false);
  }

  function onDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setEditing(true);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  // While editing, swallow drag start on the parent cell.
  function onPointerDown(e: React.PointerEvent) {
    if (editing) e.stopPropagation();
  }

  const Tag = as as "span";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={onDoubleClick}
      onBlur={commit}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      style={{
        outline: editing ? "2px solid rgb(59, 130, 246)" : "none",
        outlineOffset: 2,
        borderRadius: 4,
        cursor: editing ? "text" : "inherit",
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        userSelect: editing ? "text" : "none",
      }}
    >
      {value || placeholder}
    </Tag>
  );
}
