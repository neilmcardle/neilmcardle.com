/**
 * Professional Typography Presets for EPUB Export
 * These CSS styles ensure high-quality rendering across e-readers
 */

export type TypographyPreset = 'novel' | 'nonfiction' | 'technical' | 'poetry' | 'default';

export interface TypographyConfig {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  textIndent: string;
  paragraphSpacing: string;
  textAlign: string;
  hyphenation: boolean;
  dropCaps?: boolean;
  chapterTitleAlign?: string;
}

export const TYPOGRAPHY_PRESETS: Record<TypographyPreset, TypographyConfig> = {
  novel: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '1em',
    lineHeight: 1.8,
    textIndent: '1.5em',
    paragraphSpacing: '0',
    textAlign: 'justify',
    hyphenation: true,
    dropCaps: false,
    chapterTitleAlign: 'center',
  },
  nonfiction: {
    fontFamily: 'Georgia, serif',
    fontSize: '1em',
    lineHeight: 1.7,
    textIndent: '0',
    paragraphSpacing: '0.8em',
    textAlign: 'left',
    hyphenation: false,
    dropCaps: false,
    chapterTitleAlign: 'left',
  },
  technical: {
    fontFamily: '"Source Serif Pro", Georgia, serif',
    fontSize: '0.95em',
    lineHeight: 1.6,
    textIndent: '0',
    paragraphSpacing: '1em',
    textAlign: 'left',
    hyphenation: false,
    dropCaps: false,
    chapterTitleAlign: 'left',
  },
  poetry: {
    fontFamily: 'Baskerville, Georgia, serif',
    fontSize: '1.1em',
    lineHeight: 2,
    textIndent: '0',
    paragraphSpacing: '1.5em',
    textAlign: 'left',
    hyphenation: false,
    dropCaps: false,
    chapterTitleAlign: 'center',
  },
  default: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '1em',
    lineHeight: 1.6,
    textIndent: '0',
    paragraphSpacing: '0.5em',
    textAlign: 'left',
    hyphenation: false,
    dropCaps: false,
    chapterTitleAlign: 'center',
  },
};

/**
 * Generates professional CSS for EPUB based on typography preset
 */
export function generateEpubCSS(preset: TypographyPreset = 'default'): string {
  const config = TYPOGRAPHY_PRESETS[preset];
  
  return `
@charset "UTF-8";

/* === Base Styles === */
html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: ${config.fontFamily};
  font-size: ${config.fontSize};
  line-height: ${config.lineHeight};
  margin: 5%;
  text-align: ${config.textAlign};
  ${config.hyphenation ? `
  -webkit-hyphens: auto;
  -moz-hyphens: auto;
  -ms-hyphens: auto;
  hyphens: auto;
  ` : ''}
}

/* === Paragraph Typography === */
p {
  text-indent: ${config.textIndent};
  margin-top: 0;
  margin-bottom: ${config.paragraphSpacing};
  orphans: 2;
  widows: 2;
}

/* First paragraph after heading - no indent (standard book convention) */
h1 + p,
h2 + p,
h3 + p,
hr + p,
blockquote + p,
.no-indent {
  text-indent: 0;
}

/* === Headings === */
h1 {
  font-size: 1.5em;
  text-align: ${config.chapterTitleAlign};
  margin: 2em 0 1em 0;
  page-break-before: always;
  page-break-after: avoid;
  font-weight: bold;
}

h2 {
  font-size: 1.3em;
  margin: 1.5em 0 0.8em 0;
  page-break-after: avoid;
}

h3 {
  font-size: 1.1em;
  margin: 1.2em 0 0.6em 0;
  page-break-after: avoid;
}

/* === Scene Breaks === */
hr {
  border: none;
  text-align: center;
  margin: 1.5em 0;
  page-break-after: avoid;
}

hr::before {
  content: "* * *";
  letter-spacing: 0.5em;
  color: #666;
}

/* === Block Quotes === */
blockquote {
  margin: 1em 2em;
  font-style: italic;
  border-left: 2px solid #ccc;
  padding-left: 1em;
}

blockquote p {
  text-indent: 0;
}

/* === Lists === */
ul, ol {
  margin: 1em 0;
  padding-left: 2em;
}

li {
  margin-bottom: 0.3em;
}

/* === Links and References === */
a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* === Footnotes/Endnotes === */
a[href^="#end"],
a[id^="ref"],
.endnote-ref {
  font-size: 0.75em;
  vertical-align: super;
  line-height: 0;
  text-decoration: none;
}

.endnote-back {
  font-size: 0.85em;
  margin-left: 0.5em;
}

/* === Images === */
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
}

figure {
  margin: 1.5em 0;
  text-align: center;
}

figcaption {
  font-size: 0.9em;
  font-style: italic;
  color: #666;
  margin-top: 0.5em;
}

/* === Code Blocks === */
pre, code {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9em;
}

pre {
  background-color: #f5f5f5;
  padding: 1em;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #ddd;
  border-radius: 3px;
}

code {
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 2px;
}

/* === Tables === */
table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.5em;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* === Special Classes === */
.chapter-title {
  text-align: ${config.chapterTitleAlign};
  font-size: 1.5em;
  margin: 2em 0 1em 0;
}

.subtitle {
  font-size: 1.1em;
  font-style: italic;
  text-align: center;
  margin-bottom: 2em;
}

.epigraph {
  font-style: italic;
  margin: 2em 3em;
  text-align: right;
}

.attribution {
  margin-top: 0.5em;
  font-size: 0.9em;
}

${config.dropCaps ? `
/* === Drop Caps === */
.chapter-content > p:first-of-type::first-letter,
.dropcap::first-letter {
  float: left;
  font-size: 3.5em;
  line-height: 0.8;
  padding-right: 0.1em;
  margin-top: 0.1em;
  font-weight: bold;
}
` : ''}

/* === Accessibility === */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}

/* === Print-specific === */
@media print {
  body {
    margin: 0;
  }
  
  h1 {
    page-break-before: always;
  }
}
`.trim();
}

/**
 * Preset descriptions for UI selection
 */
export const PRESET_DESCRIPTIONS: Record<TypographyPreset, { name: string; description: string }> = {
  novel: {
    name: 'Novel',
    description: 'Classic book typography with justified text and paragraph indents',
  },
  nonfiction: {
    name: 'Non-Fiction',
    description: 'Clean layout with paragraph spacing, ideal for informational content',
  },
  technical: {
    name: 'Technical',
    description: 'Optimized for code samples and technical documentation',
  },
  poetry: {
    name: 'Poetry',
    description: 'Generous line spacing for verse and poetry collections',
  },
  default: {
    name: 'Standard',
    description: 'Balanced defaults that work well for most content',
  },
};
