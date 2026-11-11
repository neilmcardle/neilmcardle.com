import type { Node } from "prosemirror-model";

export function leafText(node: Node): string {
  return node.type.name === "hard_break" ? " " : "";
}

export function docText(doc: Node, from = 0, to = doc.content.size): string {
  return doc.textBetween(from, to, " ", leafText).replace(/\s+/g, " ").trim();
}
