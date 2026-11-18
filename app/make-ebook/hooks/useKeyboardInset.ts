"use client";

import { useEffect } from "react";

const OPEN_THRESHOLD = 120;
const CARET_MARGIN = 28;

export function keyboardIsOpen(layoutHeight: number, visibleHeight: number) {
  return layoutHeight - visibleHeight > OPEN_THRESHOLD;
}

export function caretScroll(
  caret: { top: number; bottom: number },
  view: { top: number; bottom: number },
): number {
  if (caret.bottom > view.bottom - CARET_MARGIN) {
    return caret.bottom - view.bottom + CARET_MARGIN;
  }
  if (caret.top < view.top + CARET_MARGIN) {
    return caret.top - view.top - CARET_MARGIN;
  }
  return 0;
}

function caretRect(): DOMRect | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  if (rect && (rect.height > 0 || rect.top > 0)) return rect;
  const node = range.startContainer;
  const element = node instanceof Element ? node : node.parentElement;
  return element ? element.getBoundingClientRect() : null;
}

export function useKeyboardInset(active: boolean) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;
    const root = document.documentElement;

    const keepCaretVisible = () => {
      if (root.dataset.keyboard !== "open") return;
      const editor = document.activeElement;
      if (!(editor instanceof HTMLElement) || !editor.isContentEditable) return;
      const caret = caretRect();
      if (!caret) return;
      const box = editor.getBoundingClientRect();
      const bar = document
        .querySelector("[data-compact-toolbar]")
        ?.getBoundingClientRect();
      const visibleBottom = Math.min(
        box.bottom,
        viewport.offsetTop + viewport.height,
        bar && bar.height > 0 ? bar.top : Infinity,
      );
      const visibleTop = Math.max(box.top, viewport.offsetTop);
      const by = caretScroll(caret, { top: visibleTop, bottom: visibleBottom });
      if (by !== 0) editor.scrollTop += by;
    };

    const update = () => {
      const keyboard = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      root.style.setProperty("--vv-height", `${viewport.height}px`);
      root.style.setProperty("--vv-top", `${viewport.offsetTop}px`);
      root.style.setProperty("--kb", `${keyboard}px`);
      if (keyboardIsOpen(window.innerHeight, viewport.height)) {
        root.dataset.keyboard = "open";
        root.style.setProperty("--kb-pad", "0px");
        requestAnimationFrame(() => requestAnimationFrame(keepCaretVisible));
      } else {
        delete root.dataset.keyboard;
        root.style.removeProperty("--kb-pad");
      }
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    document.addEventListener("selectionchange", keepCaretVisible);
    document.addEventListener("input", keepCaretVisible);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.removeEventListener("selectionchange", keepCaretVisible);
      document.removeEventListener("input", keepCaretVisible);
      delete root.dataset.keyboard;
      for (const name of ["--vv-height", "--vv-top", "--kb", "--kb-pad"]) {
        root.style.removeProperty(name);
      }
    };
  }, [active]);
}
