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

export function previewDocument(
  book: RenderedBook,
  index: number,
  view: PreviewView,
): string {
  const section = book.chapters[index]
    ? chapterSection(book, index, "inline")
    : `<p class="preview-empty">Nothing in this chapter yet.</p>`;
  const paged = view.paged
    ? `html, body { height: 100%; overflow: hidden; }
body {
  box-sizing: border-box;
  column-width: calc(100vw - ${PREVIEW_GAP}px);
  column-gap: ${PREVIEW_GAP}px;
  column-fill: auto;
}`
    : `html { overflow-y: auto; }`;
  return `<!DOCTYPE html>
<html lang="${escapeXml(book.language)}">
<head>
<meta charset="utf-8" />
<style>
${bookCss(book.typography)}
</style>
<style>
html { font-size: ${view.fontPx}px; background: ${view.page}; scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
body {
  margin: 0;
  padding: 28px ${PREVIEW_GAP / 2}px;
  color: ${view.ink};
  background: ${view.page};
}
hr::before, figcaption { color: ${view.muted}; }
.chapter-title { margin-top: 0.4em; }
a { pointer-events: none; }
.preview-empty { color: ${view.muted}; font-style: italic; text-indent: 0; }
${paged}
</style>
</head>
<body>
${section}
</body>
</html>
`;
}
