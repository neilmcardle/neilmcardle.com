import JSZip from "jszip";
import { uuidv4 } from "./uuid";
import { today } from "./constants";

/** Converts HTML to valid XHTML for EPUB */
function toXhtml(html: string): string {
  return html
    .replace(/<br\s*>/gi, "<br />")
    .replace(/<img([^>]*?)(?<!\/)>/gi, "<img$1 />")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

/** Comprehensive EPUB content normalization with strict validation */
function normalizeHtmlForEpub(html: string): string {
  try {
    let normalized = html;
    
    // Preserve code blocks during normalization
    const preservedCodeBlocks = new Map<string, string>();
    let codeBlockCounter = 0;
    
    // Extract and preserve code blocks
    normalized = normalized.replace(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
      const placeholder = `__EPUB_CODE_BLOCK_${codeBlockCounter++}__`;
      preservedCodeBlocks.set(placeholder, match);
      return placeholder;
    });
    
    // Remove any remaining script or style tags
    normalized = normalized
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/<link[^>]*>/gi, '');
    
    // Remove dangerous attributes
    normalized = normalized
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '') // onclick, onload, etc.
      .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '') // inline styles
      .replace(/\s*data-[^=]*\s*=\s*["'][^"']*["']/gi, ''); // data attributes
    
    // Normalize heading levels (cap at H3 for EPUB)
    normalized = normalized
      .replace(/<h[4-6]([^>]*)>/gi, '<h3$1>')
      .replace(/<\/h[4-6]>/gi, '</h3>');
    
    // Ensure proper paragraph structure
    normalized = normalized
      .replace(/<div([^>]*)>/gi, '<p$1>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<p[^>]*>\s*<\/p>/gi, '') // Remove empty paragraphs
      .replace(/<p[^>]*>\s*<br\s*\/>\s*<\/p>/gi, '<p><br /></p>'); // Clean up paragraphs with only breaks
    
    // Clean up list structures
    normalized = normalized
      .replace(/<li[^>]*>\s*<\/li>/gi, '') // Remove empty list items
      .replace(/<ul[^>]*>\s*<\/ul>/gi, '') // Remove empty unordered lists
      .replace(/<ol[^>]*>\s*<\/ol>/gi, ''); // Remove empty ordered lists
    
    // Validate and clean image tags
    normalized = normalized
      .replace(/<img([^>]*?)(?<!\/)>/gi, '<img$1 />') // Self-close img tags
      .replace(/<img[^>]*src\s*=\s*["']data:[^"']*["'][^>]*>/gi, ''); // Remove data URLs (should be handled by extractImages)
    
    // Clean up whitespace and normalize structure (excluding code blocks)
    normalized = normalized
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();
    
    // Restore preserved code blocks before final validation
    preservedCodeBlocks.forEach((codeBlock, placeholder) => {
      normalized = normalized.replace(placeholder, codeBlock);
    });
    
    // Final validation: ensure no forbidden tags remain
    const forbiddenTags = ['script', 'style', 'object', 'embed', 'iframe', 'form', 'input', 'button'];
    forbiddenTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
      normalized = normalized.replace(regex, '');
      const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
      normalized = normalized.replace(selfClosing, '');
    });
    
    return normalized;
  } catch (error) {
    console.warn('Error normalizing HTML for EPUB:', error);
    // Fallback to basic XHTML conversion
    return toXhtml(html);
  }
}

