import JSZip from "jszip";
import { uuidv4 } from "../utils/uuid";
import { today } from "../utils/constants";

type Chapter = { title: string; content: string };

interface ExportEpubOptions {
  title: string;
  author: string;
  blurb: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  language: string;
  genre: string;
  tags: string[];
  coverFile: File | null;
  chapters: Chapter[];
}

export async function exportEpub({
  title,
  author,
  blurb,
  publisher,
  pubDate,
  isbn,
  language,
  genre,
  tags,
  coverFile,
  chapters,
}: ExportEpubOptions) {
  const bookId = isbn.trim() ? isbn.trim() : "urn:uuid:" + uuidv4();
  const safeTitle = title.trim() || "Untitled";
  const safeAuthor = author.trim() || "Unknown Author";
  const safeLang = language || "en";
  const d = new Date(pubDate);
  const safeDate = isNaN(d.getTime()) ? today : d.toISOString().slice(0, 10);

  const zip = new JSZip();

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
      </rootfiles>
    </container>`
  );
  let coverHref = "";
  let coverItem = "";
  if (coverFile) {
    const ext = coverFile.type === "image/png" ? "png" : "jpg";
    coverHref = `cover.${ext}`;
    zip.file(
      "OEBPS/cover.xhtml",
      `<?xml version="1.0" encoding="utf-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><title>Cover</title></head>
        <body style="margin:0;padding:0;">
          <img src="${coverHref}" alt="cover" style="width:100%;height:auto;"/>
        </body>
      </html>`
    );
    const coverData = await coverFile.arrayBuffer();
    zip.file(`OEBPS/${coverHref}`, coverData, { binary: true });
    coverItem = `<item id="cover-image" href="${coverHref}" media-type="${coverFile.type}" />
                 <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`;
  }
  const chapterHrefs: string[] = [];
  chapters.forEach((ch, idx) => {
    const filename = `chapter${idx + 1}.xhtml`;
    chapterHrefs.push(filename);
    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="utf-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><title>${ch.title || `Chapter ${idx + 1}`}</title></head>
        <body>
          <h2>${ch.title || `Chapter ${idx + 1}`}</h2>
          <div>${ch.content.replace(/\n/g, "<br/>")}</div>
        </body>
      </html>`
    );
  });
  const subjects = [genre, ...tags].filter(Boolean);
  const coverMeta = coverFile ? `<meta name="cover" content="cover-image"/>` : "";
  const manifestItems = [
    coverItem,
    ...chapterHrefs.map(
      (fn, i) =>
        `<item id="chapter${i + 1}" href="${fn}" media-type="application/xhtml+xml"/>`
    ),
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
  ]
    .filter(Boolean)
    .join("\n      ");
  const spineItems = [
    coverFile ? `<itemref idref="cover" linear="no"/>` : "",
    ...chapterHrefs.map((_, i) => `<itemref idref="chapter${i + 1}"/>`)
  ]
    .filter(Boolean)
    .join("\n      ");
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="BookId">${bookId}</dc:identifier>
        <dc:title>${safeTitle}</dc:title>
        <dc:language>${safeLang}</dc:language>
        <dc:creator>${safeAuthor}</dc:creator>
        <dc:description>${blurb}</dc:description>
        <dc:publisher>${publisher}</dc:publisher>
        <dc:date>${safeDate}</dc:date>
        ${subjects.map(s => `<dc:subject>${s}</dc:subject>`).join("\n          ")}
        ${coverMeta}
        <meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta>
      </metadata>
      <manifest>
        ${manifestItems}
      </manifest>
      <spine toc="ncx">
        ${spineItems}
      </spine>
    </package>`
  );
  zip.file(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>
    <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
      <head>
        <meta name="dtb:uid" content="${bookId}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
      </head>
      <docTitle><text>${safeTitle}</text></docTitle>
      <navMap>
        ${chapters
          .map(
            (ch, i) => `<navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
              <navLabel><text>${ch.title || `Chapter ${i + 1}`}</text></navLabel>
              <content src="${chapterHrefs[i]}"/>
            </navPoint>`
          )
          .join("\n")}
      </navMap>
    </ncx>`
  );
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeTitle.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}