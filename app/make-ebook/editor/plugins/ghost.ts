import {
  Plugin,
  PluginKey,
  type EditorState,
  type Transaction,
} from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const GHOST_CLASS = "me-ghost-anchor";

type GhostState = { pos: number | null; decorations: DecorationSet };

export const ghostKey = new PluginKey<GhostState>("makeebook-ghost");

function anchorWidget() {
  const span = document.createElement("span");
  span.className = GHOST_CLASS;
  span.setAttribute("aria-hidden", "true");
  return span;
}

export function ghostPlugin() {
  return new Plugin<GhostState>({
    key: ghostKey,
    state: {
      init: () => ({ pos: null, decorations: DecorationSet.empty }),
      apply(tr, prev) {
        const meta = tr.getMeta(ghostKey) as { pos: number | null } | undefined;
        if (meta) {
          if (meta.pos == null)
            return { pos: null, decorations: DecorationSet.empty };
          return {
            pos: meta.pos,
            decorations: DecorationSet.create(tr.doc, [
              Decoration.widget(meta.pos, anchorWidget, {
                side: 1,
                ignoreSelection: true,
                key: "ghost",
              }),
            ]),
          };
        }
        if (prev.pos == null || !tr.docChanged) return prev;
        return {
          pos: tr.mapping.map(prev.pos, 1),
          decorations: prev.decorations.map(tr.mapping, tr.doc),
        };
      },
    },
    props: {
      decorations: (state) => ghostKey.getState(state)?.decorations,
    },
  });
}

export function setGhost(tr: Transaction, pos: number | null) {
  return tr.setMeta(ghostKey, { pos });
}

export function ghostPos(state: EditorState): number | null {
  return ghostKey.getState(state)?.pos ?? null;
}
