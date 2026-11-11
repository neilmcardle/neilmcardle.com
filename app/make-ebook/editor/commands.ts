import { toggleMark } from "prosemirror-commands";
import {
  Fragment,
  Slice,
  type Mark,
  type MarkType,
  type Node as PMNode,
} from "prosemirror-model";
import {
  TextSelection,
  type Command,
  type EditorState,
  type Transaction,
} from "prosemirror-state";
import { htmlToSlice } from "./html";
import { schema, type Align } from "./schema";

export const INDENT = "  ";

export type InlineMark = "bold" | "italic" | "underline" | "strikeThrough";

export const MARK_FOR: Record<InlineMark, MarkType> = {
  bold: schema.marks.strong,
  italic: schema.marks.em,
  underline: schema.marks.underline,
  strikeThrough: schema.marks.strike,
};

export function toggleInline(name: InlineMark): Command {
  return toggleMark(MARK_FOR[name]);
}

function eachTextblock(
  state: EditorState,
  fn: (node: PMNode, pos: number) => void,
) {
  const { from, to } = state.selection;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isTextblock) {
      fn(node, pos);
      return false;
    }
    return true;
  });
}

export function setBlockLevel(level: number): Command {
  return (state, dispatch) => {
    const tr = state.tr;
    eachTextblock(state, (node, pos) => {
      if (
        node.type !== schema.nodes.paragraph &&
        node.type !== schema.nodes.heading
      )
        return;
      const keep = { align: node.attrs.align, id: node.attrs.id };
      if (level === 0) {
        tr.setNodeMarkup(pos, schema.nodes.paragraph, {
          ...keep,
          endnoteEntryId:
            node.type === schema.nodes.paragraph
              ? node.attrs.endnoteEntryId
              : null,
        });
      } else {
        tr.setNodeMarkup(pos, schema.nodes.heading, { ...keep, level });
      }
    });
    if (!tr.docChanged) return false;
    dispatch?.(tr.scrollIntoView());
    return true;
  };
}

export function setAlign(align: Align): Command {
  return (state, dispatch) => {
    const tr = state.tr;
    eachTextblock(state, (node, pos) => {
      if (!("align" in node.attrs)) return;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
    });
    if (!tr.docChanged) return false;
    dispatch?.(tr);
    return true;
  };
}

export const indentBlock: Command = (state, dispatch) => {
  const { $from } = state.selection;
  if (!$from.parent.isTextblock) return false;
  dispatch?.(state.tr.insertText(INDENT, $from.start()));
  return true;
};

export const outdentBlock: Command = (state, dispatch) => {
  const { $from } = state.selection;
  if (!$from.parent.isTextblock) return false;
  const text = $from.parent.textBetween(
    0,
    Math.min(2, $from.parent.content.size),
    "",
    "￼",
  );
  const count = text.startsWith(INDENT) ? 2 : text.startsWith(" ") ? 1 : 0;
  if (count === 0) return false;
  const start = $from.start();
  dispatch?.(state.tr.delete(start, start + count));
  return true;
};

export const insertIndent: Command = (state, dispatch) => {
  dispatch?.(state.tr.insertText(INDENT).scrollIntoView());
  return true;
};

const FORMAT_MARKS = [
  schema.marks.strong,
  schema.marks.em,
  schema.marks.underline,
  schema.marks.strike,
  schema.marks.subscript,
  schema.marks.superscript,
  schema.marks.code,
];

export const clearFormatting: Command = (state, dispatch) => {
  const { from, to, empty } = state.selection;
  const tr = state.tr;
  if (!empty) FORMAT_MARKS.forEach((type) => tr.removeMark(from, to, type));
  tr.setStoredMarks([]);
  dispatch?.(tr);
  return true;
};

export function addLink(href: string): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty || !href) return false;
    dispatch?.(state.tr.addMark(from, to, schema.marks.link.create({ href })));
    return true;
  };
}

export function insertAnchor(id: string): Command {
  return (state, dispatch) => {
    dispatch?.(
      state.tr.replaceSelectionWith(schema.nodes.anchor.create({ id }), false),
    );
    return true;
  };
}

export function textToInline(
  text: string,
  marks: readonly Mark[] = [],
): PMNode[] {
  const out: PMNode[] = [];
  text.split("\n").forEach((line, i) => {
    if (i > 0) out.push(schema.nodes.hard_break.create());
    if (line) out.push(schema.text(line, marks));
  });
  return out;
}

export function textToSlice(text: string, marks: readonly Mark[] = []): Slice {
  const paragraphs = text.split("\n\n");
  if (paragraphs.length === 1)
    return new Slice(Fragment.from(textToInline(text, marks)), 0, 0);
  const blocks = paragraphs.map((p) =>
    schema.nodes.paragraph.create(null, textToInline(p, marks)),
  );
  return new Slice(Fragment.from(blocks), 1, 1);
}

export function replaceWithText(
  tr: Transaction,
  from: number,
  to: number,
  text: string,
): { from: number; to: number } {
  const $from = tr.doc.resolve(from);
  const marks =
    from === to
      ? $from.marks()
      : ($from.marksAcross(tr.doc.resolve(to)) ?? $from.marks());
  const slice = textToSlice(text, marks);
  tr.replaceRange(from, to, slice);
  const end = tr.mapping.map(to, 1);
  const start = tr.mapping.map(from, -1);
  tr.setSelection(TextSelection.near(tr.doc.resolve(end), -1));
  return { from: start, to: end };
}

export function insertHtmlAt(
  tr: Transaction,
  pos: number,
  html: string,
): number {
  const slice = htmlToSlice(html, "stored");
  tr.replaceRange(pos, pos, slice);
  const end = tr.mapping.map(pos, 1);
  tr.setSelection(TextSelection.near(tr.doc.resolve(end), 1));
  return end;
}

export const FIGURE_STYLE = "margin: 1em 0px; text-align: center;";
export const FIGURE_IMAGE_STYLE =
  "max-width: 100%; display: block; margin: 0px auto;";
export const FIGCAPTION_STYLE =
  "margin-top: 0.5em; font-size: 0.9em; font-style: italic; color: rgb(102, 102, 102);";

export function insertFigureAt(
  tr: Transaction,
  pos: number,
  src: string,
  caption: string,
) {
  const children: PMNode[] = [
    schema.nodes.figure_image.create({
      src,
      alt: caption || "Image",
      style: FIGURE_IMAGE_STYLE,
    }),
  ];
  if (caption) {
    children.push(
      schema.nodes.figcaption.create(
        { style: FIGCAPTION_STYLE },
        schema.text(caption),
      ),
    );
  }
  const figure = schema.nodes.figure.create({ style: FIGURE_STYLE }, children);
  const safePos = Math.max(0, Math.min(pos, tr.doc.content.size));
  tr.replaceRangeWith(safePos, safePos, figure);
  const after = Math.min(tr.mapping.map(safePos, 1), tr.doc.content.size);
  const $after = tr.doc.resolve(after);
  if ($after.depth === 0 && !$after.nodeAfter) {
    tr.insert(tr.doc.content.size, schema.nodes.paragraph.create());
  }
  tr.setSelection(TextSelection.near(tr.doc.resolve(after), 1));
  return tr;
}
