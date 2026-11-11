import type { Mark, Node as PMNode } from "prosemirror-model";
import type {
  IRunOptions,
  ParagraphChild,
  Paragraph as ParagraphType,
} from "docx";
import { PRESETS } from "./styles";
import type { RenderedBook } from "./render";

type Docx = typeof import("docx");

const BASE_PT = 11;
const MAX_IMAGE_PX = 400;

export function imageSize(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  if (bytes.length > 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes.length > 10 && bytes[0] === 0x47 && bytes[1] === 0x49) {
    return {
      width: bytes[6] | (bytes[7] << 8),
      height: bytes[8] | (bytes[9] << 8),
    };
  }
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = bytes[i + 1];
      const length = (bytes[i + 2] << 8) | bytes[i + 3];
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      ) {
        return {
          height: (bytes[i + 5] << 8) | bytes[i + 6],
          width: (bytes[i + 7] << 8) | bytes[i + 8],
        };
      }
      i += 2 + length;
    }
  }
  return null;
}

function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const DATA_IMAGE = /^data:image\/(png|jpe?g|gif);base64,(.+)$/i;

type Context = {
  d: Docx;
  book: RenderedBook;
  notes: Map<number, number>;
  listInstance: number;
};

function runStyle(marks: readonly Mark[]): IRunOptions {
  const style: { -readonly [K in keyof IRunOptions]?: IRunOptions[K] } = {};
  for (const mark of marks) {
    switch (mark.type.name) {
      case "strong":
        style.bold = true;
        break;
      case "em":
        style.italics = true;
        break;
      case "underline":
        style.underline = {};
        break;
      case "strike":
        style.strike = true;
        break;
      case "subscript":
        style.subScript = true;
        break;
      case "superscript":
        style.superScript = true;
        break;
      case "code":
        style.font = "Courier New";
        break;
    }
  }
  return style;
}

function image(ctx: Context, src: string): ParagraphChild | null {
  const match = DATA_IMAGE.exec(src.trim());
  if (!match) return null;
  const kind = match[1].toLowerCase();
  const type = kind === "jpeg" ? "jpg" : (kind as "png" | "jpg" | "gif");
  const data = decode(match[2].replace(/\s/g, ""));
  const size = imageSize(data) ?? {
    width: MAX_IMAGE_PX,
    height: MAX_IMAGE_PX * 0.66,
  };
  const scale = Math.min(1, MAX_IMAGE_PX / Math.max(1, size.width));
  return new ctx.d.ImageRun({
    type,
    data,
    transformation: {
      width: Math.round(size.width * scale),
      height: Math.round(size.height * scale),
    },
  });
}

function inline(ctx: Context, parent: PMNode): ParagraphChild[] {
  const { d } = ctx;
  const out: ParagraphChild[] = [];
  parent.forEach((node) => {
    const link = node.marks.find((m) => m.type.name === "link");
    const style = runStyle(node.marks);
    let child: ParagraphChild | null = null;
    switch (node.type.name) {
      case "text":
        child = new d.TextRun({ ...style, text: node.text ?? "" });
        break;
      case "hard_break":
        child = new d.TextRun({ break: 1 });
        break;
      case "image":
        child = image(ctx, String(node.attrs.src ?? ""));
        break;
      case "endnote_ref": {
        const id = ctx.notes.get(Number(node.attrs.number));
        child = id
          ? new d.EndnoteReferenceRun(id)
          : new d.TextRun({
              text: `[${node.attrs.number}]`,
              superScript: true,
            });
        break;
      }
    }
    if (!child) return;
    const href = link ? String(link.attrs.href ?? "") : "";
    if (href && /^(https?:|mailto:)/i.test(href) && node.isText) {
      out.push(
        new d.ExternalHyperlink({
          link: href,
          children: [
            new d.TextRun({
              ...style,
              text: node.text ?? "",
              style: "Hyperlink",
            }),
          ],
        }),
      );
    } else {
      out.push(child);
    }
  });
  return out;
}