/** Extracts embedded images from HTML as {src, ext, data, filename}[] */
function extractImages(html: string) {
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

/** Replaces embedded image srcs with file srcs */
function replaceImgSrcs(html: string, images: { tag: string; ext: string; data: string; filename: string }[]) {
  let newHtml = html;
  images.forEach(img => {
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
  const subjects = [genre, ...tags].filter(Boolean);

  const zip = new JSZip();

  // Required mimetype and container.xml
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

  // --- COVER ---
  let coverHref = "";
  let coverItem = "";
  let coverMeta = "";
  if (coverFile instanceof File) {
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

  // --- CHAPTERS: Collect images and write chapter files ---
  let allImages: { tag: string; ext: string; data: string; filename: string }[] = [];
  chapters.forEach(ch => {
    allImages = allImages.concat(extractImages(ch.content));
  });
  // Deduplicate images by filename
  const uniqueImages = Array.from(new Map(allImages.map(img => [img.filename, img])).values());

  // Write image files
  for (const img of uniqueImages) {
    const bytes = Uint8Array.from(atob(img.data), c => c.charCodeAt(0));
    zip.file(`OEBPS/images/${img.filename}`, bytes, { binary: true });
  }

  // --- VISIBLE TOC PAGE ---
  // Will appear before Publisher and chapters
  const tocPageFilename = "toc.xhtml";
  const publisherPageFilename = "publisher.xhtml";
  // Generate TOC links (Publisher Page + Chapters)
  const tocLinks = [
    `<li><a href="${publisherPageFilename}">Publisher Page</a></li>`,
    ...chapters.map(
      (ch, idx) =>
        `<li><a href="chapter${idx + 1}.xhtml">${ch.title || `Chapter ${idx + 1}`}</a></li>`
    ),
  ].join("\n          ");

  zip.file(
    `OEBPS/${tocPageFilename}`,
    `<?xml version="1.0" encoding="utf-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Table of Contents</title>
      </head>
      <body>
        <h2>Table of Contents</h2>
        <ol>
          ${tocLinks}
        </ol>
      </body>
    </html>`
  );

  // --- PUBLISHER PAGE ---
  zip.file(
    `OEBPS/${publisherPageFilename}`,
    `<?xml version="1.0" encoding="utf-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Publisher Page</title>
      </head>
      <body>
        <h2>Publisher Information</h2>
        <ul>
          <li><strong>Title:</strong> ${safeTitle}</li>
          <li><strong>Author:</strong> ${safeAuthor}</li>
          <li><strong>Publisher:</strong> ${safePublisher}</li>
          <li><strong>ISBN:</strong> ${isbn ? isbn : "N/A"}</li>
          <li><strong>Publication Date:</strong> ${safeDate}</li>
          <li><strong>Language:</strong> ${safeLang}</li>
          <li><strong>Description:</strong> ${safeBlurb}</li>
          ${
            subjects.length
              ? `<li><strong>Tags/Subjects:</strong> ${subjects.join(", ")}</li>`
              : ""
          }
        </ul>
      </body>
    </html>`
  );

  // --- CHAPTERS ---
  const chapterHrefs: string[] = [];
  chapters.forEach((ch, idx) => {
    const filename = `chapter${idx + 1}.xhtml`;
    chapterHrefs.push(filename);
    // Replace inline image data URLs with file references
    let chapterHtml = ch.content;
    const imgs = extractImages(chapterHtml);
    chapterHtml = replaceImgSrcs(chapterHtml, imgs);
    // Apply comprehensive EPUB normalization and convert to XHTML
    chapterHtml = normalizeHtmlForEpub(chapterHtml);
    chapterHtml = toXhtml(chapterHtml);
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

  // --- NAVIGATION (EPUB 3.3) ---
  // nav.xhtml for reader sidebar menus (not visible in main reading order)
  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>Navigation</title>
    </head>
    <body>
      <nav epub:type="toc" id="toc">
        <h2>Table of Contents</h2>
        <ol>
          ${coverFile instanceof File ? `<li><a href="cover.xhtml">Cover</a></li>` : ""}
          <li><a href="${tocPageFilename}">Table of Contents</a></li>
          <li><a href="${publisherPageFilename}">Publisher Page</a></li>
          ${chapters
            .map(
              (ch, idx) =>
                `<li><a href="chapter${idx + 1}.xhtml">${ch.title || `Chapter ${idx + 1}`}</a></li>`
            )
            .join("\n")}
        </ol>
      </nav>
    </body>
  </html>`;

  zip.file("OEBPS/nav.xhtml", navXhtml);

  // --- MANIFEST AND SPINE ---
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

  // Manifest for visible TOC and publisher pages
  const extraXhtmlManifestItems =
    `<item id="toc" href="${tocPageFilename}" media-type="application/xhtml+xml"/>
     <item id="publisher" href="${publisherPageFilename}" media-type="application/xhtml+xml"/>`;

  // Manifest for navigation
  const navManifestItem = `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`;

  // Spine for reading order: cover → TOC → publisher → chapters
  const spineItems = [
    coverFile instanceof File ? `<itemref idref="cover" linear="yes"/>` : "",
    `<itemref idref="toc"/>`,
    `<itemref idref="publisher"/>`,
    ...chapterHrefs.map((_, i) => `<itemref idref="chapter${i + 1}"/>`)
  ]
    .filter(Boolean)
    .join("\n      ");

  // --- content.opf ---
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
        ${extraXhtmlManifestItems}
        ${navManifestItem}
      </manifest>
      <spine toc="nav">
        ${spineItems}
      </spine>
    </package>`
  );

  // --- Legacy toc.ncx for maximum compatibility ---
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
        ${coverFile instanceof File ? `<navPoint id="navPoint-0" playOrder="0">
          <navLabel><text>Cover</text></navLabel>
          <content src="cover.xhtml"/>
        </navPoint>` : ""}
        <navPoint id="navPoint-toc" playOrder="1">
          <navLabel><text>Table of Contents</text></navLabel>
          <content src="${tocPageFilename}"/>
        </navPoint>
        <navPoint id="navPoint-publisher" playOrder="2">
          <navLabel><text>Publisher Page</text></navLabel>
          <content src="${publisherPageFilename}"/>
        </navPoint>
        ${chapters
          .map(
            (ch, i) => `<navPoint id="navPoint-${i + 3}" playOrder="${i + 3}">
              <navLabel><text>${ch.title || `Chapter ${i + 1}`}</text></navLabel>
              <content src="${chapterHrefs[i]}"/>
            </navPoint>`
          )
          .join("\n")}
      </navMap>
    </ncx>`
  );

  // --- Final ZIP and download trigger ---
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