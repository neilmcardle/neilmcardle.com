import type { Node as PMNode } from "prosemirror-model";
import { Transform } from "prosemirror-transform";
import { docToHtml, htmlToDoc } from "./html";
import { findMatches, replaceMatches, type FindQuery } from "./plugins/find";

const CACHE_SIZE = 120;
const docs = new Map<string, PMNode>();

function cachedDoc(html: string): PMNode {
  const hit = docs.get(html);
  if (hit) {
    docs.delete(html);
    docs.set(html, hit);
    return hit;
  }
  const doc = htmlToDoc(html);
  docs.set(html, doc);
  if (docs.size > CACHE_SIZE) docs.delete(docs.keys().next().value as string);
  return doc;
}

export function countInHtml(html: string, query: FindQuery): number {
  if (!query.term || !html) return 0;
  return findMatches(cachedDoc(html), query).length;
}

export function replaceInHtml(
  html: string,
  query: FindQuery,
  replacement: string,
): { html: string; count: number } {
  if (!query.term || !html) return { html, count: 0 };
  const doc = cachedDoc(html);
  const matches = findMatches(doc, query);
  if (matches.length === 0) return { html, count: 0 };
  const tr = replaceMatches(new Transform(doc), matches, replacement);
  return { html: docToHtml(tr.doc), count: matches.length };
}
