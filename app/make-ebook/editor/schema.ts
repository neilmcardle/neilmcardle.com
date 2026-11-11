import {
  Schema,
  type DOMOutputSpec,
  type MarkSpec,
  type NodeSpec,
} from "prosemirror-model";

const BLOCK_PARENTS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "DIV",
  "BLOCKQUOTE",
  "FIGCAPTION",
  "FIGURE",
  "BODY",
  "TD",
  "TH",
  "UL",
  "OL",
  "PRE",
]);

export function isTrailingBreak(node: Node): boolean {
  let current: Node = node;
  while (current.parentNode) {
    if (current.nextSibling) return false;
    const parent = current.parentNode;
    if (parent.nodeType !== 1 || BLOCK_PARENTS.has(parent.nodeName)) {
      return true;
    }
    current = parent;
  }
  return true;
}

export type Align = "left" | "center" | "right" | "justify";

const ALIGNS: Align[] = ["left", "center", "right", "justify"];

function readAlign(dom: HTMLElement): Align | null {
  const value = dom.style?.textAlign as Align | undefined;
  return value && ALIGNS.includes(value) ? value : null;
}

function blockAttrs(attrs: Record<string, unknown>, extra = {}) {
  const out: Record<string, string> = {};
  if (attrs.id) out.id = String(attrs.id);
  Object.assign(out, extra);
  if (attrs.align) out.style = `text-align: ${attrs.align};`;
  return out;
}

function safeHref(href: string | null): string | null {
  if (!href) return null;
  return /^\s*(javascript|vbscript):/i.test(href) ? null : href;
}

function attr(dom: HTMLElement, name: string): string | null {
  return dom.getAttribute(name);
}

