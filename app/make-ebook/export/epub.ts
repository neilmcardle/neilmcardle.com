import { bookCss } from "./styles";
import type { RenderedBook } from "./render";
import { chapterBody, escapeXml } from "./xhtml";

export type EpubFile = {
  path: string;
  data: string;
  base64?: boolean;
  store?: boolean;
};

export type EpubOptions = {
  identifier: string;
  modified: Date;
};

const EPUB_TYPE: Record<string, string> = {
  frontmatter: "frontmatter",
  content: "bodymatter chapter",
  backmatter: "backmatter",
};

function page(
  book: RenderedBook,
  title: string,
  body: string,
  bodyType?: string,
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${escapeXml(book.language)}" lang="${escapeXml(book.language)}">
<head>
<meta charset="utf-8" />
<title>${escapeXml(title)}</title>
<link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body${bodyType ? ` epub:type="${bodyType}"` : ""}>
${body}
</body>
</html>
`;
}

function titlePage(book: RenderedBook): string {
  const publisher = book.publisher
    ? `<p class="book-publisher">${escapeXml(book.publisher)}</p>`
    : "";
  const details = [
    book.publisher && `Published by ${book.publisher}`,
    book.date && `First published ${book.date}`,
    book.isbn && `ISBN ${book.isbn}`,
  ].filter(Boolean) as string[];
  const detailBlock = details.length
    ? `<section class="details">${details.map((d) => `<p>${escapeXml(d)}</p>`).join("")}</section>`
    : "";
  return page(
    book,
    book.title,
    `<section class="title-page" epub:type="titlepage">
<h1 class="book-title">${escapeXml(book.title)}</h1>
<p class="book-author">${escapeXml(book.author)}</p>
${publisher}
</section>
${detailBlock}`,
    "frontmatter",
  );
}

export function chapterSection(
  book: RenderedBook,
  index: number,
  mode: "files" | "inline" = "files",
): string {
  const chapter = book.chapters[index];
  const type = chapter.isEndnotes
    ? "backmatter endnotes"
    : EPUB_TYPE[chapter.kind];
  const body = chapterBody({
    book,
    chapterIndex: index,
    images: mode,
    links: "files",
  });
  return `<section epub:type="${type}">
<h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
<div class="chapter-content">${body}</div>
</section>`;
}

function chapterPage(book: RenderedBook, index: number): string {
  return page(book, book.chapters[index].title, chapterSection(book, index));
}

function navPage(book: RenderedBook): string {
  const items = book.chapters
    .map((c) => `<li><a href="${c.file}">${escapeXml(c.title)}</a></li>`)
    .join("\n");
  return page(
    book,
    "Contents",
    `<nav epub:type="toc" id="toc">
<h1 class="chapter-title">Contents</h1>
<ol>
${items}
</ol>
</nav>
<nav epub:type="landmarks" hidden="hidden">
<ol>
<li><a epub:type="titlepage" href="title.xhtml">Title page</a></li>
<li><a epub:type="toc" href="nav.xhtml">Contents</a></li>
${book.chapters.length ? `<li><a epub:type="bodymatter" href="${(book.chapters.find((c) => c.kind === "content") ?? book.chapters[0]).file}">Start reading</a></li>` : ""}
</ol>
</nav>`,
  );
}

function coverPage(book: RenderedBook): string {
  return page(
    book,
    "Cover",
    `<section class="cover" epub:type="cover">
<img src="images/${book.cover!.name}" alt="${escapeXml(book.title)}" />
</section>`,
  );
}

function ncx(book: RenderedBook, options: EpubOptions): string {
  const points = [
    { label: book.title, src: "title.xhtml" },
    { label: "Contents", src: "nav.xhtml" },
    ...book.chapters.map((c) => ({ label: c.title, src: c.file })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head>
<meta name="dtb:uid" content="${escapeXml(options.identifier)}" />
<meta name="dtb:depth" content="1" />
<meta name="dtb:totalPageCount" content="0" />
<meta name="dtb:maxPageNumber" content="0" />
</head>
<docTitle><text>${escapeXml(book.title)}</text></docTitle>
<navMap>
${points
  .map(
    (p, i) => `<navPoint id="nav-${i + 1}" playOrder="${i + 1}">
<navLabel><text>${escapeXml(p.label)}</text></navLabel>
<content src="${p.src}" />
</navPoint>`,
  )
  .join("\n")}
</navMap>
</ncx>
`;
}

