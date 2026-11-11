import type { InlineMark } from "./commands";
import type { Align } from "./schema";

export type ToolbarAction =
  | { type: "undo" }
  | { type: "redo" }
  | { type: "mark"; mark: InlineMark }
  | { type: "heading"; level: number }
  | { type: "align"; align: Align }
  | { type: "outdent" }
  | { type: "indent" }
  | { type: "endnote" }
  | { type: "link" }
  | { type: "anchor" }
  | { type: "image" }
  | { type: "clear" };

export const HISTORY = [
  {
    action: { type: "undo" } as ToolbarAction,
    title: "Undo",
    icon: "/undo-icon.svg",
  },
  {
    action: { type: "redo" } as ToolbarAction,
    title: "Redo",
    icon: "/redo-icon.svg",
  },
];

export const MARKS: {
  mark: InlineMark;
  label: string;
  title: string;
  className?: string;
}[] = [
  { mark: "bold", label: "B", title: "Bold" },
  { mark: "italic", label: "I", title: "Italic", className: "italic" },
  { mark: "underline", label: "U", title: "Underline", className: "underline" },
  {
    mark: "strikeThrough",
    label: "S",
    title: "Strikethrough",
    className: "line-through",
  },
];

export const HEADINGS = [
  { level: 0, label: "P", title: "Body Text" },
  { level: 1, label: "H1", title: "Heading 1" },
  { level: 2, label: "H2", title: "Heading 2" },
  { level: 3, label: "H3", title: "Heading 3" },
];

export const ALIGNS: {
  align: Align;
  state: string;
  title: string;
  icon: string;
}[] = [
  {
    align: "left",
    state: "justifyLeft",
    title: "Align left",
    icon: "/left-align-icon.svg",
  },
  {
    align: "center",
    state: "justifyCenter",
    title: "Align centre",
    icon: "/centrally-align-icon.svg",
  },
  {
    align: "right",
    state: "justifyRight",
    title: "Align right",
    icon: "/right-align-icon.svg",
  },
];

export const INSERTS = [
  {
    action: { type: "endnote" } as ToolbarAction,
    title: "Insert endnote",
    icon: "/endnote-icon.svg",
    label: "Endnote",
  },
  {
    action: { type: "link" } as ToolbarAction,
    title: "Insert link",
    icon: "/link-icon.svg",
    label: "Link",
  },
  {
    action: { type: "anchor" } as ToolbarAction,
    title: "Insert anchor",
    icon: "/anchor-icon.svg",
    label: "Anchor",
  },
  {
    action: { type: "image" } as ToolbarAction,
    title: "Insert image",
    icon: "/image-icon.svg",
    label: "Image",
  },
];

export const CLEAR = {
  action: { type: "clear" } as ToolbarAction,
  title: "Remove all formatting (bold, italic, etc.)",
  label: "Remove all formatting",
  icon: "/clear-erase-icon.svg",
};

export const INDENTS = [
  {
    action: { type: "outdent" } as ToolbarAction,
    title: "Outdent",
    path: "M7 9l-4 3 4 3",
  },
  {
    action: { type: "indent" } as ToolbarAction,
    title: "Indent",
    path: "M3 9l4 3-4 3",
  },
];

export function insertItem(type: "endnote" | "link" | "anchor" | "image") {
  return INSERTS.find((item) => item.action.type === type)!;
}
