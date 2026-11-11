import type { Mark, Node as PMNode } from "prosemirror-model";
import type { RenderedBook } from "./render";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type XhtmlTarget = {
  book: RenderedBook;
  chapterIndex: number;
  images: "files" | "inline";
  links: "files" | "single";
};

type Attrs = Record<string, string | null | undefined>;

function attrs(values: Attrs): string {
  return Object.entries(values)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => ` ${k}="${escapeXml(String(v))}"`)
    .join("");
}

const ALIGNS = new Set(["left", "center", "right", "justify"]);

function alignStyle(align: unknown): string | null {
  return typeof align === "string" && ALIGNS.has(align)
    ? `text-align: ${align};`
    : null;
}

function link(target: XhtmlTarget, href: string): string {
  const resolved = target.book.href(target.chapterIndex, href);
  return target.links === "single"
    ? resolved.replace(/^[^#]*#/, "#")
    : resolved;
}

function imageSrc(target: XhtmlTarget, src: string): string | null {
  if (target.images === "inline") return src;
  const name = target.book.imageName(src);
  return name ? `images/${name}` : null;
}

function markOpen(mark: Mark, target: XhtmlTarget): string {
  switch (mark.type.name) {
    case "link":
      return `<a${attrs({ href: link(target, String(mark.attrs.href ?? "")), title: mark.attrs.title })}>`;
    case "strong":
      return "<strong>";
    case "em":
      return "<em>";
    case "underline":
      return "<u>";
    case "strike":
      return "<s>";
    case "subscript":
      return "<sub>";
    case "superscript":
      return "<sup>";
    case "code":
      return "<code>";
    default:
      return "";
  }
}

const CLOSE: Record<string, string> = {
  link: "</a>",
  strong: "</strong>",
  em: "</em>",
  underline: "</u>",
  strike: "</s>",
  subscript: "</sub>",
  superscript: "</sup>",
  code: "</code>",
};

function inline(parent: PMNode, target: XhtmlTarget): string {
  let out = "";
  let open: Mark[] = [];
  const closeTo = (keep: number) => {
    while (open.length > keep) out += CLOSE[open.pop()!.type.name] ?? "";
  };
  parent.forEach((node) => {
    const marks = node.marks;
    let same = 0;
    while (
      same < open.length &&
      same < marks.length &&
      open[same].eq(marks[same])
    )
      same++;
    closeTo(same);
    for (let i = same; i < marks.length; i++) {
      out += markOpen(marks[i], target);
      open.push(marks[i]);
    }
    out += leaf(node, target);
  });
  closeTo(0);
  return out;
}

function leaf(node: PMNode, target: XhtmlTarget): string {
  switch (node.type.name) {
    case "text":
      return escapeXml(node.text ?? "");
    case "hard_break":
      return "<br />";
    case "image": {
      const src = imageSrc(target, String(node.attrs.src ?? ""));
      return src
        ? `<img${attrs({ src, alt: node.attrs.alt ?? "", title: node.attrs.title })} />`
        : "";
    }
    case "endnote_ref": {
      const n = Number(node.attrs.number);
      const href =
        target.links === "single"
          ? `#end${n}`
          : target.book.noteHref(target.chapterIndex, n);
      return `<a${attrs({ href, id: node.attrs.id || `ref${n}`, class: "endnote-ref", "epub:type": "noteref" })}><sup>[${n}]</sup></a>`;
    }
    case "endnote_back": {
      const n = Number(node.attrs.number);
      const href =
        target.links === "single"
          ? `#ref${n}`
          : target.book.backHref(target.chapterIndex, n);
      return `<a${attrs({ href, id: node.attrs.id || `end${n}`, class: "endnote-back" })}>[${n}]</a>`;
    }
    case "anchor":
      return `<a${attrs({ id: node.attrs.id })}></a>`;
    default:
      return "";
  }
}

function isEmpty(node: PMNode): boolean {
  return (
    node.childCount === 0 ||
    (node.textContent.trim() === "" &&
      !node.content.content.some(
        (c) => !c.isText && c.type.name !== "hard_break",
      ))
  );
}

function block(node: PMNode, target: XhtmlTarget): string {
  switch (node.type.name) {
    case "paragraph":
      if (isEmpty(node)) return "";
      return `<p${attrs({ id: node.attrs.id, style: alignStyle(node.attrs.align) })}>${inline(node, target)}</p>`;
    case "heading": {
      const level = Math.min(3, Math.max(1, Number(node.attrs.level) || 1));
      if (isEmpty(node)) return "";
      return `<h${level}${attrs({ id: node.attrs.id, style: alignStyle(node.attrs.align) })}>${inline(node, target)}</h${level}>`;
    }
    case "blockquote":
      return `<blockquote>${blocks(node, target)}</blockquote>`;
    case "horizontal_rule":
      return "<hr />";
    case "code_block": {
      const language = node.attrs.language
        ? `language-${node.attrs.language}`
        : null;
      return `<pre><code${attrs({ class: language })}>${escapeXml(node.textContent)}</code></pre>`;
    }
    case "bullet_list":
      return node.childCount ? `<ul>${blocks(node, target)}</ul>` : "";
    case "ordered_list": {
      const start = Number(node.attrs.order) || 1;
      return node.childCount
        ? `<ol${attrs({ start: start === 1 ? null : String(start) })}>${blocks(node, target)}</ol>`
        : "";
    }
    case "list_item":
      return `<li>${blocks(node, target)}</li>`;
    case "figure": {
      let image = "";
      let caption = "";
      node.forEach((child) => {
        if (child.type.name === "figure_image") {
          const src = imageSrc(target, String(child.attrs.src ?? ""));
          if (src)
            image = `<img${attrs({ src, alt: child.attrs.alt ?? "", title: child.attrs.title })} />`;
        } else if (child.type.name === "figcaption" && child.childCount) {
          caption = `<figcaption>${inline(child, target)}</figcaption>`;
        }
      });
      return image ? `<figure>${image}${caption}</figure>` : "";
    }
    default:
      return node.isTextblock ? `<p>${inline(node, target)}</p>` : "";
  }
}

function blocks(parent: PMNode, target: XhtmlTarget): string {
  let out = "";
  parent.forEach((child) => {
    out += block(child, target);
  });
  return out;
}

export function chapterBody(target: XhtmlTarget): string {
  const chapter = target.book.chapters[target.chapterIndex];
  return blocks(chapter.doc, target);
}
