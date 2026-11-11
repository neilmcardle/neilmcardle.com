import {
  DOMParser as PMDOMParser,
  DOMSerializer,
  Fragment,
  type DOMOutputSpec,
  type Mark,
  type Node as PMNode,
  type Slice,
} from "prosemirror-model";
import { cleanPastedHtml } from "../utils/pasteCleaner";
import { schema } from "./schema";

const parser = PMDOMParser.fromSchema(schema);
const RAW_STYLE = "data-raw-style";

function keepRawStyle(spec: DOMOutputSpec): DOMOutputSpec {
  if (!Array.isArray(spec)) return spec;
  const [tag, ...rest] = spec as unknown as [string, ...unknown[]];
  const out: unknown[] = [tag];
  rest.forEach((part, i) => {
    if (
      i === 0 &&
      part &&
      typeof part === "object" &&
      !Array.isArray(part) &&
      !(part as { nodeType?: number }).nodeType
    ) {
      const attrs = { ...(part as Record<string, string>) };
      if (attrs.style != null) {
        attrs[RAW_STYLE] = attrs.style;
        delete attrs.style;
      }
      out.push(attrs);
    } else {
      out.push(keepRawStyle(part as DOMOutputSpec));
    }
  });
  return out as unknown as DOMOutputSpec;
}

const baseSerializer = DOMSerializer.fromSchema(schema);

const serializer = new DOMSerializer(
  Object.fromEntries(
    Object.entries(baseSerializer.nodes).map(([name, toDOM]) => [
      name,
      (node: PMNode) => keepRawStyle(toDOM(node)),
    ]),
  ),
  Object.fromEntries(
    Object.entries(baseSerializer.marks).map(([name, toDOM]) => [
      name,
      (mark: Mark, inline: boolean) => keepRawStyle(toDOM(mark, inline)),
    ]),
  ),
);

const TEXTBLOCK_TAGS = new Set(["P", "H1", "H2", "H3", "FIGCAPTION"]);

export type HtmlSource = "stored" | "untrusted";

function parseBody(html: string): HTMLElement {
  const parsed = new window.DOMParser().parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    "text/html",
  );
  return parsed.body;
}

export function htmlToDoc(html: string, source: HtmlSource = "stored"): PMNode {
  const input = source === "untrusted" ? cleanPastedHtml(html ?? "") : html;
  const body = parseBody(input ?? "");
  return parser.parse(body, { preserveWhitespace: source === "stored" });
}

export function htmlToSlice(
  html: string,
  source: HtmlSource = "untrusted",
): Slice {
  const input = source === "untrusted" ? cleanPastedHtml(html ?? "") : html;
  return parser.parseSlice(parseBody(input ?? ""), {
    preserveWhitespace: source === "stored",
  });
}

function endsWithBreak(el: Node): boolean {
  let last = el.lastChild;
  while (last) {
    if (last.nodeName === "BR") return true;
    if (last.nodeType !== 1) return false;
    if (!last.lastChild) return false;
    last = last.lastChild;
  }
  return false;
}

function finishTextblocks(root: HTMLElement) {
  const doc = root.ownerDocument;
  root.querySelectorAll(`[${RAW_STYLE}]`).forEach((el) => {
    const style = el.getAttribute(RAW_STYLE) ?? "";
    el.removeAttribute(RAW_STYLE);
    el.setAttribute("style", style);
  });
  root.querySelectorAll("p, h1, h2, h3, figcaption").forEach((el) => {
    if (!TEXTBLOCK_TAGS.has(el.nodeName)) return;
    if (!el.firstChild || endsWithBreak(el)) {
      el.appendChild(doc.createElement("br"));
    }
  });
  root.querySelectorAll("li").forEach((li) => {
    const first = li.firstElementChild;
    if (
      first &&
      first === li.firstChild &&
      first.nodeName === "P" &&
      first.attributes.length === 0
    ) {
      while (first.firstChild) li.insertBefore(first.firstChild, first);
      li.removeChild(first);
    }
  });
}

export function fragmentToHtml(fragment: Fragment): string {
  const container = document.createElement("div");
  container.appendChild(serializer.serializeFragment(fragment, { document }));
  finishTextblocks(container);
  return container.innerHTML;
}

export function docToHtml(doc: PMNode): string {
  return fragmentToHtml(doc.content);
}

export function normaliseHtml(html: string): string {
  return docToHtml(htmlToDoc(html));
}

export function isEmptyDoc(doc: PMNode): boolean {
  return (
    doc.childCount === 1 &&
    doc.firstChild!.isTextblock &&
    doc.firstChild!.content.size === 0
  );
}
