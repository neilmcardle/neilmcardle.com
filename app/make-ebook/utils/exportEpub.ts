import JSZip from "jszip";
import { uuidv4 } from "./uuid";
import { today } from "./constants";
import { generateEpubCSS, TypographyPreset } from "./typographyPresets";

/** Map of common HTML named entities to numeric equivalents for valid XHTML */
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': '&#160;', '&ndash;': '&#8211;', '&mdash;': '&#8212;',
  '&lsquo;': '&#8216;', '&rsquo;': '&#8217;', '&ldquo;': '&#8220;', '&rdquo;': '&#8221;',
  '&bull;': '&#8226;', '&hellip;': '&#8230;', '&trade;': '&#8482;',
  '&copy;': '&#169;', '&reg;': '&#174;', '&deg;': '&#176;',
  '&laquo;': '&#171;', '&raquo;': '&#187;', '&cent;': '&#162;',
  '&pound;': '&#163;', '&euro;': '&#8364;', '&times;': '&#215;',
  '&divide;': '&#247;', '&frac12;': '&#189;', '&frac14;': '&#188;',
  '&frac34;': '&#190;', '&iquest;': '&#191;', '&iexcl;': '&#161;',
  '&sect;': '&#167;', '&para;': '&#182;', '&dagger;': '&#8224;',
  '&Dagger;': '&#8225;', '&permil;': '&#8240;', '&prime;': '&#8242;',
  '&Prime;': '&#8243;', '&larr;': '&#8592;', '&rarr;': '&#8594;',
  '&uarr;': '&#8593;', '&darr;': '&#8595;', '&harr;': '&#8596;',
  '&eacute;': '&#233;', '&egrave;': '&#232;', '&agrave;': '&#224;',
  '&aacute;': '&#225;', '&uuml;': '&#252;', '&ouml;': '&#246;',
  '&iuml;': '&#239;', '&ccedil;': '&#231;', '&ntilde;': '&#241;',
  '&Eacute;': '&#201;', '&Egrave;': '&#200;',
};

/** Converts HTML to valid XHTML for EPUB */
function toXhtml(html: string): string {
  let result = html
    .replace(/<br\s*>/gi, "<br />")
    .replace(/<img([^>]*?)(?<!\/)>/gi, "<img$1 />")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

  // Replace known HTML named entities with numeric equivalents
  for (const [entity, numeric] of Object.entries(HTML_ENTITIES)) {
    result = result.replaceAll(entity, numeric);
  }

  // Catch any remaining unknown named entities and convert to numeric
  // (XML only allows &amp; &lt; &gt; &quot; &apos;)
  result = result.replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name) => {
    if (['amp', 'lt', 'gt', 'quot', 'apos'].includes(name)) return match;
    // Try to decode via a temporary element trick at build time isn't possible,
    // so replace unknown entities with a space to prevent XML parse errors
    return ' ';
  });

  return result;
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
    
    // Remove dangerous attributes but preserve endnote data attributes
    normalized = normalized
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '') // onclick, onload, etc.
      .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '') // inline styles
      .replace(/\s*data-(?!back-to-ref|endnote)[^=]*\s*=\s*["'][^"']*["']/gi, ''); // data attributes except endnote ones
    
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

