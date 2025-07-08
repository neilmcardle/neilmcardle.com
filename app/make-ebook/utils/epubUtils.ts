import JSZip from "jszip";
import { saveAs } from "file-saver";
import { htmlEscape } from "./htmlEscape";
import { getCoverFileInfo } from "./getCoverFileInfo";
import type { BookData } from "../types";

export async function generateEpub(book: BookData) {
  const { title, author, isbn, chapters, cover } = book;
  const zip = new JSZip();
  const coverInfo = cover ? getCoverFileInfo(cover) : null;

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

  // Add cover image if present
  if (cover && coverInfo) {
    zip.file(`OEBPS/cover.${coverInfo.ext}`, coverInfo.base64, { base64: true });
  }

  // Add cover.xhtml page
  if (cover && coverInfo) {
    zip.file(
      "OEBPS/cover.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Cover</title>
        </head>
        <body style="margin:0;padding:0;text-align:center;background:#fff;">
          <img src="cover.${coverInfo.ext}" alt="Cover" style="max-width:100vw;max-height:100vh;object-fit:contain;display:block;margin:auto;" />
        </body>
      </html>`
    );
  }

  const manifestItems: string[] = [];
  const spineItems: string[] = [];
  chapters.forEach((ch, idx) => {
    const filename = `chapter${idx + 1}.xhtml`;
    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="UTF-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>${htmlEscape(ch.title || `Chapter ${idx + 1}`)}</title>
        </head>
        <body>
          <h2>${htmlEscape(ch.title || `Chapter ${idx + 1}`)}</h2>
          ${ch.content}
        </body>
      </html>`
    );
    manifestItems.push(
      `<item id="chapter${idx + 1}" href="${filename}" media-type="application/xhtml+xml"/>`
    );
    spineItems.push(`<itemref idref="chapter${idx + 1}"/>`);
  });

  zip.file(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>
    <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
      <head>
        <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
      </head>
      <docTitle><text>${htmlEscape(title || "Untitled Book")}</text></docTitle>
      <navMap>
        ${cover ? `<navPoint id="navPoint-0" playOrder="0">
          <navLabel><text>Cover</text></navLabel>
          <content src="cover.xhtml"/>
        </navPoint>` : ""}
        ${chapters.map((ch, idx) => `
          <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
            <navLabel><text>${htmlEscape(ch.title || `Chapter ${idx + 1}`)}</text></navLabel>
            <content src="chapter${idx + 1}.xhtml"/>
          </navPoint>
        `).join("")}
      </navMap>
    </ncx>`
  );

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${htmlEscape(title || "Untitled Book")}</dc:title>
        <dc:creator>${htmlEscape(author || "Anonymous")}</dc:creator>
        <dc:identifier id="bookid">${isbn ? `urn:isbn:${htmlEscape(isbn)}` : `urn:uuid:${crypto.randomUUID()}`}</dc:identifier>
        <dc:language>en</dc:language>
        ${cover ? `<meta name="cover" content="cover-image"/>` : ""}
      </metadata>
      <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        ${cover ? `<item id="cover-image" href="cover.${coverInfo.ext}" media-type="${coverInfo.mime}"/>` : ""}
        ${cover ? `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>` : ""}
        ${manifestItems.join("\n")}
      </manifest>
      <spine toc="ncx">
        ${cover ? `<itemref idref="cover" linear="yes"/>` : ""}
        ${spineItems.join("\n")}
      </spine>
    </package>`
  );

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${title ? title.replace(/[^a-z0-9]/gi, "_") : "book"}.epub`);
}
