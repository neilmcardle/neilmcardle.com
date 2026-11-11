import type { EditorView } from "prosemirror-view";

export function domRangeAt(
  view: EditorView,
  from: number,
  to = from,
): Range | null {
  try {
    const start = view.domAtPos(from);
    const end = view.domAtPos(to);
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range;
  } catch {
    return null;
  }
}
