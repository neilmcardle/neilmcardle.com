import type { Node as PMNode } from "prosemirror-model";
import { Plugin, PluginKey, type EditorState } from "prosemirror-state";
import type { Transform } from "prosemirror-transform";
import { Decoration, DecorationSet } from "prosemirror-view";

export const FIND_CLASS = "find-match";

export type FindQuery = { term: string; caseSensitive: boolean };

export type Match = { from: number; to: number };

const LEAF = "￼";

function pattern({ term, caseSensitive }: FindQuery): RegExp | null {
  if (!term) return null;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, caseSensitive ? "g" : "gi");
}

export function findMatches(doc: PMNode, query: FindQuery): Match[] {
  const regex = pattern(query);
  if (!regex) return [];
  const matches: Match[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    let text = "";
    node.forEach((child) => {
      text += child.isText ? child.text : LEAF;
    });
    const start = pos + 1;
    regex.lastIndex = 0;
    let found: RegExpExecArray | null;
    while ((found = regex.exec(text))) {
      if (found[0].length === 0) {
        regex.lastIndex++;
        continue;
      }
      matches.push({
        from: start + found.index,
        to: start + found.index + found[0].length,
      });
    }
    return false;
  });
  return matches;
}

export function replaceMatches<T extends Transform>(
  tr: T,
  matches: Match[],
  replacement: string,
): T {
  for (let i = matches.length - 1; i >= 0; i--) {
    const { from, to } = matches[i];
    if (replacement) {
      const marks = tr.doc.resolve(from).marksAcross(tr.doc.resolve(to)) ?? [];
      tr.replaceWith(from, to, tr.doc.type.schema.text(replacement, marks));
    } else {
      tr.delete(from, to);
    }
  }
  return tr;
}

type FindState = { query: FindQuery; decorations: DecorationSet };

export const findKey = new PluginKey<FindState>("makeebook-find");

function decorate(doc: PMNode, query: FindQuery): DecorationSet {
  const matches = findMatches(doc, query);
  if (matches.length === 0) return DecorationSet.empty;
  return DecorationSet.create(
    doc,
    matches.map((m) => Decoration.inline(m.from, m.to, { class: FIND_CLASS })),
  );
}

export function findPlugin(initial: () => FindQuery) {
  return new Plugin<FindState>({
    key: findKey,
    state: {
      init: (_, state) => {
        const query = initial();
        return { query, decorations: decorate(state.doc, query) };
      },
      apply(tr, prev) {
        const next = tr.getMeta(findKey) as FindQuery | undefined;
        if (next) return { query: next, decorations: decorate(tr.doc, next) };
        if (!tr.docChanged || !prev.query.term) return prev;
        return { query: prev.query, decorations: decorate(tr.doc, prev.query) };
      },
    },
    props: {
      decorations: (state: EditorState) => findKey.getState(state)?.decorations,
    },
  });
}
