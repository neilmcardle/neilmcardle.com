"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import sanitizeHtml from "sanitize-html";

// Place your SVG file in /public as /caveman.svg
const LOGO_SRC = "/caveman.svg";
const MASCOT_SRC = "/make-ebook-caveman.svg";

type Chapter = {
  title: string;
  content: string;
};

type BookData = {
  title: string;
  author: string;
  language: string;
  coverImage?: string;
  coverImageFile?: File;
  coverAlt?: string;
  chapters: Chapter[];
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  genre?: string;
  blurb?: string;
  tags?: string;
};

const initialBook: BookData = {
  title: "",
  author: "",
  language: "en",
  coverImage: undefined,
  coverImageFile: undefined,
  coverAlt: "",
  chapters: [{ title: "", content: "" }],
  publisher: "",
  publicationDate: "",
  isbn: "",
  genre: "",
  blurb: "",
  tags: ""
};

// Helper to escape XML special characters
function escapeXML(str: string) {
  // If input is undefined or null, return empty string
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default function MakeEbookPage() {
  const [book, setBook] = useState<BookData>(initialBook);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [chapterToDelete, setChapterToDelete] = useState<number | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);

  function handleBookChange(field: keyof BookData, value: string) {
    setBook({ ...book, [field]: value });
  }

  function handleChapterChange(field: "title" | "content", value: string) {
    const updated = [...book.chapters];
    updated[currentChapter] = { ...updated[currentChapter], [field]: value };
    setBook({ ...book, chapters: updated });
  }

  function handleChapterAdd() {
    setBook({ ...book, chapters: [...book.chapters, { title: "", content: "" }] });
    setCurrentChapter(book.chapters.length);
  }

  function handleChapterDeleteStart(idx: number) {
    setChapterToDelete(idx);
  }

  function handleChapterDeleteConfirm() {
    if (chapterToDelete !== null && book.chapters.length > 1) {
      const updated = book.chapters.filter((_, i) => i !== chapterToDelete);
      setBook({ ...book, chapters: updated });
      setCurrentChapter(Math.max(0, chapterToDelete - 1));
    }
    setChapterToDelete(null);
  }

  function handleChapterDeleteCancel() {
    setChapterToDelete(null);
  }

  // Cover image handling
  function handleCoverImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        setBook((old) => ({
          ...old,
          coverImage: ev.target?.result as string,
          coverImageFile: file
        }));
        setCoverPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCoverImageRemove() {
    setBook((old) => ({
      ...old,
      coverImage: undefined,
      coverImageFile: undefined
    }));
    setCoverPreview(undefined);
  }

  function handleCoverAltChange(value: string) {
    setBook((old) => ({
      ...old,
      coverAlt: value
    }));
  }

  // --- EPUB GENERATION AND DOWNLOAD ---
  async function handleDownloadEpub() {
    const zip = new JSZip();

    // Generate one UUID for OPF and NCX
    const epubUUID =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2);

    // Use current UTC ISO string for dcterms:modified
    const nowISO = new Date().toISOString().replace(/\.\d+Z$/, "Z");

    // Minimal ePub files
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file(
      "META-INF/container.xml",
      `
      <?xml version="1.0"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>
    `.trim()
    );

    // Publisher Page XHTML
    const publisherPageHtml = `
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Publisher &amp; Metadata</title>
      </head>
      <body style="font-family: sans-serif; margin: 2em;">
        <h1 style="font-size:2em;">${escapeXML(sanitizeHtml(book.title || "Untitled Book"))}</h1>
        <h2 style="font-size:1.2em;">by ${escapeXML(sanitizeHtml(book.author || "Unknown Author"))}</h2>
        ${book.publisher ? `<p><strong>Publisher:</strong> ${escapeXML(sanitizeHtml(book.publisher))}</p>` : ""}
        ${book.publicationDate ? `<p><strong>Publication Date:</strong> ${escapeXML(sanitizeHtml(book.publicationDate))}</p>` : ""}
        ${book.isbn ? `<p><strong>ISBN:</strong> ${escapeXML(sanitizeHtml(book.isbn))}</p>` : ""}
        ${book.genre ? `<p><strong>Genre:</strong> ${escapeXML(sanitizeHtml(book.genre))}</p>` : ""}
        ${book.tags ? `<p><strong>Keywords:</strong> ${escapeXML(sanitizeHtml(book.tags))}</p>` : ""}
        ${book.blurb ? `<div style="margin-top:1.5em;"><strong>Description:</strong><div style="margin-top:0.5em;">${escapeXML(sanitizeHtml(book.blurb))}</div></div>` : ""}
        <hr style="margin:2em 0;" />
        <div style="display:flex;align-items:center;gap:1em;">
          <img src="makeebook-logo.svg" alt="makeEbook logo" style="height:48px;width:48px;vertical-align:middle;" />
          <span style="font-size:1.15em;">Built using <strong>makeEbook</strong></span>
        </div>
        <p style="margin-top:0.5em;color:#666;font-size:0.95em;">
          This book was created using the makeEbook form at neilmcardle.com.
        </p>
      </body>
    </html>
    `.trim();

    // Contents Page XHTML (add nav role for EPUB3 navigation and declare epub namespace)
    const contentsPageHtml = `
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
      <head>
        <title>Contents</title>
      </head>
      <body style="font-family: sans-serif; margin: 2em;">
        <nav epub:type="toc" role="doc-toc">
          <h1>Contents</h1>
          <ol>
            ${book.chapters.map((ch, i) =>
              `<li><a href="chapter${i}.xhtml">${escapeXML(sanitizeHtml(ch.title || `Chapter ${i + 1}`))}</a></li>`
            ).join("\n")}
          </ol>
        </nav>
      </body>
    </html>
    `.trim();

    // Build HTML for each chapter, sanitize chapter content
    const chapterHtmls = book.chapters.map((ch, i) => {
      const safeContent = escapeXML(sanitizeHtml(ch.content || "", {
        allowedTags: [
          "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
          "em", "strong", "ul", "ol", "li", "a", "img", "blockquote"
        ],
        allowedAttributes: {
          a: ["href", "title"],
          img: ["src", "alt", "width", "height"]
        },
        parser: { lowerCaseTags: true }
      }));
      return `
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <title>${escapeXML(sanitizeHtml(ch.title || `Chapter ${i + 1}`))}</title>
          </head>
          <body>
            <h2>${escapeXML(sanitizeHtml(ch.title || `Chapter ${i + 1}`))}</h2>
            <div>${safeContent}</div>
          </body>
        </html>
      `;
    });

    // Manifest & Spine
    const manifestItems = [
      `<item id="publisher" href="publisher.xhtml" media-type="application/xhtml+xml"/>`,
      `<item id="contents" href="contents.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
      ...(book.coverImageFile
        ? [
            `<item id="cover" href="cover.${getImageExtension(
              book.coverImageFile.type
            )}" media-type="${book.coverImageFile.type}" properties="cover-image"/>`,
            `<item id="coverpage" href="cover.xhtml" media-type="application/xhtml+xml"/>`
          ]
        : []),
      ...book.chapters.map(
        (_, i) =>
          `<item id="chapter${i}" href="chapter${i}.xhtml" media-type="application/xhtml+xml"/>`
      ),
      `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
    ].join("\n");

    const spineItems = [
      `<itemref idref="publisher"/>`,
      `<itemref idref="contents"/>`,
      ...(book.coverImageFile ? [`<itemref idref="coverpage" linear="yes"/>`] : []),
      ...book.chapters.map((_, i) => `<itemref idref="chapter${i}"/>`)
    ].join("\n");

    // OPF (ePub manifest) - corrected according to EPUBCheck
    zip.file(
      "OEBPS/content.opf",
      `
      <?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>${escapeXML(sanitizeHtml(book.title || "Untitled Book"))}</dc:title>
          <dc:creator>${escapeXML(sanitizeHtml(book.author || "Unknown Author"))}</dc:creator>
          <dc:language>${escapeXML(sanitizeHtml(book.language || "en"))}</dc:language>
          <dc:identifier id="BookId">urn:uuid:${epubUUID}</dc:identifier>
          <meta property="dcterms:modified">${nowISO}</meta>
          ${book.publisher ? `<dc:publisher>${escapeXML(sanitizeHtml(book.publisher))}</dc:publisher>` : ""}
          ${book.publicationDate ? `<meta property="dcterms:issued">${escapeXML(sanitizeHtml(book.publicationDate))}</meta>` : ""}
          ${book.isbn ? `<dc:identifier>${escapeXML(sanitizeHtml(book.isbn))}</dc:identifier>` : ""}
          ${book.genre ? `<dc:subject>${escapeXML(sanitizeHtml(book.genre))}</dc:subject>` : ""}
          ${book.blurb ? `<dc:description>${escapeXML(sanitizeHtml(book.blurb))}</dc:description>` : ""}
          ${
            book.coverImageFile
              ? `<meta name="cover" content="cover"/>`
              : ""
          }
        </metadata>
        <manifest>
          ${manifestItems}
        </manifest>
        <spine toc="ncx">
          ${spineItems}
        </spine>
        <guide>
          <reference type="cover" title="Cover" href="cover.xhtml"/>
        </guide>
      </package>
    `.trim()
    );

    // Add publisher page
    zip.file(`OEBPS/publisher.xhtml`, publisherPageHtml);

    // Add contents page
    zip.file(`OEBPS/contents.xhtml`, contentsPageHtml);

    // Add chapters
    chapterHtmls.forEach((html, i) => {
      zip.file(`OEBPS/chapter${i}.xhtml`, html);
    });

    // Add cover image file and cover.xhtml (with alt text for accessibility)
    if (book.coverImageFile) {
      const arrayBuffer = await book.coverImageFile.arrayBuffer();
      zip.file(
        `OEBPS/cover.${getImageExtension(book.coverImageFile.type)}`,
        arrayBuffer
      );

      // Add a cover.xhtml file for navigation, with alt text
      zip.file(
        "OEBPS/cover.xhtml",
        `
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <title>Cover</title>
          </head>
          <body>
            <img src="cover.${getImageExtension(
              book.coverImageFile.type
            )}" alt="${escapeXML(sanitizeHtml(book.coverAlt || "Book cover"))}" style="display:block; max-width:100%; margin:auto;"/>
          </body>
        </html>
        `.trim()
      );
    }

    // NCX (table of contents) - use same UUID as OPF
    zip.file(
      "OEBPS/toc.ncx",
      `
      <?xml version="1.0" encoding="UTF-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
        <head>
          <meta name="dtb:uid" content="urn:uuid:${epubUUID}"/>
        </head>
        <docTitle><text>${escapeXML(sanitizeHtml(book.title || "Untitled Book"))}</text></docTitle>
        <navMap>
          <navPoint id="publisher" playOrder="0">
            <navLabel><text>Publisher &amp; Metadata</text></navLabel>
            <content src="publisher.xhtml"/>
          </navPoint>
          <navPoint id="contents" playOrder="1">
            <navLabel><text>Contents</text></navLabel>
            <content src="contents.xhtml"/>
          </navPoint>
          ${book.coverImageFile ? `
            <navPoint id="cover" playOrder="2">
              <navLabel><text>Cover</text></navLabel>
              <content src="cover.xhtml"/>
            </navPoint>
          ` : ""}
          ${book.chapters
            .map(
              (ch, i) => `
            <navPoint id="navPoint-${i + 3}" playOrder="${i + 3}">
              <navLabel><text>${escapeXML(sanitizeHtml(ch.title || `Chapter ${i + 1}`))}</text></navLabel>
              <content src="chapter${i}.xhtml"/>
            </navPoint>
          `
            )
            .join("\n")}
        </navMap>
      </ncx>
    `.trim()
    );

    // Generate zip and trigger download
    const blob = await zip.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip"
    });
    saveAs(blob, (book.title || "ebook") + ".epub");
  }

  function Preview() {
    return (
      <div className="text-left">
        <h1 className="text-2xl font-bold mb-2">
          {book.title || "Untitled Book"}
        </h1>
        <h2 className="text-lg text-[#86868B] mb-4">
          {book.author || "Author"}
        </h2>
        {coverPreview && (
          <div className="mb-4">
            <Image
              src={coverPreview}
              alt={book.coverAlt || "Book cover"}
              width={160}
              height={256}
              style={{
                objectFit: "cover",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 8px rgba(0,0,0,0.12)"
              }}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {book.coverAlt ? `Alt text: ${book.coverAlt}` : ""}
            </div>
          </div>
        )}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">Publisher & Metadata</h3>
          <ul className="text-sm">
            {book.publisher && <li><strong>Publisher:</strong> {book.publisher}</li>}
            {book.publicationDate && <li><strong>Publication Date:</strong> {book.publicationDate}</li>}
            {book.isbn && <li><strong>ISBN:</strong> {book.isbn}</li>}
            {book.genre && <li><strong>Genre:</strong> {book.genre}</li>}
            {book.tags && <li><strong>Keywords:</strong> {book.tags}</li>}
          </ul>
          {book.blurb && (
            <div className="mt-2 text-sm">
              <strong>Description:</strong> {book.blurb}
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <Image src={LOGO_SRC} alt="makeEbook logo" width={32} height={32} />
            <span className="text-sm">Built using <strong>makeEbook</strong></span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">Contents</h3>
          <ol className="ml-6 list-decimal">
            {book.chapters.map((ch, idx) => (
              <li key={idx}>
                <span>{ch.title || `Chapter ${idx + 1}`}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          {book.chapters.map((ch, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="font-semibold text-lg mb-1">
                {ch.title || `Chapter ${idx + 1}`}
              </h3>
              <div className="prose prose-sm max-w-none">
                {ch.content || (
                  <span className="text-[#86868B]">No content.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[980px] mx-auto px-4 pt-4">
          <nav className="flex items-center justify-between bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 rounded-full px-4 py-3">
            <div className="flex items-center space-x-2">
              <Image
                src={LOGO_SRC}
                alt="makeEbook logo"
                width={32}
                height={32}
              />
              <span className="text-xl font-semibold text-[#1D1D1F]">
                makeEbook
              </span>
            </div>
            <Link href="/">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10 text-[#1D1D1F]"
                aria-label="Return to main site"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center pt-[120px] pb-12">
          <Image
            src={MASCOT_SRC}
            alt="Caveman mascot"
            width={240}
            height={240}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-[56px] leading-tight font-semibold tracking-tight mb-4 text-[#1D1D1F] text-center">
            Create Ebooks in Minutes
          </h1>
          <p className="text-xl md:text-2xl text-[#86868B] max-w-2xl mx-auto mb-10 text-center">
            Simple eBook Creation with Professional Results
          </p>
        </section>

        {/* Try It Now/Form Section */}
        <section className="py-20 px-4 bg-[#F5F5F7]">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-[40px] font-semibold text-center mb-16 text-[#1D1D1F]">
              Try It Now
            </h2>
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl mx-auto">
              {/* Tab buttons */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-[200px] grid-cols-2">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "edit"}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      tab === "edit"
                        ? "bg-background text-foreground shadow-sm"
                        : ""
                    }`}
                    onClick={() => setTab("edit")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "preview"}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      tab === "preview"
                        ? "bg-background text-foreground shadow-sm"
                        : ""
                    }`}
                    onClick={() => setTab("preview")}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Tab content */}
              {tab === "edit" ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="title"
                    >
                      Book Title
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="title"
                      placeholder="Enter your book title"
                      value={book.title}
                      onChange={(e) =>
                        handleBookChange("title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="author"
                    >
                      Author
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="author"
                      placeholder="Enter author name"
                      value={book.author}
                      onChange={(e) =>
                        handleBookChange("author", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="language"
                    >
                      Language
                    </label>
                    <select
                      id="language"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      value={book.language}
                      onChange={(e) =>
                        handleBookChange("language", e.target.value)
                      }
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="publisher"
                    >
                      Publisher
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="publisher"
                      placeholder="Publisher name"
                      value={book.publisher}
                      onChange={(e) =>
                        handleBookChange("publisher", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="publicationDate"
                    >
                      Publication Date
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="publicationDate"
                      type="date"
                      value={book.publicationDate}
                      onChange={(e) =>
                        handleBookChange("publicationDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="isbn"
                    >
                      ISBN
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="isbn"
                      placeholder="ISBN"
                      value={book.isbn}
                      onChange={(e) =>
                        handleBookChange("isbn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="genre"
                    >
                      Genre / Subject
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="genre"
                      placeholder="Genre or subject"
                      value={book.genre}
                      onChange={(e) =>
                        handleBookChange("genre", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="blurb"
                    >
                      Description/Blurb
                    </label>
                    <textarea
                      className="p-3 border rounded-md w-full min-h-[60px] focus:outline-none prose prose-sm max-w-none overflow-auto"
                      id="blurb"
                      placeholder="Book description or blurb"
                      value={book.blurb}
                      onChange={(e) =>
                        handleBookChange("blurb", e.target.value)
                      }
                      maxLength={1000}
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="tags"
                    >
                      Tags / Keywords
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="tags"
                      placeholder="Comma-separated tags"
                      value={book.tags}
                      onChange={(e) =>
                        handleBookChange("tags", e.target.value)
                      }
                    />
                  </div>
                  {/* --- Cover Image Section - Improved Styling --- */}
                  <div className="rounded-lg bg-[#f9fafb] border border-[#e5e7eb] p-6 mb-6">
                    <label
                      className="block text-base font-semibold leading-tight mb-1"
                      htmlFor="coverImage"
                    >
                      Cover Image <span className="text-xs font-normal text-[#86868B]">(optional)</span>
                    </label>
                    <div className="text-xs text-muted-foreground mb-4">
                      <div>
                        <span className="font-medium">Recommended:</span> 1600×2560px, JPG/PNG, 300dpi, RGB.
                      </div>
                      <div>
                        <span>Need a professional cover? I design book covers!</span>
                        <a
                          href="mailto:hello@neilmcardle.com?subject=Book%20Cover%20Design%20Inquiry"
                          className="ml-2 inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition"
                          style={{ verticalAlign: "middle" }}
                        >
                          Hire me for bespoke cover design!
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center flex-wrap">
                      <label
                        htmlFor="coverImage"
                        className="inline-block rounded-md bg-black text-white font-semibold px-4 py-2 cursor-pointer hover:bg-gray-800 transition"
                        style={{ minWidth: 120, textAlign: "center" }}
                      >
                        {coverPreview ? "Change Cover" : "Choose File"}
                        <input
                          id="coverImage"
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-[#86868B]">
                        {coverPreview
                          ? "File selected"
                          : "No file selected."}
                      </span>
                      {coverPreview && (
                        <div className="relative ml-2">
                          <Image
                            src={coverPreview}
                            alt={book.coverAlt || "Book cover"}
                            width={48}
                            height={77}
                            style={{
                              objectFit: "cover",
                              borderRadius: "0.25rem",
                              boxShadow: "0 1px 8px rgba(0,0,0,0.08)"
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow p-1 text-red-500 hover:text-red-700"
                            style={{ fontSize: "1rem" }}
                            onClick={handleCoverImageRemove}
                            aria-label="Remove cover"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>
                    {coverPreview && (
                      <div className="mt-3">
                        <label
                          htmlFor="coverAlt"
                          className="text-xs font-medium leading-none block mb-1"
                        >
                          Cover Image Alt Text <span className="text-[#86868B]">(for accessibility)</span>:
                        </label>
                        <input
                          type="text"
                          id="coverAlt"
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-xs"
                          placeholder="Describe your book cover for visually impaired readers"
                          value={book.coverAlt}
                          onChange={e => handleCoverAltChange(e.target.value)}
                          maxLength={200}
                        />
                      </div>
                    )}
                  </div>
                  {/* Chapter tabs */}
                  <div className="flex gap-2 items-center mb-2 flex-wrap">
                    {book.chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 rounded-md px-3 ${
                          currentChapter === idx
                            ? "bg-black text-white"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-black"
                        }`}
                        onClick={() => setCurrentChapter(idx)}
                      >
                        {ch.title ? ch.title : `Chapter ${idx + 1}`}
                        {book.chapters.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChapterDeleteStart(idx);
                            }}
                            className="ml-2 text-red-400 hover:text-red-600 cursor-pointer"
                            title="Delete chapter"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-trash2 h-4 w-4 mr-0"
                            >
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line
                                x1="10"
                                x2="10"
                                y1="11"
                                y2="17"
                              ></line>
                              <line
                                x1="14"
                                x2="14"
                                y1="11"
                                y2="17"
                              ></line>
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-1 inline-flex justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 border border-input bg-background"
                      onClick={handleChapterAdd}
                      aria-label="Add Chapter"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus h-4 w-4"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                      </svg>
                      Add
                    </button>
                  </div>
                  {/* Chapter Editor */}
                  <div className="border rounded-lg p-4 bg-[#f9f9fa] space-y-6 relative">
                    <div>
                      <label
                        className="text-sm font-medium leading-none"
                        htmlFor="chapterTitle"
                      >
                        Chapter Title
                      </label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                        id="chapterTitle"
                        placeholder="Enter chapter title"
                        value={book.chapters[currentChapter]?.title}
                        onChange={(e) =>
                          handleChapterChange("title", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          className="text-sm font-medium leading-none"
                          htmlFor="chapterContent"
                        >
                          Chapter Content
                        </label>
                        <div className="text-xs text-muted-foreground flex items-center cursor-help">
                          eReader-compatible formatting
                        </div>
                      </div>
                      <textarea
                        className="p-3 border rounded-md w-full min-h-[200px] focus:outline-none prose prose-sm max-w-none overflow-auto"
                        id="chapterContent"
                        placeholder="Write your chapter content here..."
                        value={book.chapters[currentChapter]?.content}
                        onChange={(e) =>
                          handleChapterChange("content", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() =>
                          handleChapterDeleteStart(currentChapter)
                        }
                        disabled={book.chapters.length <= 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-trash2 h-4 w-4 mr-2"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" x2="10" y1="11" y2="17"></line>
                          <line x1="14" x2="14" y1="11" y2="17"></line>
                        </svg>
                        Delete Chapter
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"></div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-[#1D1D1F] hover:bg-black text-white w-full sm:w-auto"
                      onClick={handleDownloadEpub}
                    >
                      Generate eBook (.epub)
                    </button>
                  </div>
                </form>
              ) : (
                <Preview />
              )}
            </div>
          </div>
        </section>

        {/* Delete Chapter Modal */}
        {chapterToDelete !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="font-bold mb-2">Delete Chapter?</h3>
              <p>
                Are you sure you want to delete this chapter? This cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleChapterDeleteCancel}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChapterDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#F5F5F7] border-t border-[#D2D2D7]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-sm text-[#86868B]">
            © 2025 makeEbook. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper to get extension from mime type
function getImageExtension(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "img";
}