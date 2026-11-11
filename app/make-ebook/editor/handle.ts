import { closeHistory, redo, undo } from "prosemirror-history";
import type { Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { replaceWithText } from "./commands";
import { htmlToDoc } from "./html";
import {
  findKey,
  findMatches,
  replaceMatches,
  type FindQuery,
} from "./plugins/find";
import { focusEffectsKey, type FocusEffects } from "./plugins/focusEffects";
import { ghostPos, setGhost } from "./plugins/ghost";
import {
  addHighlight,
  removeHighlight,
  trackRange,
  trackedRange,
  untrackRange,
} from "./plugins/marks";
import type { EditorHandle } from "./registry";
import { applyTypography } from "./typography";

const HIGHLIGHT_MS = 2200;
const SENTENCE_END = /[.!?]\s*$/;

let nextId = 0;
const newId = (prefix: string) => `${prefix}-${Date.now()}-${++nextId}`;

export function rectAt(view: EditorView, pos: number): DOMRect | null {
  try {
    const c = view.coordsAtPos(pos);
    return new DOMRect(
      c.left,
      c.top,
      Math.max(0, c.right - c.left),
      c.bottom - c.top,
    );
  } catch {
    return null;
  }
}

export type HandleContext = {
  viewRef: { current: EditorView | null };
  chapterId: () => string | undefined;
  lastHtml: () => string;
  isVisible: () => boolean;
  applyStale: () => void;
  flush: () => boolean;
  loadHtml: (html: string) => void;
};

export function createHandle(ctx: HandleContext): EditorHandle {
  const { viewRef, isVisible, applyStale, flush, loadHtml } = ctx;

  const run = (tr: Transaction) => {
    const view = viewRef.current;
    if (!view) return;
    closeHistory(tr);
    view.dispatch(tr);
    view.dispatch(closeHistory(view.state.tr));
  };

  const fadeHighlight = (id: string) => {
    setTimeout(() => {
      const view = viewRef.current;
      if (view && !view.isDestroyed) {
        view.dispatch(removeHighlight(view.state.tr, id));
      }
    }, HIGHLIGHT_MS);
  };

  return {
    get chapterId() {
      return ctx.chapterId();
    },
    view: () => viewRef.current,
    isVisible,
    hasFocus: () => !!viewRef.current?.hasFocus(),
    focus: () => {
      applyStale();
      viewRef.current?.focus();
    },
    flush,
    getHTML: () => {
      flush();
      return ctx.lastHtml();
    },
    setHTML: (html, opts) => {
      const v = viewRef.current;
      if (!v) return;
      if (!opts?.undoable) {
        loadHtml(html);
        return;
      }
      const tr = v.state.tr.replaceWith(
        0,
        v.state.doc.content.size,
        htmlToDoc(html).content,
      );
      run(tr);
      flush();
    },
    selection: () => {
      const v = viewRef.current;
      if (!v) return null;
      const { from, to, empty } = v.state.selection;
      return {
        from,
        to,
        empty,
        text: v.state.doc.textBetween(from, to, "\n"),
      };
    },
    positionsOf: (range) => {
      const v = viewRef.current;
      if (!v || !range || !v.dom.contains(range.startContainer)) {
        if (!v) return null;
        const { from, to } = v.state.selection;
        return { from, to };
      }
      try {
        const from = v.posAtDOM(range.startContainer, range.startOffset);
        const to = v.posAtDOM(range.endContainer, range.endOffset);
        return { from: Math.min(from, to), to: Math.max(from, to) };
      } catch {
        const { from, to } = v.state.selection;
        return { from, to };
      }
    },
    track: (from, to) => {
      const id = newId("track");
      const v = viewRef.current;
      if (v) v.dispatch(trackRange(v.state.tr, id, from, to));
      return id;
    },
    tracked: (id) => {
      const v = viewRef.current;
      return v ? trackedRange(v.state, id) : null;
    },
    untrack: (id) => {
      const v = viewRef.current;
      if (v) v.dispatch(untrackRange(v.state.tr, id));
    },
    replaceRange: (from, to, text, opts) => {
      const v = viewRef.current;
      if (!v) return false;
      const size = v.state.doc.content.size;
      const tr = v.state.tr;
      const range = replaceWithText(
        tr,
        Math.min(from, size),
        Math.min(to, size),
        text,
      );
      const id = newId("bm-edit");
      if (opts?.highlight) addHighlight(tr, id, range.from, range.to);
      run(tr.scrollIntoView());
      if (opts?.highlight) fadeHighlight(id);
      return true;
    },
    insertCompose: (text, at) => {
      const v = viewRef.current;
      if (!v) return false;
      const state = v.state;
      const pos = Math.min(at ?? state.selection.from, state.doc.content.size);
      const slash =
        pos > 0 && state.doc.textBetween(pos - 1, pos, "", "") === "/";
      const from = slash ? pos - 1 : pos;
      const to = at == null ? Math.max(pos, state.selection.to) : pos;
      const tr = state.tr;
      const range = replaceWithText(tr, from, to, text);
      const id = newId("bm-compose");
      addHighlight(tr, id, range.from, range.to);
      run(tr.scrollIntoView());
      fadeHighlight(id);
      return true;
    },
    setGhostAnchor: () => {
      const v = viewRef.current;
      if (!v) return null;
      const pos = v.state.selection.head;
      v.dispatch(setGhost(v.state.tr, pos));
      return rectAt(v, pos);
    },
    clearGhostAnchor: () => {
      const v = viewRef.current;
      if (v && ghostPos(v.state) != null)
        v.dispatch(setGhost(v.state.tr, null));
    },
    insertAtGhost: (text) => {
      const v = viewRef.current;
      if (!v) return false;
      const pos = ghostPos(v.state) ?? v.state.selection.head;
      const tr = v.state.tr;
      replaceWithText(tr, pos, pos, text);
      setGhost(tr, null);
      run(tr.scrollIntoView());
      return true;
    },
    caretContext: () => {
      const v = viewRef.current;
      if (!v || !v.hasFocus() || !v.state.selection.empty) return null;
      const { $head, head } = v.state.selection;
      if (!$head.parent.isTextblock) return null;
      const rect = rectAt(v, head);
      if (!rect || rect.height === 0) return null;
      const textBefore = $head.parent.textBetween(
        0,
        $head.parentOffset,
        "",
        "￼",
      );
      return {
        rect,
        textBefore,
        atEnd: SENTENCE_END.test(textBefore.trimEnd()),
      };
    },
    undo: () => {
      const v = viewRef.current;
      return v ? undo(v.state, v.dispatch) : false;
    },
    redo: () => {
      const v = viewRef.current;
      return v ? redo(v.state, v.dispatch) : false;
    },
    docVersion: () => viewRef.current?.state.doc,
    countMatches: (query: FindQuery) => {
      const v = viewRef.current;
      return v ? findMatches(v.state.doc, query).length : 0;
    },
    replaceAll: (query, replacement) => {
      const v = viewRef.current;
      if (!v) return 0;
      const matches = findMatches(v.state.doc, query);
      if (matches.length === 0) return 0;
      run(replaceMatches(v.state.tr, matches, replacement));
      flush();
      return matches.length;
    },
    fixTypography: () => {
      const v = viewRef.current;
      if (!v) return 0;
      const tr = v.state.tr;
      const count = applyTypography(tr);
      if (count > 0) {
        run(tr);
        flush();
      }
      return count;
    },
    applyFocusEffects: (effects: FocusEffects) => {
      const v = viewRef.current;
      if (v) v.dispatch(v.state.tr.setMeta(focusEffectsKey, effects));
    },
    applyFind: (query: FindQuery) => {
      const v = viewRef.current;
      if (v) v.dispatch(v.state.tr.setMeta(findKey, query));
    },
  };
}