function modifiedStamp(date: Date): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}

function opf(book: RenderedBook, options: EpubOptions): string {
  const meta = [
    `<dc:identifier id="BookId">${escapeXml(options.identifier)}</dc:identifier>`,
    `<dc:title>${escapeXml(book.title)}</dc:title>`,
    `<dc:language>${escapeXml(book.language)}</dc:language>`,
    `<dc:creator>${escapeXml(book.author)}</dc:creator>`,
    book.publisher &&
      `<dc:publisher>${escapeXml(book.publisher)}</dc:publisher>`,
    book.blurb && `<dc:description>${escapeXml(book.blurb)}</dc:description>`,
    book.date && `<dc:date>${book.date}</dc:date>`,
    ...book.subjects.map((s) => `<dc:subject>${escapeXml(s)}</dc:subject>`),
    book.cover && `<meta name="cover" content="cover-image" />`,
    `<meta property="dcterms:modified">${modifiedStamp(options.modified)}</meta>`,
  ].filter(Boolean);

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />`,
    `<item id="styles" href="styles.css" media-type="text/css" />`,
    `<item id="title" href="title.xhtml" media-type="application/xhtml+xml" />`,
    ...(book.cover
      ? [
          `<item id="cover-image" href="images/${book.cover.name}" media-type="${book.cover.mime}" properties="cover-image" />`,
          `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" />`,
        ]
      : []),
    ...book.chapters.map(
      (c, i) =>
        `<item id="chapter${i + 1}" href="${c.file}" media-type="application/xhtml+xml" />`,
    ),
    ...book.images.map(
      (img, i) =>
        `<item id="image${i + 1}" href="images/${img.name}" media-type="${img.mime}" />`,
    ),
  ];

  const spine = [
    book.cover && `<itemref idref="cover" />`,
    `<itemref idref="title" />`,
    `<itemref idref="nav" />`,
    ...book.chapters.map((_, i) => `<itemref idref="chapter${i + 1}" />`),
  ].filter(Boolean);

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="${escapeXml(book.language)}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
${meta.join("\n")}
</metadata>
<manifest>
${manifest.join("\n")}
</manifest>
<spine toc="ncx">
${spine.join("\n")}
</spine>
</package>
`;
}

export function epubFiles(
  book: RenderedBook,
  options: EpubOptions,
): EpubFile[] {
  const files: EpubFile[] = [
    { path: "mimetype", data: "application/epub+zip", store: true },
    {
      path: "META-INF/container.xml",
      data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
</rootfiles>
</container>
`,
    },
    { path: "OEBPS/content.opf", data: opf(book, options) },
    { path: "OEBPS/toc.ncx", data: ncx(book, options) },
    { path: "OEBPS/nav.xhtml", data: navPage(book) },
    { path: "OEBPS/styles.css", data: bookCss(book.typography) },
    { path: "OEBPS/title.xhtml", data: titlePage(book) },
  ];
  if (book.cover) {
    files.push({ path: "OEBPS/cover.xhtml", data: coverPage(book) });
    files.push({
      path: `OEBPS/images/${book.cover.name}`,
      data: book.cover.data,
      base64: true,
    });
  }
  book.chapters.forEach((c, i) => {
    files.push({ path: `OEBPS/${c.file}`, data: chapterPage(book, i) });
  });
  for (const img of book.images) {
    files.push({
      path: `OEBPS/images/${img.name}`,
      data: img.data,
      base64: true,
    });
  }
  return files;
}

export function bookIdentifier(isbn: string, uuid: string): string {
  const digits = isbn.replace(/[^0-9Xx]/g, "");
  return digits.length === 10 || digits.length === 13
    ? `urn:isbn:${digits.toUpperCase()}`
    : `urn:uuid:${uuid}`;
}

export async function buildEpub(
  book: RenderedBook,
  options: EpubOptions,
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of epubFiles(book, options)) {
    zip.file(file.path, file.data, {
      base64: file.base64,
      compression: file.store ? "STORE" : "DEFLATE",
    });
  }
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
  });
}
