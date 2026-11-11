import type { Node as PMNode } from "prosemirror-model";
import { Transform } from "prosemirror-transform";
import {
  fixDashes,
  fixEllipsis,
  fixPunctuationSpacing,
  removeExtraSpaces,
  smartQuotes,
} from "../utils/typographyFixer";
import { docToHtml, htmlToDoc } from "./html";
import { schema } from "./schema";

export function fixText(text: string): string {
  let fixed = smartQuotes(text);
  fixed = fixDashes(fixed);
  fixed = fixEllipsis(fixed);
  fixed = removeExtraSpaces(fixed);
  return fixPunctuationSpacing(fixed);
}

type Edit = { from: number; to: number; node: PMNode | null };

function collectEdits(doc: PMNode): Edit[] {
  const edits: Edit[] = [];
  doc.descendants((node, pos) => {
    if (node.type.spec.code) return false;
    if (!node.isTextblock) return true;
    let breaks = 0;
    node.forEach((child, offset) => {
      const at = pos + 1 + offset;
      if (child.type === schema.nodes.hard_break) {
        breaks++;
        if (breaks > 2) edits.push({ from: at, to: at + 1, node: null });
        return;
      }
      breaks = 0;
      if (!child.isText || !child.text) return;
      const fixed = fixText(child.text);
      if (fixed !== child.text) {
        edits.push({
          from: at,
          to: at + child.nodeSize,
          node: fixed ? schema.text(fixed, child.marks) : null,
        });
      }
    });
    return false;
  });
  return edits;
}

export function applyTypography(tr: Transform): number {
  const edits = collectEdits(tr.doc);
  for (let i = edits.length - 1; i >= 0; i--) {
    const { from, to, node } = edits[i];
    if (node) tr.replaceWith(from, to, node);
    else tr.delete(from, to);
  }
  return edits.length;
}

export function fixTypographyHtml(html: string): string {
  const tr = new Transform(htmlToDoc(html));
  return applyTypography(tr) > 0 ? docToHtml(tr.doc) : html;
}
