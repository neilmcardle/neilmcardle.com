import { lift, wrapIn } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { liftListItem, wrapInList } from "prosemirror-schema-list";
import type { Command, EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { addLink, setBlockLevel, toggleInline } from "../commands";
import { formatState, sameFormats, type FormatState } from "../formatState";
import { docToHtml, htmlToDoc, isEmptyDoc } from "../html";
import { schema } from "../schema";
import { createEditorState } from "../setup";
import { docText } from "../text";
import { countWords } from "../../model/text";

export type BridgeView = {
  page: string;
  ink: string;
  muted: string;
  accent: string;
  fontPx: number;
};

export type BridgeLoad = {
  html: string;
  placeholder?: string;
  editable?: boolean;
};

export type BridgeCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "quote"
  | "undo"
  | "redo"
  | "link";

export type BridgeMessage =
  | { type: "ready" }
  | { type: "loaded"; words: number }
  | { type: "change"; html: string; words: number }
  | { type: "format"; format: FormatState }
  | { type: "focus"; focused: boolean };

const IDLE_MS = 150;
const MAX_WAIT_MS = 1000;

type Handler = { postMessage: (message: BridgeMessage) => void };

function post(message: BridgeMessage) {
  const handler = (
    window as unknown as {
      webkit?: { messageHandlers?: { makeEbook?: Handler } };
    }
  ).webkit?.messageHandlers?.makeEbook;
  if (handler) handler.postMessage(message);
  else
    window.dispatchEvent(
      new CustomEvent<BridgeMessage>("makeebook:message", { detail: message }),
    );
}

function startOf(state: EditorState) {
  const { $from, from } = state.selection;
  if ($from.depth > 0) return $from;
  return state.doc.resolve(Math.min(from + 1, state.doc.content.size));
}

function inList(state: EditorState, type: "bullet_list" | "ordered_list") {
  const $from = startOf(state);
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type === schema.nodes[type]) return true;
  }
  return false;
}

function inQuote(state: EditorState) {
  const $from = startOf(state);
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type === schema.nodes.blockquote) return true;
  }
  return false;
}

function listToggle(type: "bullet_list" | "ordered_list"): Command {
  return (state, dispatch, view) =>
    inList(state, type)
      ? liftListItem(schema.nodes.list_item)(state, dispatch, view)
      : wrapInList(schema.nodes[type])(state, dispatch, view);
}

const quoteToggle: Command = (state, dispatch, view) =>
  inQuote(state)
    ? lift(state, dispatch, view)
    : wrapIn(schema.nodes.blockquote)(state, dispatch, view);

function commandFor(name: BridgeCommand, arg?: string): Command | null {
  switch (name) {
    case "bold":
    case "italic":
    case "underline":
    case "strikeThrough":
      return toggleInline(name);
    case "paragraph":
      return setBlockLevel(0);
    case "heading1":
      return setBlockLevel(1);
    case "heading2":
      return setBlockLevel(2);
    case "heading3":
      return setBlockLevel(3);
    case "bulletList":
      return listToggle("bullet_list");
    case "orderedList":
      return listToggle("ordered_list");
    case "quote":
      return quoteToggle;
    case "undo":
      return undo;
    case "redo":
      return redo;
    case "link":
      return arg ? addLink(arg) : null;
  }
}

function fullFormat(state: EditorState): FormatState {
  const format = formatState(state);
  if (inList(state, "bullet_list")) format.bulletList = true;
  if (inList(state, "ordered_list")) format.orderedList = true;
  if (inQuote(state)) format.quote = true;
  return format;
}

export function startBridge(mount: HTMLElement) {
  let lastHtml = "";
  let lastFormat: FormatState = {};
  let idle: ReturnType<typeof setTimeout> | null = null;
  let maxWait: ReturnType<typeof setTimeout> | null = null;

  const words = () => countWords(docText(view.state.doc));

  const clearTimers = () => {
    if (idle) clearTimeout(idle);
    if (maxWait) clearTimeout(maxWait);
    idle = null;
    maxWait = null;
  };

  const flush = (): string => {
    clearTimers();
    const html = docToHtml(view.state.doc);
    if (html !== lastHtml) {
      lastHtml = html;
      post({ type: "change", html, words: words() });
    }
    return html;
  };

  const schedule = () => {
    if (idle) clearTimeout(idle);
    idle = setTimeout(flush, IDLE_MS);
    if (!maxWait) maxWait = setTimeout(flush, MAX_WAIT_MS);
  };

  const markEmpty = () => {
    mount.toggleAttribute("data-empty", isEmptyDoc(view.state.doc));
  };

  const publishFormat = () => {
    const next = fullFormat(view.state);
    if (sameFormats(next, lastFormat)) return;
    lastFormat = next;
    post({ type: "format", format: next });
  };

  const freshState = (html: string) =>
    createEditorState(htmlToDoc(html), { onModK: () => false });

  const view = new EditorView(mount, {
    state: freshState(""),
    attributes: { class: "bridge-prose", spellcheck: "true" },
    dispatchTransaction(tr) {
      const next = view.state.apply(tr);
      view.updateState(next);
      if (tr.docChanged) {
        markEmpty();
        schedule();
      }
      publishFormat();
    },
    handleDOMEvents: {
      focus: () => {
        post({ type: "focus", focused: true });
        return false;
      },
      blur: () => {
        flush();
        post({ type: "focus", focused: false });
        return false;
      },
    },
  });

  const api = {
    load({ html, placeholder, editable = true }: BridgeLoad) {
      clearTimers();
      view.updateState(freshState(html));
      lastHtml = docToHtml(view.state.doc);
      view.setProps({ editable: () => editable });
      if (placeholder !== undefined) mount.dataset.placeholder = placeholder;
      markEmpty();
      lastFormat = {};
      publishFormat();
      post({ type: "loaded", words: words() });
    },
    command(name: BridgeCommand, arg?: string): boolean {
      const command = commandFor(name, arg);
      if (!command) return false;
      const done = command(view.state, view.dispatch, view);
      view.focus();
      return done;
    },
    setView(next: BridgeView) {
      const root = document.documentElement.style;
      root.setProperty("--page", next.page);
      root.setProperty("--ink", next.ink);
      root.setProperty("--muted", next.muted);
      root.setProperty("--accent", next.accent);
      root.setProperty("--font-px", `${next.fontPx}px`);
    },
    focus() {
      view.focus();
    },
    blur() {
      (view.dom as HTMLElement).blur();
    },
    flush,
    html: () => docToHtml(view.state.doc),
    words,
  };

  (window as unknown as { makeEbook: typeof api }).makeEbook = api;
  window.addEventListener("pagehide", flush);
  post({ type: "ready" });
  return api;
}

const mount = document.getElementById("editor");
if (mount) startBridge(mount);
