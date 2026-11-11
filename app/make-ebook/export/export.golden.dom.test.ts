import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { docxXml } from "./docx";
import {
  bookIdentifier,
  chapterSection,
  epubFiles,
  type EpubFile,
} from "./epub";
import { pdfHtml } from "./pdf";
import { previewDocument } from "./preview";
import { renderBook, type ExportInput } from "./render";
import { bookCss, PRESET_IDS } from "./styles";

const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const REF =
  '<a class="note-1" href="#end1" id="ref1" title="note 1" data-endnote-ref="1" data-endnote-id="note-a" style="color: #0066cc;"><sup>[1]</sup></a>';

export const SAMPLE: ExportInput = {
  title: "The Lighthouse",
  author: "Mara Quill",
  blurb: "A keeper, a storm & the ship that never came home.",
  publisher: "Quillmore Press",
  pubDate: "2026-03-01",
  isbn: "",
  language: "English",
  genre: "Literary fiction",
  tags: ["sea", "family"],
  coverFile: PNG,
  typography: "novel",
  chapters: [
    {
      id: "c1",
      title: "Dedication",
      type: "frontmatter",
      content: "<p>For my father, who kept the light.</p>",
    },
    {
      id: "c2",
      title: "The Light",
      type: "content",
      content: [
        "<p>The keeper counted every ship that passed the rocks.</p>",
        `<p style="text-align: center">He wrote their names <em>in a ledger</em>${REF} the colour of <strong>wet slate</strong>.</p>`,
        "<hr>",
        "<blockquote><p>The sea is patient.</p></blockquote>",
        "<h2>The log</h2>",
        "<ul><li><p>Wind</p></li><li><p>Tide</p></li></ul>",
        '<ol start="3"><li><p>Third</p></li><li><p>Fourth</p></li></ol>',
        `<figure><img src="${PNG}" alt="The tower"><figcaption>The tower at dusk</figcaption></figure>`,
        '<p>See <a href="https://example.com/tides">the tide tables</a> and <a href="#harbour-mark">the harbour</a>.</p>',
      ].join(""),
    },
    {
      id: "c3",
      title: "",
      type: "content",
      content:
        '<p><a id="harbour-mark"></a>The harbour master knew before anyone told him.</p>',
    },
    {
      id: "c4",
      title: "Endnotes",
      type: "backmatter",
      content:
        '<p data-endnote-entry-id="note-a">1. Slate grey, from the quarry above the bay. <a href="#ref1" id="end1" data-back-to-ref="1" class="endnote-back">[1]</a></p>',
    },
  ],
  endnotes: [
    {
      id: "note-a",
      number: 1,
      content: "Slate grey, from the quarry above the bay.",
    },
  ],
  endnoteReferences: [
    { id: "r1", number: 1, chapterId: "c2", endnoteId: "note-a" },
  ],
};

const OPTIONS = {
  identifier: bookIdentifier("", "00000000-0000-4000-8000-000000000001"),
  modified: new Date("2026-11-11T12:00:00Z"),
};

function text(files: EpubFile[], path: string): string {
  const file = files.find((f) => f.path === path);
  if (!file) throw new Error(`missing ${path}`);
  return file.data;
}

describe("the shared renderer", () => {
  const book = renderBook(SAMPLE);

  it("reads the book once for every format", () => {
    expect(book.language).toBe("en");
    expect(book.date).toBe("2026-03-01");
    expect(book.typography).toBe("novel");
    expect(book.chapters.map((c) => c.title)).toEqual([
      "Dedication",
      "The Light",
      "Chapter 2",
      "Endnotes",
    ]);
    expect(book.chapters.map((c) => c.isEndnotes)).toEqual([
      false,
      false,
      false,
      true,
    ]);
    expect(book.notes.get(1)).toBe(
      "Slate grey, from the quarry above the bay.",
    );
    expect(book.images.map((i) => i.name)).toEqual(["image1.png"]);
  });

  it("resolves links across chapters", () => {
    expect(book.noteHref(1, 1)).toBe("chapter4.xhtml#end1");
    expect(book.backHref(3, 1)).toBe("chapter2.xhtml#ref1");
    expect(book.href(1, "#harbour-mark")).toBe("chapter3.xhtml#harbour-mark");
    expect(book.href(2, "#harbour-mark")).toBe("#harbour-mark");
  });

  it("finds the endnotes chapter by its content, not its name", () => {
    const renamed = renderBook({
      ...SAMPLE,
      chapters: SAMPLE.chapters.map((c) =>
        c.id === "c4" ? { ...c, title: "Notes" } : c,
      ),
    });
    expect(renamed.noteHref(1, 1)).toBe("chapter4.xhtml#end1");
  });

  it("names images uniquely across chapters", () => {
    const other =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M9QzwAEjDAGACHgA/6vLHVIAAAAAElFTkSuQmCC";
    const two = renderBook({
      ...SAMPLE,
      chapters: [
        {
          id: "a",
          title: "A",
          type: "content",
          content: `<p><img src="${PNG}"></p>`,
        },
        {
          id: "b",
          title: "B",
          type: "content",
          content: `<p><img src="${other}"></p>`,
        },
      ],
    });
    expect(two.images.map((i) => i.name)).toEqual(["image1.png", "image2.png"]);
  });
});

