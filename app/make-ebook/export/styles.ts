export const PRESET_IDS = [
  "default",
  "novel",
  "nonfiction",
  "memoir",
  "academic",
  "modern",
  "technical",
  "poetry",
  "childrens",
] as const;

export type TypographyPreset = (typeof PRESET_IDS)[number];

export type Typography = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textIndent: number;
  paragraphSpacing: number;
  textAlign: "left" | "justify";
  hyphens: boolean;
  dropCaps: boolean;
  titleAlign: "left" | "center";
};

const SERIF = 'Georgia, "Times New Roman", serif';
const PALATINO =
  'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif';

export const PRESETS: Record<
  TypographyPreset,
  Typography & { name: string; description: string }
> = {
  default: {
    name: "Standard",
    description: "Balanced settings that suit most books.",
    fontFamily: SERIF,
    fontSize: 1,
    lineHeight: 1.6,
    textIndent: 0,
    paragraphSpacing: 0.5,
    textAlign: "left",
    hyphens: false,
    dropCaps: false,
    titleAlign: "center",
  },
  novel: {
    name: "Novel",
    description:
      "Justified text with indented paragraphs, like a printed novel.",
    fontFamily: SERIF,
    fontSize: 1,
    lineHeight: 1.8,
    textIndent: 1.5,
    paragraphSpacing: 0,
    textAlign: "justify",
    hyphens: true,
    dropCaps: false,
    titleAlign: "center",
  },
  nonfiction: {
    name: "Non-fiction",
    description: "Spaced paragraphs and left-aligned text for information.",
    fontFamily: "Georgia, serif",
    fontSize: 1,
    lineHeight: 1.7,
    textIndent: 0,
    paragraphSpacing: 0.8,
    textAlign: "left",
    hyphens: false,
    dropCaps: false,
    titleAlign: "left",
  },
  memoir: {
    name: "Memoir",
    description: "Warm Palatino with drop caps and generous lines.",
    fontFamily: PALATINO,
    fontSize: 1.05,
    lineHeight: 1.85,
    textIndent: 1.5,
    paragraphSpacing: 0,
    textAlign: "left",
    hyphens: true,
    dropCaps: true,
    titleAlign: "center",
  },
  academic: {
    name: "Academic",
    description: "Palatino, justified and indented, for essays and papers.",
    fontFamily: PALATINO,
    fontSize: 0.92,
    lineHeight: 1.65,
    textIndent: 1.5,
    paragraphSpacing: 0,
    textAlign: "justify",
    hyphens: true,
    dropCaps: false,
    titleAlign: "center",
  },
  modern: {
    name: "Modern",
    description: "Open sans serif for business and self-help.",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 0.95,
    lineHeight: 1.75,
    textIndent: 0,
    paragraphSpacing: 1,
    textAlign: "left",
    hyphens: false,
    dropCaps: false,
    titleAlign: "left",
  },
  technical: {
    name: "Technical",
    description: "Compact and left-aligned, for guides with code.",
    fontFamily: '"Source Serif Pro", Georgia, serif',
    fontSize: 0.95,
    lineHeight: 1.6,
    textIndent: 0,
    paragraphSpacing: 1,
    textAlign: "left",
    hyphens: false,
    dropCaps: false,
    titleAlign: "left",
  },
  poetry: {
    name: "Poetry",
    description: "Wide line spacing for verse.",
    fontFamily: "Baskerville, Georgia, serif",
    fontSize: 1.1,
    lineHeight: 2,
    textIndent: 0,
    paragraphSpacing: 1.5,
    textAlign: "left",
    hyphens: false,
    dropCaps: false,
    titleAlign: "center",
  },
  childrens: {
    name: "Children's",
    description: "Large, friendly type with loose spacing.",
    fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
    fontSize: 1.2,
    lineHeight: 2.1,
    textIndent: 0,
    paragraphSpacing: 1.2,
    textAlign: "left",
    hyphens: false,
    dropCaps: false,
    titleAlign: "center",
  },
};

