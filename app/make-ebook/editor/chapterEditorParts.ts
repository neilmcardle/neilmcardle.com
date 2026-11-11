import type { HTMLAttributes } from "react";
import { useEffect, useState } from "react";
import type { EditorView } from "prosemirror-view";
import { textStats } from "../model/text";
import { rectAt } from "./handle";

export type ChapterEditorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
  showWordCount?: boolean;
  onFocusStateChange?: (focused: boolean) => void;
  className?: string;
  externalVersion?: number;
  onCreateEndnote?: (selectedText: string, chapterId?: string) => string;
  chapterId?: string;
  hasEndnotes?: boolean;
  hideToolbar?: boolean;
  contentClassName?: string;
  onInlineEditRequest?: (args: {
    selectedText: string;
    range: Range;
    rect: DOMRect;
    instruction?: string;
  }) => void;
  onComposeRequest?: (args: { range: Range; rect: DOMRect }) => void;
};

export const EMPTY_VALUES = new Set([
  "",
  "<p><br></p>",
  "<p></p>",
  "<br>",
  "<br/>",
]);

export function countWords(html: string) {
  const { text, words } = textStats(html);
  return { words, chars: text.length };
}

export function useReadingProgress(viewRef: { current: EditorView | null }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = viewRef.current?.dom as HTMLElement | undefined;
    if (!el) return;
    const read = () => {
      const range = el.scrollHeight - el.clientHeight;
      setProgress(
        range > 8 ? Math.min(1, Math.max(0, el.scrollTop / range)) : 0,
      );
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    el.addEventListener("input", read);
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      el.removeEventListener("input", read);
      observer.disconnect();
    };
  }, [viewRef]);
  return progress;
}

export function selectionRect(view: EditorView, range: Range | null): DOMRect {
  const { empty, head } = view.state.selection;
  if (!empty && range) return range.getBoundingClientRect();
  return rectAt(view, head) ?? new DOMRect();
}
