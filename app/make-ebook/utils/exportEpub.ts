import JSZip from "jszip";
import { uuidv4 } from "./uuid";
import { today } from "./constants";

// Helper: converts HTML to valid XHTML for EPUB
function toXhtml(html: string): string {
  return html
    .replace(/<br\s*>/gi, "<br />")
    .replace(/<img([^>]*?)(?<!\/)>/gi, "<img$1 />")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

// Helper: extracts images from HTML as { src, ext, data }[]
function extractImages(html: string) {
  // Only handles <img src="data:image/..." ... />
  const re = /<img[^>]+src=['"]data:image\/(png|jpeg|jpg);base64,([^'"]+)['"][^>]*>/gi;
  let match;
  let i = 1;
  const images: { tag: string; ext: string; data: string; filename: string }[] = [];
  while ((match = re.exec(html))) {
    const [tag, ext, base64] = match;
    images.push({
      tag,
      ext: ext === "jpeg" ? "jpg" : ext,
      data: base64,
      filename: `image${i++}.${ext === "jpeg" ? "jpg" : ext}`,
    });
  }
  return images;
}

// Helper: replaces <img src="data:..."> with <img src="images/filename.ext" ... />
function replaceImgSrcs(html: string, images: { tag: string; ext: string; data: string; filename: string }[]) {
  let newHtml = html;
  images.forEach(img => {
    // Replace only the exact tag (preserving attributes)
    const newTag = img.tag.replace(
      /src=['"][^'"]+['"]/i,
      `src="images/${img.filename}"`
    );
    newHtml = newHtml.replace(img.tag, newTag);
  });
  return newHtml;
}

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
  const safeBlurb = blurb && blurb.trim().length > 0 ? blurb.trim() : "N/A";
  const safePublisher = publisher && publisher.trim().length > 0 ? publisher.trim() : "N/A";

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
  let coverMeta = "";
  if (coverFile) {
    const ext = coverFile.type === "image/png" ? "png" : "jpg";
    coverHref = `cover.${ext}`;
    zip.file(
      "OEBPS/cover.xhtml",
      `<?xml version="1.0" encoding="utf-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><title>Cover</title></head>
        <body style="margin:0;padding:0;">
          <img src="${coverHref}" alt="cover" style="width:100%;height:auto;" />
        </body>
      </html>`
    );
    const coverData = await coverFile.arrayBuffer();
    zip.file(`OEBPS/${coverHref}`, coverData, { binary: true });
    coverItem = `<item id="cover-image" href="${coverHref}" media-type="${coverFile.type}" />
                 <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`;
    coverMeta = `<meta name="cover" content="cover-image"/>`;
  }

  // Build NAV (EPUB 3 navigation)
  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>Table of Contents</title>
    </head>
    <body>
      <nav epub:type="toc" id="toc">
        <h2>Table of Contents</h2>
        <ol>
          ${
            chapters
              .map(
                (ch, idx) =>
                  `<li><a href="chapter${idx + 1}.xhtml">${ch.title || `Chapter ${idx + 1}`}</a></li>`
              )
              .join("\n")
          }
        </ol>
      </nav>
    </body>
  </html>`;

  zip.file("OEBPS/nav.xhtml", navXhtml);

  // Collect all images from chapters
  let allImages: { tag: string; ext: string; data: string; filename: string }[] = [];
  chapters.forEach(ch => {
    allImages = allImages.concat(extractImages(ch.content));
  });
  // Deduplicate images by filename (in case of repeated image)
  const uniqueImages = Array.from(new Map(allImages.map(img => [img.filename, img])).values());

  // Write image files
  for (const img of uniqueImages) {
    const bytes = Uint8Array.from(atob(img.data), c => c.charCodeAt(0));
    zip.file(`OEBPS/images/${img.filename}`, bytes, { binary: true });
  }

  // Write chapters (with image src replacements)
  const chapterHrefs: string[] = [];
  chapters.forEach((ch, idx) => {
    const filename = `chapter${idx + 1}.xhtml`;
    chapterHrefs.push(filename);
    // Replace inline image data URLs with file references
    let chapterHtml = ch.content;
    const imgs = extractImages(chapterHtml);
    chapterHtml = replaceImgSrcs(chapterHtml, imgs);
    // Convert to XHTML
    chapterHtml = toXhtml(chapterHtml.replace(/\n/g, "<br />"));
    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="utf-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><title>${ch.title || `Chapter ${idx + 1}`}</title></head>
        <body>
          <h2>${ch.title || `Chapter ${idx + 1}`}</h2>
          <div>${chapterHtml}</div>
        </body>
      </html>`
    );
  });

  const subjects = [genre, ...tags].filter(Boolean);

  // Manifest for all images
  const imageManifestItems = uniqueImages
    .map(
      img =>
        `<item id="${img.filename.replace(/\W/g, "_")}" href="images/${img.filename}" media-type="image/${img.ext === "jpg" ? "jpeg" : img.ext}" />`
    )
    .join("\n      ");

  // Manifest for chapters
  const chapterManifestItems = chapterHrefs
    .map(
      (fn, i) =>
        `<item id="chapter${i + 1}" href="${fn}" media-type="application/xhtml+xml"/>`
    )
    .join("\n      ");

  // Manifest for navigation
  const navManifestItem = `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`;

  // Spine for chapters
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
        <dc:description>${safeBlurb}</dc:description>
        <dc:publisher>${safePublisher}</dc:publisher>
        <dc:date>${safeDate}</dc:date>
        ${subjects.map(s => `<dc:subject>${s}</dc:subject>`).join("\n          ")}
        ${coverMeta}
        <meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta>
      </metadata>
      <manifest>
        ${coverItem}
        ${chapterManifestItems}
        ${imageManifestItems}
        ${navManifestItem}
      </manifest>
      <spine toc="ncx">
        ${spineItems}
      </spine>
    </package>`
  );

  // Optional: generate legacy toc.ncx for compatibility
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