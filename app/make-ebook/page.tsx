"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Place your SVG file in /public as /caveman.svg and /make-ebook-caveman.svg
const LOGO_SRC = "/caveman.svg";
const MASCOT_SRC = "/make-ebook-caveman.svg";

type Chapter = {
  title: string;
  content: string;
};

type BookData = {
  title: string;
  author: string;
  chapters: Chapter[];
};

const initialBook: BookData = {
  title: "",
  author: "",
  chapters: [{ title: "", content: "" }]
};

export default function MakeEbookPage() {
  const [book, setBook] = useState<BookData>(initialBook);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [chapterToDelete, setChapterToDelete] = useState<number | null>(null);

  function handleBookChange(field: "title" | "author", value: string) {
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

  function handleClearAll() {
    setBook(initialBook);
    setCurrentChapter(0);
  }

  // --- EPUB GENERATION AND DOWNLOAD ---
  async function handleDownloadEpub() {
    const zip = new JSZip();

    // Minimal ePub files
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", `
      <?xml version="1.0"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>
    `.trim());

    // Build HTML for each chapter
    const chapterHtmls = book.chapters.map((ch, i) => `
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>${ch.title || `Chapter ${i + 1}`}</title>
        </head>
        <body>
          <h2>${ch.title || `Chapter ${i + 1}`}</h2>
          <div>${(ch.content || "").replace(/\n/g, "<br/>")}</div>
        </body>
      </html>
    `);

    // Table of contents and manifest
    const manifestItems = book.chapters.map((_, i) =>
      `<item id="chapter${i}" href="chapter${i}.xhtml" media-type="application/xhtml+xml"/>`
    ).join("\n");

    const spineItems = book.chapters.map((_, i) =>
      `<itemref idref="chapter${i}"/>`
    ).join("\n");

    // OPF (ePub manifest)
    zip.file("OEBPS/content.opf", `
      <?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>${book.title || "Untitled Book"}</dc:title>
          <dc:creator>${book.author || "Unknown Author"}</dc:creator>
          <dc:language>en</dc:language>
          <dc:identifier id="BookId">urn:uuid:${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}</dc:identifier>
        </metadata>
        <manifest>
          ${manifestItems}
          <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        </manifest>
        <spine toc="ncx">
          ${spineItems}
        </spine>
        <guide>
          <reference type="cover" title="Cover" href="chapter0.xhtml"/>
        </guide>
      </package>
    `.trim());

    // Add chapters
    chapterHtmls.forEach((html, i) => {
      zip.file(`OEBPS/chapter${i}.xhtml`, html);
    });

    // NCX (table of contents)
    zip.file("OEBPS/toc.ncx", `
      <?xml version="1.0" encoding="UTF-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
        <head>
          <meta name="dtb:uid" content="urn:uuid:${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}"/>
        </head>
        <docTitle><text>${book.title || "Untitled Book"}</text></docTitle>
        <navMap>
          ${book.chapters.map((ch, i) => `
            <navPoint id="navPoint-${i+1}" playOrder="${i+1}">
              <navLabel><text>${ch.title || `Chapter ${i+1}`}</text></navLabel>
              <content src="chapter${i}.xhtml"/>
            </navPoint>
          `).join("\n")}
        </navMap>
      </ncx>
    `.trim());

    // Generate zip and trigger download
    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
    saveAs(blob, (book.title || "ebook") + ".epub");
  }
  // --- END EPUB LOGIC ---

  function Preview() {
    return (
      <div className="text-left">
        <h1 className="text-2xl font-bold mb-2">{book.title || "Untitled Book"}</h1>
        <h2 className="text-lg text-[#86868B] mb-4">{book.author || "Author"}</h2>
        <div>
          {book.chapters.map((ch, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="font-semibold text-lg mb-1">{ch.title || `Chapter ${idx + 1}`}</h3>
              <div className="prose prose-sm max-w-none">{ch.content || <span className="text-[#86868B]">No content.</span>}</div>
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
              <Image src={LOGO_SRC} alt="makeEbook logo" width={32} height={32} />
              <span className="text-xl font-semibold text-[#1D1D1F]">makeEbook</span>
            </div>
            <Link href="/">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10 text-[#1D1D1F]"
                aria-label="Return to main site"
              >
                {/* Left arrow icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
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
            <h2 className="text-[40px] font-semibold text-center mb-16 text-[#1D1D1F]">Try It Now</h2>
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl mx-auto">
              {/* Tab buttons */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-[200px] grid-cols-2">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "edit"}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${tab === "edit" ? "bg-background text-foreground shadow-sm" : ""}`}
                    onClick={() => setTab("edit")}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "preview"}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${tab === "preview" ? "bg-background text-foreground shadow-sm" : ""}`}
                    onClick={() => setTab("preview")}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Tab content */}
              {tab === "edit" ? (
                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                  <div>
                    <label className="text-sm font-medium leading-none" htmlFor="title">Book Title</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="title"
                      placeholder="Enter your book title"
                      value={book.title}
                      onChange={e => handleBookChange("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none" htmlFor="author">Author</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                      id="author"
                      placeholder="Enter author name"
                      value={book.author}
                      onChange={e => handleBookChange("author", e.target.value)}
                    />
                  </div>
                  {/* Chapter tabs */}
                  <div className="flex gap-2 items-center mb-2 flex-wrap">
                    {book.chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 rounded-md px-3 ${currentChapter === idx ? "bg-black text-white" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-black"}`}
                        onClick={() => setCurrentChapter(idx)}
                      >
                        {ch.title ? ch.title : `Chapter ${idx + 1}`}
                        {book.chapters.length > 1 && (
                          <span
                            onClick={e => { e.stopPropagation(); handleChapterDeleteStart(idx); }}
                            className="ml-2 text-red-400 hover:text-red-600 cursor-pointer"
                            title="Delete chapter"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 h-4 w-4 mr-0"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-4 w-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                      Add
                    </button>
                  </div>
                  {/* Chapter Editor */}
                  <div className="border rounded-lg p-4 bg-[#f9f9fa] space-y-6 relative">
                    <div>
                      <label className="text-sm font-medium leading-none" htmlFor="chapterTitle">Chapter Title</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm mt-1"
                        id="chapterTitle"
                        placeholder="Enter chapter title"
                        value={book.chapters[currentChapter]?.title}
                        onChange={e => handleChapterChange("title", e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium leading-none" htmlFor="chapterContent">Chapter Content</label>
                        <div className="text-xs text-muted-foreground flex items-center cursor-help">
                          eReader-compatible formatting
                        </div>
                      </div>
                      <textarea
                        className="p-3 border rounded-md w-full min-h-[200px] focus:outline-none prose prose-sm max-w-none overflow-auto"
                        id="chapterContent"
                        placeholder="Write your chapter content here..."
                        value={book.chapters[currentChapter]?.content}
                        onChange={e => handleChapterChange("content", e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleChapterDeleteStart(currentChapter)}
                        disabled={book.chapters.length <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 h-4 w-4 mr-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                        Delete Chapter
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-[#86868B] w-full sm:w-auto"
                        onClick={handleClearAll}
                      >
                        Clear All
                      </button>
                    </div>
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
              <p>Are you sure you want to delete this chapter? This cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={handleChapterDeleteCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button onClick={handleChapterDeleteConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#F5F5F7] border-t border-[#D2D2D7]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-sm text-[#86868B]">© 2025 makeEbook. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}