type Chapter = { id: string; title: string; content: string; type: 'frontmatter' | 'content' | 'backmatter' };

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
  coverFile: string | null;
  chapters: Chapter[];
  endnoteReferences?: { id: string; number: number; chapterId: string; endnoteId: string }[];
  typographyPreset?: TypographyPreset;
  returnBlob?: boolean; // If true, return blob instead of downloading
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
  endnoteReferences,
  typographyPreset = 'default',
  returnBlob = false,
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

  // Generate professional CSS based on typography preset
  const epubCSS = generateEpubCSS(typographyPreset);
  
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

  // Add professional stylesheet
  zip.file("OEBPS/styles.css", epubCSS);

  // --- COVER ---
  let coverHref = "";
  let coverItem = "";
  let coverMeta = "";
  if (coverFile) {
    // Parse data URL: "data:image/png;base64,..." or "data:image/jpeg;base64,..."
    const mimeMatch = coverFile.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const ext = mimeType === "image/png" ? "png" : "jpg";
    const base64Data = coverFile.replace(/^data:image\/\w+;base64,/, "");
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
    zip.file(`OEBPS/${coverHref}`, base64Data, { base64: true });
    coverItem = `<item id="cover-image" href="${coverHref}" media-type="${mimeType}" />
                 <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`;
    coverMeta = `<meta name="cover" content="cover-image"/>`;
  }

  // Use chapters in the exact order they appear in the editor (user-controlled order)
  const sortedChapters = chapters;

  // Create a mapping from chapter ID to sorted chapter filename for endnote cross-references
  const chapterIdToFilename = new Map<string, string>();
  sortedChapters.forEach((chapter, sortedIndex) => {
    chapterIdToFilename.set(chapter.id, `chapter${sortedIndex + 1}.xhtml`);
  });

  // --- CHAPTERS: Collect images and write chapter files ---
  let allImages: { tag: string; ext: string; data: string; filename: string }[] = [];
  sortedChapters.forEach(ch => {
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
    ...(() => {
      let contentNum = 1;
      return sortedChapters.map((ch, idx) => {
        const getTitle = (chapter: Chapter, contentNumber: number) => {
          if (chapter.title?.trim()) return chapter.title.trim();
          switch (chapter.type) {
            case 'frontmatter': return 'Front Matter';
            case 'backmatter': return 'Back Matter';
            case 'content': return `Chapter ${contentNumber}`;
            default: return `Chapter ${contentNumber}`;
          }
        };
        const displayTitle = getTitle(ch, contentNum);
        if (ch.type === 'content') contentNum++;
        return `<li><a href="chapter${idx + 1}.xhtml">${displayTitle}</a></li>`;
      });
    })(),
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
        <ul style="list-style-type: none; padding-left: 0;">
          ${tocLinks}
        </ul>
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
        <ul style="list-style-type: none; padding-left: 0;">
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
  let contentChapterNumber = 1;
  
  sortedChapters.forEach((ch, idx) => {
    const filename = `chapter${idx + 1}.xhtml`;
    chapterHrefs.push(filename);
    
    // Generate chapter title based on type
    const getChapterTitle = (chapter: Chapter, contentNumber: number) => {
      if (chapter.title?.trim()) {
        return chapter.title.trim();
      }
      
      switch (chapter.type) {
        case 'frontmatter':
          return 'Front Matter';
        case 'backmatter':
          return 'Back Matter';
        case 'content':
          return `Chapter ${contentNumber}`;
        default:
          return `Chapter ${contentNumber}`;
      }
    };
    
    const chapterTitle = getChapterTitle(ch, ch.type === 'content' ? contentChapterNumber : 0);
    if (ch.type === 'content') {
      contentChapterNumber++;
    }
    
    // Replace inline image data URLs with file references
    let chapterHtml = ch.content;
    const imgs = extractImages(chapterHtml);
    chapterHtml = replaceImgSrcs(chapterHtml, imgs);
    
    // Fix cross-document endnote links
    if (endnoteReferences) {
      // If this is the endnotes chapter, fix back-links to chapters
      if (ch.title?.toLowerCase() === 'endnotes') {
        chapterHtml = chapterHtml.replace(
          /href=(["'])#ref(\d+)\1/g,
          (match, quote, refNumber) => {
            const ref = endnoteReferences.find((r: { id: string; number: number; chapterId: string; endnoteId: string }) => r.number === parseInt(refNumber));
            if (ref && ref.chapterId) {
              const targetFilename = chapterIdToFilename.get(ref.chapterId);
              if (targetFilename) {
                return `href=${quote}${targetFilename}#ref${refNumber}${quote}`;
              }
            }
            return match;
          }
        );
      } else {
        // For regular chapters, fix forward-links to endnotes
        chapterHtml = chapterHtml.replace(
          /href=(["'])#end(\d+)\1/g,
          (match, quote, endnoteNumber) => {
            // Find the endnotes chapter filename
            const endnotesChapter = sortedChapters.find(c => c.title?.toLowerCase() === 'endnotes');
            if (endnotesChapter) {
              const endnotesFilename = chapterIdToFilename.get(endnotesChapter.id);
              if (endnotesFilename) {
                return `href=${quote}${endnotesFilename}#end${endnoteNumber}${quote}`;
              }
            }
            return match;
          }
        );
      }
    }
    
    // Apply comprehensive EPUB normalization and convert to XHTML
    chapterHtml = normalizeHtmlForEpub(chapterHtml);
    chapterHtml = toXhtml(chapterHtml);
    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="utf-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>${chapterTitle}</title>
          <link rel="stylesheet" type="text/css" href="styles.css"/>
        </head>
        <body>
          <h1 class="chapter-title">${chapterTitle}</h1>
          <div class="chapter-content">${chapterHtml}</div>
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
          ${coverFile ? `<li><a href="cover.xhtml">Cover</a></li>` : ""}
          <li><a href="${tocPageFilename}">Table of Contents</a></li>
          <li><a href="${publisherPageFilename}">Publisher Page</a></li>
          ${(() => {
            let contentNum = 1;
            return sortedChapters.map((ch, idx) => {
              const getTitle = (chapter: Chapter, contentNumber: number) => {
                if (chapter.title?.trim()) return chapter.title.trim();
                switch (chapter.type) {
                  case 'frontmatter': return 'Front Matter';
                  case 'backmatter': return 'Back Matter';
                  case 'content': return `Chapter ${contentNumber}`;
                  default: return `Chapter ${contentNumber}`;
                }
              };
              const displayTitle = getTitle(ch, contentNum);
              if (ch.type === 'content') contentNum++;
              return `<li><a href="chapter${idx + 1}.xhtml">${displayTitle}</a></li>`;
            }).join("\n");
          })()}
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

  // Manifest for stylesheet
  const styleManifestItem = `<item id="styles" href="styles.css" media-type="text/css"/>`;

  // Spine for reading order: cover → TOC → publisher → chapters
  const spineItems = [
    coverFile ? `<itemref idref="cover" linear="yes"/>` : "",
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
        ${styleManifestItem}
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
        ${coverFile ? `<navPoint id="navPoint-0" playOrder="0">
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
        ${(() => {
          let contentNum = 1;
          return sortedChapters.map((ch, i) => {
            const getTitle = (chapter: Chapter, contentNumber: number) => {
              if (chapter.title?.trim()) return chapter.title.trim();
              switch (chapter.type) {
                case 'frontmatter': return 'Front Matter';
                case 'backmatter': return 'Back Matter';
                case 'content': return `Chapter ${contentNumber}`;
                default: return `Chapter ${contentNumber}`;
              }
            };
            const displayTitle = getTitle(ch, contentNum);
            if (ch.type === 'content') contentNum++;
            return `<navPoint id="navPoint-${i + 3}" playOrder="${i + 3}">
              <navLabel><text>${displayTitle}</text></navLabel>
              <content src="${chapterHrefs[i]}"/>
            </navPoint>`;
          }).join("\n");
        })()}
      </navMap>
    </ncx>`
  );

  // --- Final ZIP and download trigger ---
  const blob = await zip.generateAsync({ type: "blob" });

  // If returnBlob is true, return the blob instead of downloading
  if (returnBlob) {
    return blob;
  }

  // Otherwise, download the file
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