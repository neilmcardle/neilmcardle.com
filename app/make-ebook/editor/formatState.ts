import type { MarkType } from "prosemirror-model";
import type { EditorState } from "prosemirror-state";
import { MARK_FOR, type InlineMark } from "./commands";
import { schema } from "./schema";

export type FormatState = Record<string, boolean>;

function markActive(state: EditorState, type: MarkType): boolean {
  const { from, to, empty, $from } = state.selection;
  if (empty) return !!type.isInSet(state.storedMarks ?? $from.marks());
  return state.doc.rangeHasMark(from, to, type);
}

const ALIGN_KEYS = {
  left: "justifyLeft",
  center: "justifyCenter",
  right: "justifyRight",
  justify: "justifyFull",
} as const;

export function formatState(state: EditorState): FormatState {
  const out: FormatState = {};
  (Object.keys(MARK_FOR) as InlineMark[]).forEach((name) => {
    if (markActive(state, MARK_FOR[name])) out[name] = true;
  });
  const parent = state.selection.$from.parent;
  if (parent.type === schema.nodes.heading)
    out[`heading${parent.attrs.level}`] = true;
  else out.heading0 = true;
  const align = parent.attrs.align as
    keyof typeof ALIGN_KEYS | null | undefined;
  if (align && ALIGN_KEYS[align]) out[ALIGN_KEYS[align]] = true;
  return out;
}

export function sameFormats(a: FormatState, b: FormatState): boolean {
  const ak = Object.keys(a);
  if (ak.length !== Object.keys(b).length) return false;
  return ak.every((k) => b[k] === a[k]);
}
