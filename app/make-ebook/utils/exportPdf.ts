import { Chapter } from '../types';
import { TypographyPreset, TYPOGRAPHY_PRESETS } from './typographyPresets';

interface ExportPdfOptions {
  title: string;
  author: string;
  publisher?: string;
  chapters: Chapter[];
  typographyPreset?: TypographyPreset;
}

export function exportPdf({
  title,
  author,
  publisher,
  chapters,
  typographyPreset = 'default',
}: ExportPdfOptions) {
  const config = TYPOGRAPHY_PRESETS[typographyPreset];

  const titlePageHtml = `
    <div class="title-page">
      <h1 class="book-title">${escapeHtml(title || 'Untitled')}</h1>
      <p class="book-author">${escapeHtml(author || 'Unknown Author')}</p>
      ${publisher ? `<p class="book-publisher">${escapeHtml(publisher)}</p>` : ''}
    </div>
  `;

  const chaptersHtml = chapters.map((ch) => `
    <div class="chapter">
      ${ch.title ? `<h2 class="chapter-title">${escapeHtml(ch.title)}</h2>` : ''}
      <div class="chapter-content">${ch.content}</div>
    </div>
  `).join('\n');

  const css = `
    @page {
      size: A5;
      margin: 2cm 1.8cm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: ${config.fontFamily};
      font-size: 11pt;
      line-height: ${config.lineHeight};
      text-align: ${config.textAlign};
      color: #000;
      margin: 0;
      padding: 0;
      ${config.hyphenation ? `
      -webkit-hyphens: auto;
      hyphens: auto;
      ` : ''}
    }

    /* Title page */
    .title-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
      page-break-after: always;
    }

    .book-title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 0.5em;
      line-height: 1.2;
    }

    .book-author {
      font-size: 16pt;
      font-style: italic;
      margin-bottom: 0.3em;
    }

    .book-publisher {
      font-size: 11pt;
      margin-top: 2em;
      color: #555;
    }

    /* Chapters */
    .chapter {
      page-break-before: always;
    }

    .chapter:first-of-type {
      page-break-before: auto;
    }

    .chapter-title {
      font-size: 18pt;
      font-weight: bold;
      text-align: ${config.chapterTitleAlign || 'center'};
      margin-bottom: 1.5em;
      margin-top: 2em;
      line-height: 1.3;
    }

    .chapter-content p {
      text-indent: ${config.textIndent};
      margin: ${config.paragraphSpacing} 0;
    }

    .chapter-content p:first-child {
      text-indent: 0;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    img {
      max-width: 100%;
      height: auto;
      page-break-inside: avoid;
    }

    blockquote {
      margin: 1em 2em;
      font-style: italic;
      border-left: 3px solid #ccc;
      padding-left: 1em;
    }

    pre, code {
      font-family: "Courier New", Courier, monospace;
      font-size: 0.9em;
    }

    pre {
      page-break-inside: avoid;
      white-space: pre-wrap;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #999;
      padding: 0.4em 0.6em;
      font-size: 0.9em;
    }

    hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 2em 0;
    }

    /* Print tweaks */
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title || 'Untitled')}</title>
  <style>${css}</style>
</head>
<body>
  ${titlePageHtml}
  ${chaptersHtml}
</body>
</html>`;

  // Open a new window, write content, and trigger print
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  // Fallback if onload doesn't fire (some browsers)
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
