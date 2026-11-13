import { chapterSection } from "./epub";
import type { RenderedBook } from "./render";
import { bookCss } from "./styles";
import { escapeXml } from "./xhtml";

export type PreviewView = {
  fontPx: number;
  page: string;
  ink: string;
  muted: string;
  paged: boolean;
};

export const PREVIEW_GAP = 48;

export function applyPreviewView(root: HTMLElement, view: PreviewView) {
  root.style.setProperty("--font-px", `${view.fontPx}px`);
  root.style.setProperty("--page", view.page);
  root.style.setProperty("--ink", view.ink);
  root.style.setProperty("--muted", view.muted);
  root.toggleAttribute("data-paged", view.paged);
}

export function previewDocument(
  book: RenderedBook,
  index: number,
  view: PreviewView,
): string {
  const section = book.chapters[index]
    ? chapterSection(book, index, "inline")
    : `<p class="preview-empty">Nothing in this chapter yet.</p>`;
  const vars = `--font-px: ${view.fontPx}px; --page: ${view.page}; --ink: ${view.ink}; --muted: ${view.muted};`;
  return `<!DOCTYPE html>
<html lang="${escapeXml(book.language)}"${view.paged ? " data-paged" : ""} style="${vars}">
<head>
<meta charset="utf-8" />
<style>
${bookCss(book.typography)}
</style>
<style>
html { font-size: var(--font-px); background: var(--page); scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
html, body { transition: background-color 300ms cubic-bezier(0.2, 0.8, 0, 1), color 300ms cubic-bezier(0.2, 0.8, 0, 1); }
body {
  margin: 0;
  padding: 28px ${PREVIEW_GAP / 2}px;
  color: var(--ink);
  background: var(--page);
}
hr::before, figcaption { color: var(--muted); }
.chapter-title { margin-top: 0.4em; }
a { pointer-events: none; }
.preview-empty { color: var(--muted); font-style: italic; text-indent: 0; }
html:not([data-paged]) { overflow-y: auto; }
html[data-paged], html[data-paged] body { height: 100%; overflow: hidden; }
html[data-paged] body {
  box-sizing: border-box;
  column-width: calc(100vw - ${PREVIEW_GAP}px);
  column-gap: ${PREVIEW_GAP}px;
  column-fill: auto;
}
@media (prefers-reduced-motion: reduce) {
  html, body { transition-duration: 200ms; }
}
</style>
</head>
<body>
${section}
</body>
</html>
`;
}
