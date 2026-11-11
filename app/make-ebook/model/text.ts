const BLOCK_TAGS =
  "p|div|h[1-6]|li|ul|ol|blockquote|figure|figcaption|pre|hr|br|table|tr|td|th|section|article|header|footer|aside|img";

const BLOCK_TAG = new RegExp(`<\\/?(?:${BLOCK_TAGS})\\b[^>]*>`, "gi");
const NOTE_LINK =
  /<a\b[^>]*\bdata-(?:endnote-ref|back-to-ref)\b[^>]*>[\s\S]*?<\/a>/gi;

const NAMED: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  shy: "",
  zwj: "",
  zwnj: "",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const hex = entity[1] === "x" || entity[1] === "X";
      const code = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED[entity.toLowerCase()] ?? match;
  });
}

export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  const stripped = html
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(NOTE_LINK, "")
    .replace(BLOCK_TAG, " ")
    .replace(/<[^>]*>/g, "");
  return decodeEntities(stripped).replace(/\s+/g, " ").trim();
}

const WORDLIKE = /[\p{L}\p{N}]/u;

export function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  let words = 0;
  for (const token of text.split(/\s+/)) if (WORDLIKE.test(token)) words++;
  return words;
}

export function textStats(html: string | null | undefined): {
  text: string;
  words: number;
  chars: number;
} {
  const text = htmlToText(html);
  return {
    text,
    words: countWords(text),
    chars: text.replace(/\s/g, "").length,
  };
}

export function hasText(html: string | null | undefined): boolean {
  return htmlToText(html).length > 0;
}
