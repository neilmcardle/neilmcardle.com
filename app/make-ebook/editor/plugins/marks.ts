import {
  Plugin,
  PluginKey,
  type EditorState,
  type Transaction,
} from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const HIGHLIGHT_CLASS = "bm-edit-highlight";

type Range = { from: number; to: number };

type MarksState = {
  highlights: DecorationSet;
  tracked: Map<string, Range>;
};

type MarksMeta =
  | { type: "highlight"; id: string; from: number; to: number }
  | { type: "unhighlight"; id: string }
  | { type: "track"; id: string; from: number; to: number }
  | { type: "untrack"; id: string };

export const marksKey = new PluginKey<MarksState>("makeebook-marks");

export function marksPlugin() {
  return new Plugin<MarksState>({
    key: marksKey,
    state: {
      init: () => ({ highlights: DecorationSet.empty, tracked: new Map() }),
      apply(tr, prev) {
        let highlights = prev.highlights.map(tr.mapping, tr.doc);
        let tracked = prev.tracked;
        if (tr.docChanged && tracked.size > 0) {
          tracked = new Map();
          prev.tracked.forEach((range, id) => {
            const from = tr.mapping.map(range.from, -1);
            const to = Math.max(from, tr.mapping.map(range.to, 1));
            tracked.set(id, { from, to });
          });
        }
        const meta = tr.getMeta(marksKey) as MarksMeta | undefined;
        if (meta?.type === "highlight" && meta.to > meta.from) {
          highlights = highlights.add(tr.doc, [
            Decoration.inline(
              meta.from,
              meta.to,
              { class: HIGHLIGHT_CLASS },
              { id: meta.id },
            ),
          ]);
        } else if (meta?.type === "unhighlight") {
          highlights = highlights.remove(
            highlights.find(
              undefined,
              undefined,
              (spec) => spec.id === meta.id,
            ),
          );
        } else if (meta?.type === "track") {
          tracked = new Map(tracked);
          tracked.set(meta.id, { from: meta.from, to: meta.to });
        } else if (meta?.type === "untrack") {
          tracked = new Map(tracked);
          tracked.delete(meta.id);
        }
        return { highlights, tracked };
      },
    },
    props: {
      decorations: (state) => marksKey.getState(state)?.highlights,
    },
  });
}

export function addHighlight(
  tr: Transaction,
  id: string,
  from: number,
  to: number,
) {
  return tr.setMeta(marksKey, { type: "highlight", id, from, to });
}

export function removeHighlight(tr: Transaction, id: string) {
  return tr.setMeta(marksKey, { type: "unhighlight", id });
}

export function trackRange(
  tr: Transaction,
  id: string,
  from: number,
  to: number,
) {
  return tr.setMeta(marksKey, { type: "track", id, from, to });
}

export function untrackRange(tr: Transaction, id: string) {
  return tr.setMeta(marksKey, { type: "untrack", id });
}

export function trackedRange(state: EditorState, id: string): Range | null {
  return marksKey.getState(state)?.tracked.get(id) ?? null;
}
