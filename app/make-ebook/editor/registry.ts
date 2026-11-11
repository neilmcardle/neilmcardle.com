import type { EditorView } from "prosemirror-view";
import type { FindQuery } from "./plugins/find";
import type { FocusEffects } from "./plugins/focusEffects";

export type CaretContext = {
  rect: DOMRect;
  textBefore: string;
  atEnd: boolean;
};

export type EditorHandle = {
  readonly chapterId: string | undefined;
  view(): EditorView | null;
  isVisible(): boolean;
  hasFocus(): boolean;
  focus(): void;
  flush(): boolean;
  getHTML(): string;
  setHTML(html: string, options?: { undoable?: boolean }): void;
  selection(): {
    from: number;
    to: number;
    empty: boolean;
    text: string;
  } | null;
  positionsOf(
    range: Range | null | undefined,
  ): { from: number; to: number } | null;
  track(from: number, to: number): string;
  tracked(id: string): { from: number; to: number } | null;
  untrack(id: string): void;
  replaceRange(
    from: number,
    to: number,
    text: string,
    options?: { highlight?: boolean },
  ): boolean;
  insertCompose(text: string, at?: number | null): boolean;
  setGhostAnchor(): DOMRect | null;
  clearGhostAnchor(): void;
  insertAtGhost(text: string): boolean;
  caretContext(): CaretContext | null;
  undo(): boolean;
  redo(): boolean;
  docVersion(): unknown;
  countMatches(query: FindQuery): number;
  replaceAll(query: FindQuery, replacement: string): number;
  fixTypography(): number;
  applyFocusEffects(effects: FocusEffects): void;
  applyFind(query: FindQuery): void;
};

const handles = new Set<EditorHandle>();
let lastFocused: EditorHandle | null = null;

let focusEffects: FocusEffects = { typewriter: false, paragraphFocus: false };
let findQuery: FindQuery = { term: "", caseSensitive: false };

export function registerEditor(handle: EditorHandle) {
  handles.add(handle);
  return () => {
    handles.delete(handle);
    if (lastFocused === handle) lastFocused = null;
    noteSelection(handle, null);
  };
}

export type EditorSelection = {
  handle: EditorHandle;
  from: number;
  to: number;
  text: string;
};

let currentSelection: EditorSelection | null = null;
const selectionListeners = new Set<
  (selection: EditorSelection | null) => void
>();

function sameSelection(a: EditorSelection | null, b: EditorSelection | null) {
  return (
    a === b ||
    (!!a &&
      !!b &&
      a.handle === b.handle &&
      a.from === b.from &&
      a.to === b.to &&
      a.text === b.text)
  );
}

export function noteSelection(
  handle: EditorHandle,
  selection: EditorSelection | null,
) {
  if (!selection && currentSelection && currentSelection.handle !== handle)
    return;
  if (sameSelection(currentSelection, selection)) return;
  currentSelection = selection;
  selectionListeners.forEach((listener) => listener(selection));
}

export function currentEditorSelection(): EditorSelection | null {
  return currentSelection;
}

export function subscribeSelection(
  listener: (selection: EditorSelection | null) => void,
): () => void {
  selectionListeners.add(listener);
  return () => {
    selectionListeners.delete(listener);
  };
}

export function noteFocused(handle: EditorHandle) {
  lastFocused = handle;
}

export function activeEditor(): EditorHandle | null {
  if (lastFocused && handles.has(lastFocused) && lastFocused.isVisible())
    return lastFocused;
  for (const handle of handles) if (handle.isVisible()) return handle;
  return null;
}

export function editorForChapter(
  chapterId: string | undefined,
): EditorHandle | null {
  if (!chapterId) return null;
  const active = activeEditor();
  if (active?.chapterId === chapterId) return active;
  for (const handle of handles) {
    if (handle.chapterId === chapterId && handle.isVisible()) return handle;
  }
  return null;
}

export function flushEditors(): boolean {
  let flushed = false;
  handles.forEach((handle) => {
    if (handle.flush()) flushed = true;
  });
  return flushed;
}

export function currentFocusEffects(): FocusEffects {
  return focusEffects;
}

export function setFocusEffect(name: keyof FocusEffects, on: boolean) {
  if (focusEffects[name] === on) return;
  focusEffects = { ...focusEffects, [name]: on };
  handles.forEach((handle) => handle.applyFocusEffects(focusEffects));
}

export function currentFindQuery(): FindQuery {
  return findQuery;
}

export function setFindQuery(query: FindQuery) {
  if (
    query.term === findQuery.term &&
    query.caseSensitive === findQuery.caseSensitive
  )
    return;
  findQuery = query;
  handles.forEach((handle) => handle.applyFind(findQuery));
}
