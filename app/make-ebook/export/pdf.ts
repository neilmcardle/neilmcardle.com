import { bookCss, PRINT_CSS } from "./styles";
import type { RenderedBook } from "./render";
import { chapterBody, escapeXml } from "./xhtml";

export function pdfHtml(book: RenderedBook): string {
  const publisher = book.publisher
    ? `<p class="book-publisher">${escapeXml(book.publisher)}</p>`
    : "";
  const chapters = book.chapters
    .map(
      (chapter, index) => `<section class="chapter" id="chapter-${index + 1}">
<h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
<div class="chapter-content">${chapterBody({ book, chapterIndex: index, images: "inline", links: "single" })}</div>
</section>`,
    )
    .join("\n");
  return `<!DOCTYPE html>
<html lang="${escapeXml(book.language)}">
<head>
<meta charset="utf-8" />
<title>${escapeXml(book.title)}</title>
<style>
${bookCss(book.typography)}
${PRINT_CSS}
</style>
</head>
<body>
<section class="title-page">
<h1 class="book-title">${escapeXml(book.title)}</h1>
<p class="book-author">${escapeXml(book.author)}</p>
${publisher}
</section>
${chapters}
</body>
</html>
`;
}

export function printPdf(book: RenderedBook): boolean {
  const html = pdfHtml(book);
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  let printed = false;
  const print = () => {
    if (printed || win.closed) return;
    printed = true;
    win.focus();
    win.print();
  };
  if (win.document.readyState === "complete") {
    setTimeout(print, 50);
  } else {
    win.addEventListener("load", print, { once: true });
    setTimeout(print, 1500);
  }
  return true;
}
