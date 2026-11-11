"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { flushSync } from "react-dom";
import { cleanPastedHtml, plainTextToHtml } from "../utils/pasteCleaner";
import { formatState, sameFormats, type FormatState } from "./formatState";
import { createHandle, rectAt } from "./handle";
import { docToHtml, htmlToDoc, htmlToSlice } from "./html";
import {
  noteFocused,
  noteSelection,
  registerEditor,
  type EditorHandle,
} from "./registry";
import { docText } from "./text";
import { createEditorState } from "./setup";

const IDLE_MS = 150;
const MAX_WAIT_MS = 1000;

export type EditorViewOptions = {
  value: string;
  onChange: (html: string) => void;
  disabled: boolean;
  chapterId?: string;
  externalVersion?: number;
  attributes: Record<string, string>;
  onFocusChange: (focused: boolean) => void;
  onModK: (view: EditorView) => void;
  onSlash: (view: EditorView) => void;
  onContextMenu: (view: EditorView, event: MouseEvent) => boolean;
  onImageFiles: (files: File[], pos: number) => void;
};

function imageFiles(
  list: DataTransferItemList | FileList | null | undefined,
): File[] {
  if (!list) return [];
  const files: File[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i] as DataTransferItem | File;
    if ("kind" in item) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    } else if (item.type.startsWith("image/")) {
      files.push(item);
    }
  }
  return files;
}

export { rectAt };

export function domRangeAt(
  view: EditorView,
  from: number,
  to = from,
): Range | null {
  try {
    const start = view.domAtPos(from);
    const end = view.domAtPos(to);
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range;
  } catch {
    return null;
  }
}

