export type Chapter = {
  title: string;
  content: string;
};

export interface BookData {
  title: string;
  author: string;
  isbn: string;
  cover: string | null;
  chapters: Chapter[];
}

export function htmlEscape(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}