describe("EPUB", () => {
  const files = epubFiles(renderBook(SAMPLE), OPTIONS);

  it("writes the mimetype first and uncompressed", () => {
    expect(files[0]).toEqual({
      path: "mimetype",
      data: "application/epub+zip",
      store: true,
    });
  });

  it("produces the same package as the golden copy", () => {
    expect(text(files, "OEBPS/content.opf")).toMatchSnapshot();
    expect(text(files, "OEBPS/nav.xhtml")).toMatchSnapshot();
    expect(text(files, "OEBPS/toc.ncx")).toMatchSnapshot();
    expect(text(files, "OEBPS/title.xhtml")).toMatchSnapshot();
  });

  it("produces the same chapters as the golden copy", () => {
    for (const path of ["chapter1", "chapter2", "chapter3", "chapter4"]) {
      expect(text(files, `OEBPS/${path}.xhtml`)).toMatchSnapshot(path);
    }
  });

  it("lists every file in the manifest", () => {
    const opf = text(files, "OEBPS/content.opf");
    for (const file of files) {
      if (!file.path.startsWith("OEBPS/") || file.path === "OEBPS/content.opf")
        continue;
      expect(opf).toContain(`href="${file.path.slice(6)}"`);
    }
  });

  it("writes a file EPUBCheck can read", async () => {
    const zip = new JSZip();
    for (const f of files) {
      zip.file(f.path, f.data, {
        base64: f.base64,
        compression: f.store ? "STORE" : "DEFLATE",
      });
    }
    const bytes = await zip.generateAsync({ type: "uint8array" });
    expect(bytes.length).toBeGreaterThan(1000);
    if (process.env.EPUB_OUT) writeFileSync(process.env.EPUB_OUT, bytes);
  });
});

describe("PDF", () => {
  it("prints the same chapters with the book's stylesheet", () => {
    const html = pdfHtml(renderBook(SAMPLE));
    expect(html).toContain(bookCss("novel"));
    expect(html).toContain('href="#end1"');
    expect(html).toContain('href="#harbour-mark"');
    expect(html).toMatchSnapshot();
  });
});

describe("Word", () => {
  it("produces the same document as the golden copy", async () => {
    const xml = await docxXml(renderBook(SAMPLE));
    const doc = xml["word/document.xml"].replace(
      /r:id="rId[A-Za-z0-9_-]{8,}"/g,
      'r:id="rIdLink"',
    );
    expect(doc).toContain("The keeper counted every ship");
    expect(doc).toContain("w:endnoteReference");
    expect(doc).not.toContain("Slate grey, from the quarry");
    expect(xml["word/endnotes.xml"]).toContain(
      "Slate grey, from the quarry above the bay.",
    );
    expect(doc).toMatchSnapshot();
    expect(xml["word/endnotes.xml"]).toMatchSnapshot();
  });
});

describe("presets", () => {
  it("gives every preset a stylesheet", () => {
    for (const id of PRESET_IDS) expect(bookCss(id)).toContain("font-family");
  });
});

describe("preview", () => {
  it("shows the same chapter and stylesheet as the EPUB", () => {
    const book = renderBook(SAMPLE);
    const files = epubFiles(book, OPTIONS);
    const view = {
      fontPx: 14,
      page: "#fff",
      ink: "#000",
      muted: "#777",
      paged: true,
    };
    for (const index of [0, 1, 2, 3]) {
      const html = previewDocument(book, index, view);
      expect(html).toContain(bookCss("novel"));
      expect(html).toContain(chapterSection(book, index, "inline"));
    }
    expect(text(files, "OEBPS/chapter3.xhtml")).toContain(
      previewDocument(book, 2, view).match(/<section[\s\S]*<\/section>/)![0],
    );
  });
});