export function useEditorView(options: EditorViewOptions) {
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const handleRef = useRef<EditorHandle | null>(null);
  const lastHtmlRef = useRef(options.value);
  const staleRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedRef = useRef(false);
  const formatsRef = useRef<FormatState>({});
  const [formats, setFormats] = useState<FormatState>({});
  const [focused, setFocused] = useState(false);

  const clearTimers = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    idleTimer.current = null;
    maxTimer.current = null;
  };

  const flush = useCallback((): boolean => {
    const view = viewRef.current;
    clearTimers();
    if (!view || !dirtyRef.current) return false;
    dirtyRef.current = false;
    const html = docToHtml(view.state.doc);
    lastHtmlRef.current = html;
    optionsRef.current.onChange(html);
    return true;
  }, []);

  const scheduleEmit = useCallback(() => {
    dirtyRef.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(flush, IDLE_MS);
    if (!maxTimer.current) maxTimer.current = setTimeout(flush, MAX_WAIT_MS);
  }, [flush]);

  const refreshFormats = useCallback((state: EditorState) => {
    const next = formatState(state);
    if (!sameFormats(next, formatsRef.current)) {
      formatsRef.current = next;
      setFormats(next);
    }
  }, []);

  const freshState = useCallback(
    (html: string) =>
      createEditorState(htmlToDoc(html), {
        onModK: (_state, _dispatch, view) => {
          if (view) optionsRef.current.onModK(view);
          return true;
        },
      }),
    [],
  );

  const loadHtml = useCallback(
    (html: string) => {
      const view = viewRef.current;
      if (!view) return;
      clearTimers();
      dirtyRef.current = false;
      staleRef.current = null;
      lastHtmlRef.current = html;
      view.updateState(freshState(html));
      refreshFormats(view.state);
    },
    [freshState, refreshFormats],
  );

  const publishSelection = (view: EditorView) => {
    const handle = handleRef.current;
    if (!handle || !view.hasFocus()) return;
    const { from, to, empty } = view.state.selection;
    const text = empty ? "" : docText(view.state.doc, from, to);
    noteSelection(handle, text ? { handle, from, to, text } : null);
  };

  const isVisible = () => {
    const dom = viewRef.current?.dom as HTMLElement | undefined;
    return !!dom && dom.isConnected && dom.getClientRects().length > 0;
  };

  const applyStale = useCallback(() => {
    if (staleRef.current !== null && isVisible()) loadHtml(staleRef.current);
  }, [loadHtml]);

  useLayoutEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const view = new EditorView(
      { mount },
      {
        state: freshState(optionsRef.current.value),
        editable: () => !optionsRef.current.disabled,
        attributes: () => optionsRef.current.attributes,
        dispatchTransaction(tr) {
          const current = viewRef.current;
          if (!current) return;
          const prev = current.state;
          const next = prev.apply(tr);
          current.updateState(next);
          if (tr.docChanged) scheduleEmit();
          if (tr.docChanged || !prev.selection.eq(next.selection))
            publishSelection(current);
          if (
            tr.docChanged ||
            tr.selectionSet ||
            tr.storedMarksSet ||
            !prev.selection.eq(next.selection)
          ) {
            refreshFormats(next);
          }
        },
        transformPastedHTML: (html) => cleanPastedHtml(html),
        clipboardTextParser: (text) =>
          htmlToSlice(plainTextToHtml(text), "stored"),
        handlePaste(view, event) {
          const files = imageFiles(event.clipboardData?.items);
          if (files.length === 0) return false;
          event.preventDefault();
          optionsRef.current.onImageFiles(
            files.slice(0, 1),
            view.state.selection.from,
          );
          return true;
        },
        handleDrop(view, event) {
          const files = imageFiles(event.dataTransfer?.files);
          if (files.length === 0) return false;
          event.preventDefault();
          const at = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          optionsRef.current.onImageFiles(
            files,
            at?.pos ?? view.state.selection.from,
          );
          return true;
        },
        handleTextInput(view, _from, _to, text) {
          if (text === "/")
            setTimeout(
              () => !view.isDestroyed && optionsRef.current.onSlash(view),
              0,
            );
          return false;
        },
        handleDOMEvents: {
          focus: () => {
            focusedRef.current = true;
            if (handleRef.current) noteFocused(handleRef.current);
            applyStale();
            setFocused(true);
            optionsRef.current.onFocusChange(true);
            if (viewRef.current) {
              refreshFormats(viewRef.current.state);
              publishSelection(viewRef.current);
            }
            return false;
          },
          blur: () => {
            flush();
            setTimeout(() => {
              const dom = viewRef.current?.dom;
              if (!dom || dom.contains(document.activeElement)) return;
              focusedRef.current = false;
              if (handleRef.current) noteSelection(handleRef.current, null);
              setFocused(false);
              optionsRef.current.onFocusChange(false);
            }, 60);
            return false;
          },
          contextmenu: (view, event) =>
            optionsRef.current.onContextMenu(view, event),
          scroll: (view) => {
            const dom = view.dom as HTMLElement;
            if (dom.scrollLeft !== 0) dom.scrollLeft = 0;
            return false;
          },
        },
      },
    );
    viewRef.current = view;
    refreshFormats(view.state);

    const handle = createHandle({
      viewRef,
      chapterId: () => optionsRef.current.chapterId,
      lastHtml: () => lastHtmlRef.current,
      isVisible,
      applyStale,
      flush,
      loadHtml,
    });
    handleRef.current = handle;
    const unregister = registerEditor(handle);

    const observer = new ResizeObserver(() => applyStale());
    observer.observe(mount);
    const onPageHide = () => {
      if (dirtyRef.current) flushSync(() => flush());
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") onPageHide();
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onHidden);
      observer.disconnect();
      flush();
      unregister();
      handleRef.current = null;
      viewRef.current = null;
      view.destroy();
    };
  }, [applyStale, flush, freshState, loadHtml, refreshFormats, scheduleEmit]);

  useEffect(() => {
    viewRef.current?.setProps({});
  }, [options.disabled, options.attributes]);

  useEffect(() => {
    const { value } = optionsRef.current;
    if (value === lastHtmlRef.current || dirtyRef.current || focusedRef.current)
      return;
    if (!isVisible()) {
      staleRef.current = value;
      return;
    }
    loadHtml(value);
  }, [options.value, focused, loadHtml]);

  const versionRef = useRef(options.externalVersion);
  useEffect(() => {
    if (options.externalVersion === versionRef.current) return;
    versionRef.current = options.externalVersion;
    if (focusedRef.current) return;
    if (!isVisible()) staleRef.current = optionsRef.current.value;
    else loadHtml(optionsRef.current.value);
  }, [options.externalVersion, loadHtml]);

  return { mountRef, viewRef, handleRef, formats, focused, flush };
}
