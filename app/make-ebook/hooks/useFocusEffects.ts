"use client";
import { useEffect, useRef } from "react";

// ─── Typewriter mode ──────────────────────────────────────────────────────────
// Scrolls the editor container so the cursor line stays at ~42% of its height.
export function useTypewriterMode(enabled: boolean) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function scrollToCursor() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        // getBoundingClientRect() on a collapsed range gives the caret position
        // in all modern browsers without touching the DOM.
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        let rect = range.getBoundingClientRect();

        // Fallback: if the rect is degenerate use the parent element's rect
        if (!rect || (rect.top === 0 && rect.bottom === 0)) {
          const node = sel.focusNode;
          const el =
            node instanceof HTMLElement ? node : (node?.parentElement ?? null);
          if (!el) return;
          rect = el.getBoundingClientRect();
        }

        if (!rect || rect.top === 0) return;

        // Walk up from the focused node to find the nearest scrollable ancestor
        const focusNode = sel.focusNode;
        let container: HTMLElement | null =
          focusNode instanceof HTMLElement
            ? focusNode
            : (focusNode?.parentElement ?? null);
        while (container && container !== document.documentElement) {
          const { overflowY } = window.getComputedStyle(container);
          if (
            (overflowY === "auto" || overflowY === "scroll") &&
            container.scrollHeight > container.clientHeight
          ) break;
          container = container.parentElement;
        }
        if (!container || container === document.documentElement) return;

        const containerRect = container.getBoundingClientRect();
        // Target: cursor should sit at 42% from the top of the scroll container, shifted up 40px
        const targetY = containerRect.top + containerRect.height * 0.42 - 40;
        const delta = rect.top - targetY;

        // Only scroll if the cursor is meaningfully out of position
        if (Math.abs(delta) > 12) {
          container.scrollBy({ top: delta, behavior: "smooth" });
        }
      });
    }

    document.addEventListener("selectionchange", scrollToCursor);
    return () => {
      document.removeEventListener("selectionchange", scrollToCursor);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);
}

// ─── Paragraph focus ──────────────────────────────────────────────────────────
// Tags the block element under the cursor with data-para-focused.
// CSS (.paragraph-focus) dims everything else.
export function useParagraphFocus(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      document.querySelectorAll("[data-para-focused]").forEach((el) =>
        el.removeAttribute("data-para-focused")
      );
      return;
    }

    function updateFocus() {
      document
        .querySelectorAll("[data-para-focused]")
        .forEach((el) => el.removeAttribute("data-para-focused"));

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const node = sel.getRangeAt(0).startContainer;
      let el: HTMLElement | null =
        node instanceof HTMLElement ? node : (node?.parentElement ?? null);

      // Walk up until el's parent is the contenteditable root.
      // That makes el the top-level block regardless of tag name (p, div, h1, etc.)
      while (el) {
        const parent = el.parentElement;
        if (!parent) break;
        if (parent.contentEditable === "true") {
          el.setAttribute("data-para-focused", "true");
          return;
        }
        el = parent;
      }
    }

    updateFocus(); // mark current paragraph immediately on enable
    document.addEventListener("selectionchange", updateFocus);
    return () => {
      document.removeEventListener("selectionchange", updateFocus);
      document.querySelectorAll("[data-para-focused]").forEach((el) =>
        el.removeAttribute("data-para-focused")
      );
    };
  }, [enabled]);
}
