import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { exportEpub } from "./exportEpub";

const book = {
  title: "Tom & Jerry's <Big> Day",
  author: "A. N. Author",
  blurb: "A short book used to pin down what the exporter produces.",
  publisher: "Quillmore Press",
  pubDate: "2026-11-10",
  isbn: "9780000000001",
  language: "en-GB",
  genre: "Fiction",
  tags: ["test", "golden"],
  coverFile: null,
  chapters: [
    {
      id: "c1",
      title: "Dedication",
      type: "frontmatter" as const,
      content: "<p>For everyone who tests.</p>",
    },
    {
      id: "c2",
      title: "",
      type: "content" as const,
      content:
        "<p>It was a <strong>bright</strong> and <em>cold</em> day.</p><h2>A heading</h2><p>Second paragraph &amp; more.</p>",
    },
    {
      id: "c3",
      title: "The End & After",
      type: "content" as const,
      content: "<p>Last words.</p><blockquote><p>A quote.</p></blockquote>",
    },
  ],
  returnBlob: true,
};

async function unzip() {
  const blob = (await exportEpub(book)) as Blob;
  return JSZip.loadAsync(await blob.arrayBuffer());
}

function stable(text: string) {
  return text
    .replace(
      /<meta property="dcterms:modified">[^<]*<\/meta>/,
      '<meta property="dcterms:modified">DATE</meta>',
    )
    .replace(/urn:uuid:[0-9a-f-]+/g, "urn:uuid:ID");
}

describe("EPUB export", () => {
  it("starts with an uncompressed mimetype file", async () => {
    const zip = await unzip();
    const names = Object.keys(zip.files);
    expect(names[0]).toBe("mimetype");
    expect(await zip.file("mimetype")!.async("string")).toBe(
      "application/epub+zip",
    );
  });

  it("points the container at the package file", async () => {
    const zip = await unzip();
    const container = await zip.file("META-INF/container.xml")!.async("string");
    expect(container).toContain('full-path="OEBPS/content.opf"');
  });

  it("escapes metadata so the package stays valid XML", async () => {
    const zip = await unzip();
    const opf = await zip.file("OEBPS/content.opf")!.async("string");
    expect(opf).toContain(
      "<dc:title>Tom &amp; Jerry&apos;s &lt;Big&gt; Day</dc:title>",
    );
    expect(opf).not.toContain("<Big>");
    expect(opf).toContain(
      '<dc:identifier id="BookId">9780000000001</dc:identifier>',
    );
    expect(opf).toContain("<dc:language>en-GB</dc:language>");
  });

  it("keeps the chapter text and inline formatting", async () => {
    const zip = await unzip();
    const files = await Promise.all(
      Object.keys(zip.files)
        .filter((name) => name.startsWith("OEBPS/") && name.endsWith(".xhtml"))
        .map((name) => zip.file(name)!.async("string")),
    );
    const all = files.join("\n");
    expect(all).toContain("<strong>bright</strong>");
    expect(all).toContain("<em>cold</em>");
    expect(all).toContain("Second paragraph &amp; more.");
    expect(all).toContain("Last words.");
    expect(all).toContain("The End &amp; After");
    expect(all).not.toContain("The End & After");
  });

  it("produces the same package file as before", async () => {
    const zip = await unzip();
    const opf = await zip.file("OEBPS/content.opf")!.async("string");
    expect(stable(opf)).toMatchSnapshot();
  });

  it("produces the same file list as before", async () => {
    const zip = await unzip();
    expect(Object.keys(zip.files).sort()).toMatchSnapshot();
  });

  it("produces the same chapter files as before", async () => {
    const zip = await unzip();
    const chapters: Record<string, string> = {};
    for (const name of Object.keys(zip.files).sort()) {
      if (name.startsWith("OEBPS/") && name.endsWith(".xhtml")) {
        chapters[name] = stable(await zip.file(name)!.async("string"));
      }
    }
    expect(chapters).toMatchSnapshot();
  });
});
