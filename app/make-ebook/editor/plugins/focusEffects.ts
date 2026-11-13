import { Plugin, PluginKey, type EditorState } from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";
import { scrollMotion } from "../../utils/motion";

export type FocusEffects = { typewriter: boolean; paragraphFocus: boolean };

export const focusEffectsKey = new PluginKey<FocusEffects>(
  "makeebook-focus-effects",
);

function focusedBlock(state: EditorState): DecorationSet {
  const { doc, selection } = state;
  if (doc.childCount === 0) return DecorationSet.empty;
  const $head = selection.$head;
  const index = Math.min($head.index(0), doc.childCount - 1);
  let start = 0;
  for (let i = 0; i < index; i++) start += doc.child(i).nodeSize;
  const node = doc.child(index);
  return DecorationSet.create(doc, [
    Decoration.node(start, start + node.nodeSize, {
      "data-para-focused": "true",
    }),
  ]);
}

function scrollContainer(view: EditorView): HTMLElement | null {
  let el: HTMLElement | null = view.dom as HTMLElement;
  while (el && el !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export function keepCaretCentred(view: EditorView) {
  let rect: { top: number };
  try {
    rect = view.coordsAtPos(view.state.selection.head);
  } catch {
    return;
  }
  if (!rect || rect.top === 0) return;
  const container = scrollContainer(view);
  if (!container) return;
  const box = container.getBoundingClientRect();
  const targetY = box.top + box.height * 0.42 - 40;
  const delta = rect.top - targetY;
  if (Math.abs(delta) > 12)
    container.scrollBy({ top: delta, behavior: scrollMotion() });
}

export function focusEffectsPlugin(initial: () => FocusEffects) {
  return new Plugin<FocusEffects>({
    key: focusEffectsKey,
    state: {
      init: () => initial(),
      apply(tr, prev) {
        const next = tr.getMeta(focusEffectsKey) as FocusEffects | undefined;
        return next ?? prev;
      },
    },
    props: {
      decorations(state) {
        const effects = focusEffectsKey.getState(state);
        return effects?.paragraphFocus ? focusedBlock(state) : null;
      },
    },
    view() {
      let frame = 0;
      return {
        update(view, prev) {
          const effects = focusEffectsKey.getState(view.state);
          if (!effects?.typewriter || !view.hasFocus()) return;
          if (
            prev.selection.eq(view.state.selection) &&
            prev.doc === view.state.doc
          )
            return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => keepCaretCentred(view));
        },
        destroy() {
          cancelAnimationFrame(frame);
        },
      };
    },
  });
}
