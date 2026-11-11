"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
} from "react";
import type { Command } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { redo, undo } from "prosemirror-history";
import { useTheme } from "../../../lib/contexts/ThemeContext";
import EditorContextMenu from "../components/EditorContextMenu";
import { useIsMac } from "../components/PlatformKey";
import {
  addLink,
  clearFormatting,
  indentBlock,
  insertAnchor,
  insertFigureAt,
  insertHtmlAt,
  outdentBlock,
  setAlign,
  setBlockLevel,
  toggleInline,
} from "./commands";
import { contextGroups, type ContextTarget } from "./contextMenu";
import { EndnoteDialog, ImageCaptionDialog } from "./EditorDialogs";
import EditorStyles from "./EditorStyles";
import { textStats } from "../model/text";
import {
  copySelection,
  promptForAnchor,
  promptForLink,
  readImageFile,
} from "./insert";
import type { EditorHandle } from "./registry";
import { CompactToolbar, Toolbar } from "./Toolbar";
import type { ToolbarAction } from "./toolbarItems";
import { domRangeAt, rectAt, useEditorView } from "./useEditorView";

export type ChapterEditorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
  showWordCount?: boolean;
  onFocusStateChange?: (focused: boolean) => void;
  className?: string;
  externalVersion?: number;
  onCreateEndnote?: (selectedText: string, chapterId?: string) => string;
  chapterId?: string;
  hasEndnotes?: boolean;
  hideToolbar?: boolean;
  contentClassName?: string;
  onInlineEditRequest?: (args: {
    selectedText: string;
    range: Range;
    rect: DOMRect;
    instruction?: string;
  }) => void;
  onComposeRequest?: (args: { range: Range; rect: DOMRect }) => void;
};

const EMPTY_VALUES = new Set(["", "<p><br></p>", "<p></p>", "<br>", "<br/>"]);

function countWords(html: string) {
  const { text, words } = textStats(html);
  return { words, chars: text.length };
}

function useReadingProgress(viewRef: { current: EditorView | null }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = viewRef.current?.dom as HTMLElement | undefined;
    if (!el) return;
    const read = () => {
      const range = el.scrollHeight - el.clientHeight;
      setProgress(
        range > 8 ? Math.min(1, Math.max(0, el.scrollTop / range)) : 0,
      );
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    el.addEventListener("input", read);
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      el.removeEventListener("input", read);
      observer.disconnect();
    };
  }, [viewRef]);
  return progress;
}

function selectionRect(view: EditorView, range: Range | null): DOMRect {
  const { empty, head } = view.state.selection;
  if (!empty && range) return range.getBoundingClientRect();
  return rectAt(view, head) ?? new DOMRect();
}

