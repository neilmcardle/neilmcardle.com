"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { MakeEbookComputerIcon } from "@/components/MakeEbookComputerIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Type, CheckCircle, FileType, ArrowLeft, Trash2, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SimpleRichTextEditor } from "@/components/SimpleRichTextEditor"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import JSZip from "jszip"

const LOCAL_STORAGE_KEY = "makeebook-autosave-v1"

type Chapter = {
  title: string
  content: string
}

function htmlEscape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export default function MakeEbook() {
  // --- State ---
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "", content: "" }])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDeleteChapterConfirm, setShowDeleteChapterConfirm] = useState(false)

  // --- Autosave / Restore ---
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setTitle(data.title || "")
        setAuthor(data.author || "")
        setChapters(Array.isArray(data.chapters) && data.chapters.length
          ? data.chapters
          : [{ title: "", content: "" }]
        )
        setCurrentChapter(0)
      } catch {
        // Ignore parsing errors
      }
    }
  }, [])

  useEffect(() => {
    const data = { title, author, chapters }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }, [title, author, chapters])

  function handleClear() {
    setShowClearConfirm(true)
  }

  function confirmClear() {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setTitle("")
    setAuthor("")
    setChapters([{ title: "", content: "" }])
    setCurrentChapter(0)
    setShowClearConfirm(false)
  }

  function cancelClear() {
    setShowClearConfirm(false)
  }

  // --- Editor Logic ---
  const handlePreviewToggle = (value: string) => {
    setPreviewMode(value === "preview")
  }

  const addChapter = () => {
    setChapters([...chapters, { title: "", content: "" }])
    setCurrentChapter(chapters.length)
  }

  // --- Delete Chapter Modal Logic ---
  function handleDeleteChapter() {
    setShowDeleteChapterConfirm(true)
  }
  function confirmDeleteChapter() {
    removeChapter(currentChapter)
    setShowDeleteChapterConfirm(false)
  }
  function cancelDeleteChapter() {
    setShowDeleteChapterConfirm(false)
  }

  const removeChapter = (idx: number) => {
    if (chapters.length === 1) return
    const updated = chapters.filter((_, i) => i !== idx)
    setChapters(updated)
    setCurrentChapter(Math.max(0, idx - 1))
  }

  const updateChapter = (idx: number, field: keyof Chapter, value: string) => {
    setChapters(chapters.map((ch, i) =>
      i === idx ? { ...ch, [field]: value } : ch
    ))
  }

  // --- ePub Generation ---
  async function handleGenerateEpub(e: React.MouseEvent) {
    e.preventDefault()
    const zip = new JSZip()

    // Required mimetype file
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" })

    // META-INF/container.xml
    zip.file(
      "META-INF/container.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>`
    )

    // OEBPS/content.opf
    const manifestItems = chapters
      .map(
        (_, idx) =>
          `<item id="chapter${idx + 1}" href="chapter${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`
      )
      .join("\n")
    const spineItems = chapters
      .map((_, idx) => `<itemref idref="chapter${idx + 1}"/>`)
      .join("\n")
    zip.file(
      "OEBPS/content.opf",
      `<?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>${htmlEscape(title || "Untitled Book")}</dc:title>
          <dc:creator>${htmlEscape(author || "Anonymous")}</dc:creator>
          <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
          <dc:language>en</dc:language>
        </metadata>
        <manifest>
          <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
          ${manifestItems}
        </manifest>
        <spine toc="ncx">
          ${spineItems}
        </spine>
      </package>`
    )

    // OEBPS/toc.ncx
    const navPoints = chapters
      .map(
        (ch, idx) => `
        <navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
          <navLabel><text>${htmlEscape(ch.title || `Chapter ${idx + 1}`)}</text></navLabel>
          <content src="chapter${idx + 1}.xhtml"/>
        </navPoint>
      `
      )
      .join("\n")
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
          ${navPoints}
        </navMap>
      </ncx>`
    )

    // OEBPS/chapters
    chapters.forEach((ch, idx) => {
      zip.file(
        `OEBPS/chapter${idx + 1}.xhtml`,
        `<?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <title>${htmlEscape(ch.title || `Chapter ${idx + 1}`)}</title>
          </head>
          <body>
            <h2>${htmlEscape(ch.title || `Chapter ${idx + 1}`)}</h2>
            <div>${ch.content}</div>
          </body>
        </html>`
      )
    })

    // Download as .epub
    const blob = await zip.generateAsync({ type: "blob" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = (title || "ebook") + ".epub"
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[980px] mx-auto px-4 pt-4">
          <nav className="flex items-center justify-between bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 rounded-full px-4 py-3">
            <div className="flex items-center space-x-2">
              <MakeEbookIcon width={32} height={32} className="text-[#1D1D1F]" />
              <span className="text-xl font-semibold text-[#1D1D1F]">makeEbook</span>
            </div>
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" aria-label="Return to main site" className="text-[#1D1D1F]">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-[100px]">
        <section className="py-20 px-4 text-center bg-white">
          <div className="max-w-[980px] mx-auto">
            <div className="flex justify-center mb-8">
              <MakeEbookComputerIcon width={240} height={240} className="text-[#1D1D1F]" />
            </div>
            <h1 className="text-[56px] leading-tight font-semibold tracking-tight mb-4 text-[#1D1D1F]">
              Create Ebooks in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-[#86868B] max-w-2xl mx-auto mb-10">
              Simple eBook Creation with Professional Results
            </p>
          </div>
        </section>

        <section className="py-20 px-4 bg-[#F5F5F7]">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-[40px] font-semibold text-center mb-16 text-[#1D1D1F]">Try It Now</h2>
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl mx-auto">
              {/* ---------- FULL EDITOR UI STARTS HERE ---------- */}
              <Tabs defaultValue="edit" onValueChange={handlePreviewToggle} className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="edit" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Book Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your book title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Enter author name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex gap-2 items-center mb-2 flex-wrap">
                        {chapters.map((ch, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant={idx === currentChapter ? "default" : "outline"}
                            onClick={() => setCurrentChapter(idx)}
                          >
                            Chapter {idx + 1}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={addChapter}
                          aria-label="Add Chapter"
                          className="flex gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                      <div className="border rounded-lg p-4 bg-[#f9f9fa] space-y-6 relative">
                        <div>
                          <Label htmlFor="chapterTitle">Chapter Title</Label>
                          <Input
                            id="chapterTitle"
                            value={chapters[currentChapter].title}
                            onChange={(e) => updateChapter(currentChapter, "title", e.target.value)}
                            placeholder="Enter chapter title"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="chapterContent">Chapter Content</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-xs text-muted-foreground flex items-center cursor-help">
                                    eReader-compatible formatting
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Only formatting options supported by most eReaders are included to ensure compatibility.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <SimpleRichTextEditor
                            key={currentChapter}
                            value={chapters[currentChapter].content}
                            onChange={val => updateChapter(currentChapter, "content", val)}
                            placeholder="Write your chapter content here..."
                            minHeight="200px"
                          />
                        </div>
                        {/* Delete Chapter button moved to bottom right */}
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            disabled={chapters.length === 1}
                            onClick={handleDeleteChapter}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Chapter
                          </Button>
                        </div>
                        {/* Delete Chapter Modal */}
                        {showDeleteChapterConfirm && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs">
                              <h3 className="text-lg font-semibold mb-4">Delete this chapter?</h3>
                              <p className="mb-6 text-sm text-[#86868B]">
                                This will permanently remove this chapter and its content. This can’t be undone.
                              </p>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={cancelDeleteChapter}>Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={confirmDeleteChapter}
                                >
                                  Yes, Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="text-[#86868B] w-full sm:w-auto"
                        onClick={handleClear}
                      >
                        Clear All
                      </Button>
                      {showClearConfirm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-xs">
                            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                            <p className="mb-6 text-sm text-[#86868B]">This will permanently erase all your book data from this browser. This can’t be undone.</p>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={cancelClear}>Cancel</Button>
                              <Button variant="destructive" onClick={confirmClear}>Yes, Clear All</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleGenerateEpub} className="bg-[#1D1D1F] hover:bg-black text-white w-full sm:w-auto">
                      Generate eBook (.epub)
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="pt-4">
                  {title || author || chapters.some(ch => ch.title || ch.content) ? (
                    <div className="border rounded-lg p-6 space-y-6 min-h-[400px] bg-white">
                      {title && <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>}
                      {author && <p className="text-center italic mb-12">by {author}</p>}
                      {chapters.map((ch, idx) =>
                        (ch.title || ch.content) ? (
                          <div key={idx} className="mb-10">
                            {ch.title && <h2 className="text-xl font-semibold mt-8 mb-4">{ch.title}</h2>}
                            {ch.content && (
                              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: ch.content }} />
                            )}
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#86868B]">
                      <p>Enter content in the Edit tab to see a preview</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              {/* ---------- FULL EDITOR UI ENDS HERE ---------- */}
            </div>
          </div>
        </section>

        <footer className="py-8 px-4 bg-[#F5F5F7] border-t border-[#D2D2D7]">
          <div className="max-w-[980px] mx-auto">
            <div className="text-sm text-[#86868B]">© 2025 makeEbook. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  )
}