const nodes: Record<string, NodeSpec> = {
  doc: { content: "block+" },

  paragraph: {
    group: "block",
    content: "inline*",
    attrs: {
      align: { default: null },
      id: { default: null },
      endnoteEntryId: { default: null },
    },
    parseDOM: [
      {
        tag: "p",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          return {
            align: readAlign(el),
            id: attr(el, "id"),
            endnoteEntryId: attr(el, "data-endnote-entry-id"),
          };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      "p",
      blockAttrs(
        node.attrs,
        node.attrs.endnoteEntryId
          ? { "data-endnote-entry-id": node.attrs.endnoteEntryId }
          : {},
      ),
      0,
    ],
  },

  heading: {
    group: "block",
    content: "inline*",
    defining: true,
    attrs: {
      level: { default: 1 },
      align: { default: null },
      id: { default: null },
    },
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      getAttrs: (dom: HTMLElement) => ({
        level: Math.min(level, 3),
        align: readAlign(dom),
        id: attr(dom, "id"),
      }),
    })),
    toDOM: (node): DOMOutputSpec => [
      `h${node.attrs.level}`,
      blockAttrs(node.attrs),
      0,
    ],
  },

  blockquote: {
    group: "block",
    content: "block+",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM: (): DOMOutputSpec => ["blockquote", 0],
  },

  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM: (): DOMOutputSpec => ["hr"],
  },

  code_block: {
    group: "block",
    content: "text*",
    marks: "",
    code: true,
    defining: true,
    attrs: { language: { default: null } },
    parseDOM: [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (dom) => {
          const code = (dom as HTMLElement).querySelector("code");
          return { language: code?.getAttribute("class") ?? null };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      "pre",
      ["code", node.attrs.language ? { class: node.attrs.language } : {}, 0],
    ],
  },

  bullet_list: {
    group: "block",
    content: "list_item+",
    parseDOM: [{ tag: "ul" }],
    toDOM: (): DOMOutputSpec => ["ul", 0],
  },

  ordered_list: {
    group: "block",
    content: "list_item+",
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: "ol",
        getAttrs: (dom) => {
          const start = (dom as HTMLElement).getAttribute("start");
          return { order: start ? Number(start) || 1 : 1 };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec =>
      node.attrs.order === 1
        ? ["ol", 0]
        : ["ol", { start: String(node.attrs.order) }, 0],
  },

  list_item: {
    content: "paragraph block*",
    defining: true,
    parseDOM: [{ tag: "li" }],
    toDOM: (): DOMOutputSpec => ["li", 0],
  },

  figure: {
    group: "block",
    content: "figure_image figcaption?",
    defining: true,
    attrs: { style: { default: null } },
    parseDOM: [
      {
        tag: "figure",
        getAttrs: (dom) => ({ style: attr(dom as HTMLElement, "style") }),
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      "figure",
      node.attrs.style ? { style: node.attrs.style } : {},
      0,
    ],
  },

  figure_image: {
    attrs: {
      src: { default: "" },
      alt: { default: null },
      title: { default: null },
      style: { default: null },
    },
    parseDOM: [
      {
        tag: "img[src]",
        context: "figure/",
        priority: 60,
        getAttrs: (dom) => imageAttrs(dom as HTMLElement),
      },
    ],
    toDOM: (node): DOMOutputSpec => ["img", imageOut(node.attrs)],
  },

  figcaption: {
    content: "inline*",
    attrs: { style: { default: null } },
    parseDOM: [
      {
        tag: "figcaption",
        getAttrs: (dom) => ({ style: attr(dom as HTMLElement, "style") }),
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      "figcaption",
      node.attrs.style ? { style: node.attrs.style } : {},
      0,
    ],
  },

  text: { group: "inline" },

  image: {
    inline: true,
    group: "inline",
    draggable: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
      style: { default: null },
    },
    parseDOM: [
      {
        tag: "img[src]",
        getAttrs: (dom) => imageAttrs(dom as HTMLElement),
      },
    ],
    toDOM: (node): DOMOutputSpec => ["img", imageOut(node.attrs)],
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [
      {
        tag: "br",
        getAttrs: (dom) => (isTrailingBreak(dom as Node) ? false : null),
      },
      { tag: "br", ignore: true },
    ],
    toDOM: (): DOMOutputSpec => ["br"],
  },

  endnote_ref: {
    inline: true,
    group: "inline",
    atom: true,
    attrs: {
      number: {},
      endnoteId: {},
      cls: { default: null },
      href: { default: null },
      id: { default: null },
      title: { default: null },
      style: { default: null },
      label: { default: null },
      sup: { default: true },
    },
    parseDOM: [
      {
        tag: "a[data-endnote-ref]",
        priority: 100,
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const number = el.getAttribute("data-endnote-ref") ?? "";
          const sup = el.firstElementChild?.nodeName === "SUP";
          return {
            number,
            endnoteId: el.getAttribute("data-endnote-id") ?? "",
            cls: attr(el, "class"),
            href: attr(el, "href"),
            id: attr(el, "id"),
            title: attr(el, "title"),
            style: attr(el, "style"),
            label: el.textContent ?? `[${number}]`,
            sup,
          };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => {
      const a = node.attrs;
      const out: Record<string, string> = {};
      if (a.cls) out.class = a.cls;
      if (a.href) out.href = a.href;
      if (a.id) out.id = a.id;
      if (a.title) out.title = a.title;
      out["data-endnote-ref"] = String(a.number);
      out["data-endnote-id"] = String(a.endnoteId);
      if (a.style) out.style = a.style;
      const label = a.label ?? `[${a.number}]`;
      return ["a", out, a.sup ? ["sup", label] : label];
    },
  },

  endnote_back: {
    inline: true,
    group: "inline",
    atom: true,
    attrs: {
      number: {},
      href: { default: null },
      id: { default: null },
      cls: { default: null },
      style: { default: null },
      label: { default: null },
    },
    parseDOM: [
      {
        tag: "a[data-back-to-ref]",
        priority: 100,
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const number = el.getAttribute("data-back-to-ref") ?? "";
          return {
            number,
            href: attr(el, "href"),
            id: attr(el, "id"),
            cls: attr(el, "class"),
            style: attr(el, "style"),
            label: el.textContent ?? `[${number}]`,
          };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => {
      const a = node.attrs;
      const out: Record<string, string> = {};
      if (a.href) out.href = a.href;
      if (a.id) out.id = a.id;
      out["data-back-to-ref"] = String(a.number);
      if (a.cls) out.class = a.cls;
      if (a.style) out.style = a.style;
      return ["a", out, a.label ?? `[${a.number}]`];
    },
  },

  anchor: {
    inline: true,
    group: "inline",
    atom: true,
    attrs: { id: {} },
    parseDOM: [
      {
        tag: "a[id]",
        priority: 90,
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          if (el.hasAttribute("href") || (el.textContent ?? "") !== "") {
            return false;
          }
          return { id: el.getAttribute("id") };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => ["a", { id: node.attrs.id }],
  },
};

function imageAttrs(el: HTMLElement) {
  return {
    src: el.getAttribute("src"),
    alt: el.getAttribute("alt"),
    title: el.getAttribute("title"),
    style: el.getAttribute("style"),
  };
}

function imageOut(attrs: Record<string, unknown>) {
  const out: Record<string, string> = { src: String(attrs.src) };
  if (attrs.alt != null) out.alt = String(attrs.alt);
  if (attrs.title != null) out.title = String(attrs.title);
  if (attrs.style != null) out.style = String(attrs.style);
  return out;
}

const marks: Record<string, MarkSpec> = {
  link: {
    attrs: { href: {}, title: { default: null } },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const href = safeHref(el.getAttribute("href"));
          if (!href) return false;
          return { href, title: el.getAttribute("title") };
        },
      },
    ],
    toDOM: (mark): DOMOutputSpec => [
      "a",
      mark.attrs.title
        ? { href: mark.attrs.href, title: mark.attrs.title }
        : { href: mark.attrs.href },
      0,
    ],
  },
  strong: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (dom) =>
          (dom as HTMLElement).style.fontWeight !== "normal" && null,
      },
    ],
    toDOM: (): DOMOutputSpec => ["strong", 0],
  },
  em: {
    parseDOM: [{ tag: "em" }, { tag: "i" }],
    toDOM: (): DOMOutputSpec => ["em", 0],
  },
  underline: {
    parseDOM: [{ tag: "u" }, { tag: "ins" }],
    toDOM: (): DOMOutputSpec => ["u", 0],
  },
  strike: {
    parseDOM: [{ tag: "s" }, { tag: "strike" }, { tag: "del" }],
    toDOM: (): DOMOutputSpec => ["s", 0],
  },
  subscript: {
    excludes: "superscript",
    parseDOM: [{ tag: "sub" }],
    toDOM: (): DOMOutputSpec => ["sub", 0],
  },
  superscript: {
    excludes: "subscript",
    parseDOM: [{ tag: "sup" }],
    toDOM: (): DOMOutputSpec => ["sup", 0],
  },
  code: {
    parseDOM: [{ tag: "code" }],
    toDOM: (): DOMOutputSpec => ["code", 0],
  },
};

export const schema = new Schema({ nodes, marks });

export const nodeTypes = schema.nodes;
export const markTypes = schema.marks;