function align(ctx: Context, value: unknown) {
  const { AlignmentType } = ctx.d;
  switch (value) {
    case "center":
      return AlignmentType.CENTER;
    case "right":
      return AlignmentType.RIGHT;
    case "justify":
      return AlignmentType.JUSTIFIED;
    case "left":
      return AlignmentType.LEFT;
    default:
      return undefined;
  }
}

function blocks(
  ctx: Context,
  parent: PMNode,
  depth: { list: number; quote: boolean; ordered: number | null },
): ParagraphType[] {
  const { d } = ctx;
  const out: ParagraphType[] = [];
  let first = true;
  parent.forEach((node) => {
    switch (node.type.name) {
      case "paragraph": {
        if (node.childCount === 0) break;
        const listOptions =
          depth.list > 0
            ? depth.ordered !== null
              ? {
                  numbering: {
                    reference: "numbered",
                    level: depth.list - 1,
                    instance: depth.ordered,
                  },
                }
              : { bullet: { level: depth.list - 1 } }
            : {};
        out.push(
          new d.Paragraph({
            children: inline(ctx, node),
            alignment: align(ctx, node.attrs.align),
            style:
              first && depth.list === 0 && !depth.quote
                ? "FirstParagraph"
                : undefined,
            indent: depth.quote ? { left: 720, right: 720 } : undefined,
            ...listOptions,
          }),
        );
        first = false;
        break;
      }
      case "heading": {
        const level = Math.min(3, Math.max(1, Number(node.attrs.level) || 1));
        const heading = [
          d.HeadingLevel.HEADING_2,
          d.HeadingLevel.HEADING_3,
          d.HeadingLevel.HEADING_4,
        ][level - 1];
        out.push(
          new d.Paragraph({
            heading,
            children: inline(ctx, node),
            alignment: align(ctx, node.attrs.align),
          }),
        );
        first = true;
        break;
      }
      case "blockquote":
        out.push(...blocks(ctx, node, { ...depth, quote: true }));
        break;
      case "horizontal_rule":
        out.push(
          new d.Paragraph({
            alignment: d.AlignmentType.CENTER,
            children: [new d.TextRun("* * *")],
          }),
        );
        first = true;
        break;
      case "code_block": {
        const lines = node.textContent.split("\n");
        out.push(
          new d.Paragraph({
            children: lines.map(
              (line, i) =>
                new d.TextRun({
                  text: line,
                  font: "Courier New",
                  break: i ? 1 : 0,
                }),
            ),
          }),
        );
        break;
      }
      case "bullet_list":
        node.forEach((item) =>
          out.push(
            ...blocks(ctx, item, {
              ...depth,
              list: depth.list + 1,
              ordered: null,
            }),
          ),
        );
        break;
      case "ordered_list": {
        const instance = ++ctx.listInstance;
        node.forEach((item) =>
          out.push(
            ...blocks(ctx, item, {
              ...depth,
              list: depth.list + 1,
              ordered: instance,
            }),
          ),
        );
        break;
      }
      case "list_item":
        out.push(...blocks(ctx, node, depth));
        break;
      case "figure":
        node.forEach((child) => {
          if (child.type.name === "figure_image") {
            const img = image(ctx, String(child.attrs.src ?? ""));
            if (img)
              out.push(
                new d.Paragraph({
                  alignment: d.AlignmentType.CENTER,
                  children: [img],
                }),
              );
          } else if (child.type.name === "figcaption" && child.childCount) {
            out.push(
              new d.Paragraph({
                style: "Caption",
                alignment: d.AlignmentType.CENTER,
                children: inline(ctx, child),
              }),
            );
          }
        });
        break;
    }
  });
  return out;
}