const ChapterEditor = forwardRef<EditorHandle | null, ChapterEditorProps>(
  function ChapterEditor(
    {
      value,
      onChange,
      disabled = false,
      placeholder = "Start writing...",
      minHeight = 300,
      showWordCount = false,
      onFocusStateChange,
      className = "",
      externalVersion,
      onCreateEndnote,
      chapterId,
      hasEndnotes = false,
      hideToolbar = false,
      contentClassName,
      onInlineEditRequest,
      onComposeRequest,
      ...rest
    },
    ref,
  ) {
    const { theme } = useTheme();
    const isMac = useIsMac();
    const modKey = isMac ? "⌘" : "Ctrl+";
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const initialViewportHeight = useRef<number | null>(null);
    const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
    const [showCompactToolbar, setShowCompactToolbar] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [endnoteAt, setEndnoteAt] = useState<number | null>(null);
    const [images, setImages] = useState<{ src: string; pos: number }[]>([]);
    const [contextMenu, setContextMenu] = useState<ContextTarget | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((msg: string) => {
      setToast(msg);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    }, []);

    const callbacks = useRef({
      onInlineEditRequest,
      onComposeRequest,
      onFocusStateChange,
    });
    useLayoutEffect(() => {
      callbacks.current = {
        onInlineEditRequest,
        onComposeRequest,
        onFocusStateChange,
      };
    });

    const editorClass = `editor-root focus:outline-none whitespace-pre-wrap break-words w-full max-w-full overflow-x-hidden ${contentClassName ?? "p-6 text-base overflow-y-auto flex-1 min-h-0"}`;
    const editorMinHeight = Math.max(minHeight, 200);
    const attributes = useMemo(
      () => ({
        "data-testid": "chapter-editor",
        class: editorClass,
        style: `min-height: ${editorMinHeight}px; position: relative; contain: layout style;`,
        "aria-disabled": String(disabled),
        spellcheck: "true",
      }),
      [editorClass, editorMinHeight, disabled],
    );

    const queueImages = useCallback((files: File[], pos: number) => {
      files.forEach((file) => {
        void readImageFile(file).then((src) => {
          if (src) setImages((prev) => [...prev, { src, pos }]);
        });
      });
    }, []);

    const { mountRef, viewRef, handleRef, formats, focused, flush } =
      useEditorView({
        value,
        onChange,
        disabled,
        chapterId,
        externalVersion,
        attributes,
        onFocusChange: (isFocused) => {
          callbacks.current.onFocusStateChange?.(isFocused);
          if (isFocused) {
            if (window.innerWidth < 900) setShowCompactToolbar(true);
            return;
          }
          setShowCompactToolbar(false);
          if (window.innerWidth < 1024) {
            initialViewportHeight.current = null;
            setTimeout(
              () => window.scrollTo(window.scrollX, window.scrollY),
              100,
            );
          }
        },
        onModK: (view) => {
          const { from, to, empty } = view.state.selection;
          const range = domRangeAt(view, from, to);
          if (!range) return;
          const selectedText = view.state.doc
            .textBetween(from, to, "\n")
            .trim();
          const { onInlineEditRequest: edit, onComposeRequest: compose } =
            callbacks.current;
          if (!empty && selectedText && edit) {
            edit({ selectedText, range, rect: selectionRect(view, range) });
          } else if (empty && compose) {
            compose({ range, rect: selectionRect(view, range) });
          }
        },
        onSlash: (view) => {
          const compose = callbacks.current.onComposeRequest;
          const { empty, $head, head } = view.state.selection;
          if (!compose || !empty || !$head.parent.isTextblock) return;
          const before = $head.parent.textBetween(
            0,
            $head.parentOffset,
            "",
            "￼",
          );
          if (before.trimStart() !== "/") return;
          const range = domRangeAt(view, head);
          if (range) compose({ range, rect: selectionRect(view, range) });
        },
        onContextMenu: (_view, event) => {
          if (disabled) return false;
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return false;
          const range = sel.getRangeAt(0);
          event.preventDefault();
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            selectedText: sel.isCollapsed ? "" : sel.toString().trim(),
            range: range.cloneRange(),
            rect: range.getBoundingClientRect(),
          });
          return true;
        },
        onImageFiles: queueImages,
      });
    const progress = useReadingProgress(viewRef);

    useImperativeHandle(ref, () => handleRef.current as EditorHandle, [
      handleRef,
    ]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const isMobile =
        window.matchMedia("(max-width: 1023px)").matches &&
        "ontouchstart" in window;
      if (!isMobile) return;
      const viewport = window.visualViewport;
      if (!viewport) return;
      if (initialViewportHeight.current === null)
        initialViewportHeight.current = viewport.height;
      const handleResize = () => {
        if (initialViewportHeight.current === null) return;
        const keyboardOpen =
          initialViewportHeight.current - viewport.height > 150;
        setIsMobileKeyboardOpen(keyboardOpen);
        if (keyboardOpen && focused) setShowCompactToolbar(true);
      };
      viewport.addEventListener("resize", handleResize);
      return () => viewport.removeEventListener("resize", handleResize);
    }, [focused]);

    const command = useCallback(
      (cmd: Command) => {
        const view = viewRef.current;
        if (!view || disabled) return;
        view.focus();
        cmd(view.state, view.dispatch, view);
      },
      [disabled, viewRef],
    );

    const openEndnote = useCallback(() => {
      const view = viewRef.current;
      if (disabled || !onCreateEndnote || !view) return;
      setEndnoteAt(view.state.selection.from);
    }, [disabled, onCreateEndnote, viewRef]);

    const addEndnote = (content: string) => {
      const view = viewRef.current;
      const at = endnoteAt;
      setEndnoteAt(null);
      if (!view || at === null || !onCreateEndnote) return;
      const link = onCreateEndnote(content, chapterId);
      if (link && link.trim()) {
        const tr = view.state.tr;
        insertHtmlAt(tr, Math.min(at, tr.doc.content.size), link);
        view.dispatch(tr.scrollIntoView());
        flush();
      }
      view.focus();
    };

    const insertLink = useCallback(() => {
      const view = viewRef.current;
      if (disabled || !view) return;
      if (view.state.selection.empty) {
        showToast("Please select some text to turn into a link.");
        return;
      }
      const url = promptForLink();
      if (url) command(addLink(url));
    }, [command, disabled, showToast, viewRef]);

    const insertAnchorId = useCallback(() => {
      if (disabled) return;
      const id = promptForAnchor();
      if (!id) return;
      command(insertAnchor(id));
      showToast(`Anchor created! Link to it with: #${id}`);
    }, [command, disabled, showToast]);

    const chooseImage = useCallback(() => {
      if (!disabled) fileInputRef.current?.click();
    }, [disabled]);

    const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const view = viewRef.current;
      if (file && view) queueImages([file], view.state.selection.from);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const addImage = (caption: string) => {
      const view = viewRef.current;
      const next = images[0];
      setImages((prev) => prev.slice(1));
      if (!view || !next) return;
      const tr = view.state.tr;
      insertFigureAt(tr, next.pos, next.src, caption);
      view.dispatch(tr.scrollIntoView());
      view.focus();
    };

    const onAction = (action: ToolbarAction) => {
      switch (action.type) {
        case "undo":
          return command(undo);
        case "redo":
          return command(redo);
        case "mark":
          return command(toggleInline(action.mark));
        case "heading":
          return command(setBlockLevel(action.level));
        case "align":
          return command(setAlign(action.align));
        case "outdent":
          return command(outdentBlock);
        case "indent":
          return command(indentBlock);
        case "endnote":
          return openEndnote();
        case "link":
          return insertLink();
        case "anchor":
          return insertAnchorId();
        case "image":
          return chooseImage();
        case "clear":
          return command(clearFormatting);
      }
    };

    const { words, chars } = useMemo(
      () => (showWordCount ? countWords(value) : { words: 0, chars: 0 }),
      [showWordCount, value],
    );

    const showPlaceholder = !focused && EMPTY_VALUES.has(value);

    return (
      <div
        className={`relative border-none bg-transparent flex flex-col editor-root h-full overflow-hidden ${className}`}
        {...rest}
      >
        {toast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-[var(--ink-deep)] text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            {toast}
          </div>
        )}

        {!hideToolbar && (
          <div
            className={`transition-all duration-200 overflow-visible ${
              isMobileKeyboardOpen ? "lg:block hidden" : ""
            }`}
          >
            <Toolbar
              progress={progress}
              formats={formats}
              disabled={disabled}
              canEndnote={!!onCreateEndnote}
              onAction={onAction}
            />
          </div>
        )}

        {!hideToolbar && showCompactToolbar && (
          <CompactToolbar
            formats={formats}
            disabled={disabled}
            canEndnote={!!onCreateEndnote}
            onAction={onAction}
            dark={theme === "dark"}
            showMore={showMoreMenu}
            onToggleMore={() => setShowMoreMenu((open) => !open)}
            onDone={() => {
              (viewRef.current?.dom as HTMLElement | undefined)?.blur();
              setShowCompactToolbar(false);
              setShowMoreMenu(false);
            }}
          />
        )}

        <div className="flex-1 min-w-0 relative flex flex-col min-h-0">
          {showPlaceholder && (
            <div className="absolute left-6 top-6 text-[var(--clay-muted)] text-lg pointer-events-none select-none z-10">
              {placeholder}
            </div>
          )}
          <div ref={mountRef} />
          <EditorStyles />
          {showWordCount && (
            <div className="px-4 pb-2 text-3xs text-[var(--clay-muted)] dark:text-[var(--clay-muted)] flex justify-between items-center select-none">
              <div className="lg:hidden flex items-center space-x-2">
                <a
                  href="https://makeebook.ink/terms"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms
                </a>
                <span className="text-[var(--clay)]">|</span>
                <a
                  href="https://makeebook.ink/privacy"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy
                </a>
              </div>
              <div className="hidden lg:block"></div>
              <div>
                Words: {words} | Characters: {chars}
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={onFileChosen}
            tabIndex={-1}
          />
        </div>

        {endnoteAt !== null && (
          <EndnoteDialog
            hasEndnotes={hasEndnotes}
            onAdd={addEndnote}
            onClose={() => setEndnoteAt(null)}
          />
        )}

        {images.length > 0 && (
          <ImageCaptionDialog
            key={images[0].src.length + images.length}
            onAdd={addImage}
            onClose={() => setImages((prev) => prev.slice(1))}
          />
        )}

        {contextMenu && (
          <EditorContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            groups={contextGroups(contextMenu, {
              modKey,
              onInlineEditRequest,
              onComposeRequest,
              canEndnote: !!onCreateEndnote,
              bold: () => command(toggleInline("bold")),
              italic: () => command(toggleInline("italic")),
              endnote: openEndnote,
              image: chooseImage,
              anchor: insertAnchorId,
              copy: () =>
                viewRef.current && void copySelection(viewRef.current, false),
              cut: () =>
                viewRef.current && void copySelection(viewRef.current, true),
            })}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    );
  },
);

export default ChapterEditor;