export function normalisePreset(value: unknown): TypographyPreset {
  return typeof value === "string" &&
    (PRESET_IDS as readonly string[]).includes(value)
    ? (value as TypographyPreset)
    : "default";
}

const em = (n: number) => (n === 0 ? "0" : `${n}em`);

export function bookCss(preset: TypographyPreset = "default"): string {
  const t = PRESETS[preset];
  const hyphens = t.hyphens
    ? "\n  -webkit-hyphens: auto;\n  hyphens: auto;"
    : "";
  const dropCaps = t.dropCaps
    ? `
.chapter-content > p:first-child::first-letter {
  float: left;
  font-size: 3.5em;
  line-height: 0.8;
  padding-right: 0.1em;
  margin-top: 0.1em;
  font-weight: bold;
}
`
    : "";
  return `@charset "UTF-8";

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: ${t.fontFamily};
  font-size: ${t.fontSize}em;
  line-height: ${t.lineHeight};
  margin: 5%;
  text-align: ${t.textAlign};${hyphens}
}

p {
  text-indent: ${em(t.textIndent)};
  margin-top: 0;
  margin-bottom: ${em(t.paragraphSpacing)};
  orphans: 2;
  widows: 2;
}

.chapter-content > p:first-child,
h1 + p,
h2 + p,
h3 + p,
hr + p,
blockquote + p,
figure + p,
ul + p,
ol + p {
  text-indent: 0;
}

h1, h2, h3 {
  font-weight: bold;
  line-height: 1.3;
  page-break-after: avoid;
  break-after: avoid;
}

h1 {
  font-size: 1.5em;
  margin: 2em 0 1em;
}

h2 {
  font-size: 1.3em;
  margin: 1.5em 0 0.8em;
}

h3 {
  font-size: 1.1em;
  margin: 1.2em 0 0.6em;
}

.chapter-title {
  text-align: ${t.titleAlign};
  font-size: 1.5em;
  margin: 2em 0 1em;
}

.title-page {
  text-align: center;
  margin-top: 30%;
}

.title-page .book-title {
  font-size: 2em;
  margin: 0 0 0.5em;
}

.title-page .book-author {
  font-size: 1.2em;
  font-style: italic;
  text-indent: 0;
  margin: 0 0 0.3em;
}

.title-page .book-publisher {
  font-size: 0.9em;
  text-indent: 0;
  margin-top: 3em;
}

.details p {
  text-indent: 0;
  margin: 0 0 0.4em;
}

hr {
  border: none;
  text-align: center;
  margin: 1.5em 0;
}

hr::before {
  content: "* * *";
  letter-spacing: 0.5em;
  color: #666;
}

blockquote {
  margin: 1em 2em;
  font-style: italic;
}

blockquote p {
  text-indent: 0;
}

ul, ol {
  margin: 1em 0;
  padding-left: 2em;
}

ul {
  list-style-type: disc;
}

ol {
  list-style-type: decimal;
}

li {
  margin-bottom: 0.3em;
}

li p {
  text-indent: 0;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: underline;
}

a.endnote-ref {
  text-decoration: none;
}

a.endnote-ref sup {
  font-size: 0.75em;
  line-height: 0;
}

a.endnote-back {
  font-size: 0.85em;
  margin-left: 0.5em;
  text-decoration: none;
}

nav ol {
  list-style-type: none;
  padding-left: 0;
}

nav a {
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
}

figure {
  margin: 1.5em 0;
  text-align: center;
}

figure img {
  display: block;
  margin: 0 auto;
}

figcaption {
  font-size: 0.9em;
  font-style: italic;
  margin-top: 0.5em;
}

pre, code {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9em;
}

pre {
  padding: 1em;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #ddd;
}
${dropCaps}`;
}

export const PRINT_CSS = `@page {
  size: A5;
  margin: 2cm 1.8cm;
}

body {
  margin: 0;
  font-size: 11pt;
  color: #000;
}

.title-page,
.chapter {
  break-before: page;
  page-break-before: always;
}

.title-page {
  break-before: auto;
  page-break-before: auto;
  margin-top: 35%;
}

img,
figure,
pre {
  break-inside: avoid;
  page-break-inside: avoid;
}
`;