async function docxDocument(book: RenderedBook) {
  const d = await import("docx");
  const preset = PRESETS[book.typography];
  const pt = BASE_PT * preset.fontSize;
  const twips = (ems: number) => Math.round(ems * pt * 20);
  const font = preset.fontFamily.split(",")[0].replace(/["']/g, "").trim();

  const notes = new Map<number, number>();
  const endnotes: Record<string, { children: ParagraphType[] }> = {};
  let next = 1;
  for (const chapter of book.chapters) {
    chapter.doc.descendants((node) => {
      if (node.type.name !== "endnote_ref") return true;
      const n = Number(node.attrs.number);
      if (!notes.has(n)) {
        notes.set(n, next);
        endnotes[String(next)] = {
          children: [
            new d.Paragraph({
              children: [new d.TextRun(book.notes.get(n) ?? "")],
            }),
          ],
        };
        next++;
      }
      return true;
    });
  }

  const ctx: Context = { d, book, notes, listInstance: 0 };
  const children: ParagraphType[] = [
    new d.Paragraph({
      heading: d.HeadingLevel.TITLE,
      alignment: d.AlignmentType.CENTER,
      spacing: { before: 2880, after: 240 },
      children: [new d.TextRun(book.title)],
    }),
    new d.Paragraph({
      alignment: d.AlignmentType.CENTER,
      children: [new d.TextRun({ text: book.author, italics: true })],
    }),
  ];
  if (book.publisher) {
    children.push(
      new d.Paragraph({
        alignment: d.AlignmentType.CENTER,
        spacing: { before: 720 },
        children: [new d.TextRun(book.publisher)],
      }),
    );
  }
  for (const chapter of book.chapters) {
    if (chapter.isEndnotes && notes.size > 0) continue;
    children.push(
      new d.Paragraph({
        heading: d.HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        alignment:
          preset.titleAlign === "center"
            ? d.AlignmentType.CENTER
            : d.AlignmentType.LEFT,
        children: [new d.TextRun(chapter.title)],
      }),
      ...blocks(ctx, chapter.doc, { list: 0, quote: false, ordered: null }),
    );
  }

  const bodyAlign =
    preset.textAlign === "justify"
      ? d.AlignmentType.JUSTIFIED
      : d.AlignmentType.LEFT;
  const doc = new d.Document({
    creator: book.author,
    title: book.title,
    description: book.blurb,
    endnotes,
    numbering: {
      config: [
        {
          reference: "numbered",
          levels: [0, 1, 2].map((level) => ({
            level,
            format: d.LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: d.AlignmentType.START,
            style: {
              paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } },
            },
          })),
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font, size: Math.round(pt * 2) },
          paragraph: {
            alignment: bodyAlign,
            spacing: {
              line: Math.round(240 * preset.lineHeight),
              after: twips(preset.paragraphSpacing),
            },
            indent: preset.textIndent
              ? { firstLine: twips(preset.textIndent) }
              : undefined,
          },
        },
      },
      paragraphStyles: [
        {
          id: "FirstParagraph",
          name: "First paragraph",
          basedOn: "Normal",
          paragraph: { indent: { firstLine: 0 } },
        },
        {
          id: "Caption",
          name: "Caption",
          basedOn: "Normal",
          run: { italics: true, size: Math.round(pt * 1.8) },
          paragraph: { indent: { firstLine: 0 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1800 },
          },
        },
        children,
      },
    ],
  });
  return { d, doc };
}

export async function buildDocx(book: RenderedBook): Promise<Blob> {
  const { d, doc } = await docxDocument(book);
  return d.Packer.toBlob(doc);
}

export async function docxXml(
  book: RenderedBook,
): Promise<Record<string, string>> {
  const { default: JSZip } = await import("jszip");
  const { d, doc } = await docxDocument(book);
  const zip = await JSZip.loadAsync(await d.Packer.toBuffer(doc));
  const out: Record<string, string> = {};
  for (const name of [
    "word/document.xml",
    "word/endnotes.xml",
    "word/numbering.xml",
  ]) {
    const file = zip.file(name);
    if (file) out[name] = await file.async("string");
  }
  return out;
}
