"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, FileText, Upload, Plus, Minus, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import "./make-ebook.css"

// Rich text editor imports
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
  ImageIcon,
} from "lucide-react"

interface Chapter {
  title: string
  content: string
}

const RichTextEditor: React.FC<{ content: string; onChange: (content: string) => void }> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt("Enter the URL of the image:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter the URL:", previousUrl)
    if (url === null) {
      return
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="border border-makeebook-secondary/20 rounded-md p-2">
      <div className="flex flex-wrap gap-2 mb-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
          size="icon"
          variant="outline"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button onClick={setLink} size="icon" variant="outline">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button onClick={addImage} size="icon" variant="outline">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default function MakeEbook() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    date: "",
    language: "en",
  })

  const [chapters, setChapters] = useState<Chapter[]>([{ title: "", content: "" }])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleChapterChange = (index: number, field: "title" | "content", value: string) => {
    const newChapters = [...chapters]
    newChapters[index][field] = value
    setChapters(newChapters)
  }

  const addChapter = () => {
    setChapters([...chapters, { title: "", content: "" }])
  }

  const removeChapter = (index: number) => {
    if (chapters.length > 1) {
      const newChapters = chapters.filter((_, i) => i !== index)
      setChapters(newChapters)
    }
  }

  const moveChapter = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index > 0) || (direction === "down" && index < chapters.length - 1)) {
      const newChapters = [...chapters]
      const temp = newChapters[index]
      newChapters[index] = newChapters[index + (direction === "up" ? -1 : 1)]
      newChapters[index + (direction === "up" ? -1 : 1)] = temp
      setChapters(newChapters)
    }
  }

  const generateEpub = async () => {
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      // Add the mimetype file as the first file, uncompressed
      zip.file("mimetype", "application/epub+zip", { compression: "STORE" })

      // Generate a unique identifier
      const uniqueId = "urn:uuid:" + crypto.randomUUID()
      const isoDate = new Date().toISOString().split(".")[0] + "Z"

      // Add the container.xml file
      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`
      zip.file("META-INF/container.xml", containerXml)

      // Add the toc.xhtml file
      const tocXhtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>Table of Contents</title>
    </head>
    <body>
        <nav epub:type="toc">
            <h1>Table of Contents</h1>
            <ol>
                ${chapters.map((chapter, index) => `<li><a href="chapter${index + 1}.xhtml">${chapter.title}</a></li>`).join("")}
            </ol>
        </nav>
    </body>
</html>`
      zip.file("OEBPS/toc.xhtml", tocXhtml)

      // Add the toc.ncx file
      const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${uniqueId}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${formData.title}</text>
    </docTitle>
    <navMap>
        ${chapters
          .map(
            (chapter, index) => `
        <navPoint id="navPoint-${index + 1}" playOrder="${index + 1}">
            <navLabel><text>${chapter.title}</text></navLabel>
            <content src="chapter${index + 1}.xhtml"/>
        </navPoint>
        `,
          )
          .join("")}
    </navMap>
</ncx>`
      zip.file("OEBPS/toc.ncx", tocNcx)

      // Add the content.opf file
      const contentOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${formData.title}</dc:title>
        <dc:creator>${formData.author}</dc:creator>
        <dc:description>${formData.description}</dc:description>
        <dc:language>${formData.language}</dc:language>
        <dc:identifier id="BookId">${uniqueId}</dc:identifier>
        <meta property="dcterms:modified">${isoDate}</meta>
    </metadata>
    <manifest>
        <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="nav" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        ${chapters.map((chapter, index) => `<item id="chapter${index + 1}" href="chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`).join("")}
    </manifest>
    <spine toc="toc">
        <itemref idref="nav"/>
        ${chapters.map((chapter, index) => `<itemref idref="chapter${index + 1}"/>`).join("")}
    </spine>
</package>`
      zip.file("OEBPS/content.opf", contentOpf)

      // Add chapters
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i]
        const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>${chapter.title}</title>
    </head>
    <body>
        <h1>${chapter.title}</h1>
        ${chapter.content}
    </body>
</html>`
        zip.file(`OEBPS/chapter${i + 1}.xhtml`, chapterXhtml)
      }

      // Generate the ePub file
      const content = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = "book.epub"
      link.click()
    } catch (error) {
      console.error("Error generating ePub:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-makeebook-primary py-6 rounded-b-3xl mb-8">
        <div className="container mx-auto px-4 flex items-center">
          <svg
            className="w-12 h-12 text-makeebook-secondary mr-4"
            viewBox="0 0 112 120"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M79.73,12.51c4.41-.06,10.74-1.03,9.46,5.32,1.73-.33,6.13-1.97,7.61-1.13,1.55.88,1.83,3.39,2.57,4.48.31.46.91.52,1.22,1.05.28.46,1.45,4.04,1.2,4.29h-2.58s1.14,3.92,1.14,3.92l-3.15-.28.28,2.52-2.27-.55-.31,1.11,15.42,3.27c2.35.76,2.19,3.45-.37,3.74l-17.33-.55c.01,1.93-1.29,5.6-.8,7.34.15.55,1.01,1.38,1.33,2.06,6.83,15,3.57,30.7-5.05,44.22,6.23,5.22,3.05,10.73.22,16.66l13.19,4.34.27.53-.86,4.92c-2.33-.03-4.68.08-7.02.03-12-.29-24.05-.8-36.03.21l-16.12-10.59c-.28-.52.07-1,.23-1.47.93-2.78,3.27-5.43,3.81-8.31-.92-.9-1.46-2.52-2.29-3.39-1.11-1.17-2.93-1.93-4.16-3.49-1.35-1.72-1.85-3.88-3.33-5.71-2.69-3.35-6.03-5.96-8.66-9.74-8.52-12.21-10.6-28.25-.34-40.14l-21.06-.84c-3.46-.37-5.55-3.74-5.87-6.87-.81-7.9,4.56-14.37,12.96-13.5,9.95,1.02,21.12,5.4,31.1,6.58,1.77.21,2.84-.83,4.37-1.48.22-1.21-3.45-2.55-3.74-3.9.92-.99,3.51-1.97,3.89-3.22s-.91-2.56-.74-3.93c4.9-.03.31-3.29.58-3.64,1.47-.48,2.83-.06,4.3-.7.98-.43,2.14-1.81,3.18-2.5,9.63-6.44,22.78-2.85,23.75,9.36ZM78.01,12.51c-.95-12.14-15.33-13.73-23.21-6.3l8.27,3.26-1.1,7.81,4.01-3.92.29,6.72,3.58-1.95c.59.03.42,2.72.72,3.35,1.19-.63,1.33-2.21,1.72-3.36l3.23,1.08,1.84-1.6,2.04.48,1.97-2.44,6.08,1.91c.62-1.2-.07-3.35-1.56-3.35h-13.61v-1.68h5.73ZM96.01,18.17l-16.85,3.72c1.83,1.44,4.25,4.1,6.73,4.09.8,0,1.58-.36,2.26-.3s3.1,1.65,3.32,1.4l.29-3.08,2.57,1.4-.28-2.24,2.29.28-.86-2.24h2s-1.49-3.02-1.49-3.02ZM93.2,30.44c-2.3-.32-9.1-3.58-10.97-3.04-.79.23-1.54,1.89-2.71,2.14-1.25.26-3.01-.72-3.79-.38l-8.34,7.84c-.33.32-.28.6-.15,1,.53,1.59,3.2,4.45,4.01,6.19.19.4.41.77.42,1.23.02,1.19-1.59,6.54-2.04,8.05-.14.48-.58,2.38-.93,2.46-.49.09-.55-.39-.78-.64-5.17-5.52-5.99-15.35-15.3-16.42-7.68-.88-17.33,5.01-13.72,13.41,2.04,4.73,14.97,11.96,19.71,15.18,1.33.91,4.66,3.84,5.65,4.28,1.41.63,4.9-.41,6.6-.26l1.09-.9,12.24-23.05,4.55-2.83,4.46-14.26ZM86.04,110.81c2.68-6.11,7.6-12.52-.38-17.13-8.43-4.87-15.22.48-22.54,4.25-.35.49,9.06,6.66,9.4,7.76.56,1.81-3,11.72-2.52,12.12l29.5.27.27-2.76-13.72-4.51ZM65.91,116.21c-.95-.89-3.17.43-4.52-.21-.28-.13-3.35-4.64-3.43-5.06-.12-.66.02-1.12.22-1.73.88-2.71,3.46-5.98,4.53-8.76.22-.67-.7-1.46-1.39-1.36-.84.12-3.62,1.8-4.93,2.21-3.63,1.13-5.73.9-9.29-.27l-3.44,7.64,14.51,9.64,8.38-.49c.12-.11-.48-1.45-.64-1.61ZM68.55,117.26c-.08-2.43,2.82-9.11,2.24-11-.11-.37-5.37-4.48-6.1-4.96-.24-.16-.27-.4-.71-.28-.49,2.85-3.48,6.09-4.17,8.68-.36,1.35,1.74,4.6,3.15,4.78,1.14.15,2.52-.18,3.69.03l1.91,2.76Z" />
          </svg>
          <h1 className="text-3xl text-makeebook-secondary">
            <span className="font-bold">make</span>
            <span className="font-light">ebook</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="title" className="text-makeebook-secondary">
                Book Title
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter book title"
                className="border-makeebook-secondary/20 focus:border-makeebook-primary"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="author" className="text-makeebook-secondary">
                Author
              </Label>
              <Input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="Enter author name"
                className="border-makeebook-secondary/20 focus:border-makeebook-primary"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="description" className="text-makeebook-secondary">
                Book Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter book description"
                className="min-h-[100px] border-makeebook-secondary/20 focus:border-makeebook-primary"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="date" className="text-makeebook-secondary">
                Publishing Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="border-makeebook-secondary/20 focus:border-makeebook-primary"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="language" className="text-makeebook-secondary">
                Language
              </Label>
              <Input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                placeholder="e.g. en, es, fr"
                className="border-makeebook-secondary/20 focus:border-makeebook-primary"
              />
            </div>

            <Button
              onClick={generateEpub}
              className="w-full bg-makeebook-primary text-white hover:bg-makeebook-primary/90"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Generate ePub
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="border-makeebook-secondary/20">
              <CardHeader className="border-b border-makeebook-secondary/10">
                <CardTitle className="flex justify-between items-center text-makeebook-secondary">
                  Chapters
                  <Button
                    onClick={addChapter}
                    size="sm"
                    className="bg-makeebook-primary text-white hover:bg-makeebook-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chapters.map((chapter, index) => (
                  <div key={index} className="space-y-4 border-b border-makeebook-secondary/10 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`chapterTitle${index}`} className="text-makeebook-secondary">
                        Chapter {index + 1} Title
                      </Label>
                      <div className="space-x-2">
                        <Button
                          onClick={() => moveChapter(index, "up")}
                          size="sm"
                          variant="outline"
                          className="border-makeebook-secondary/20 hover:bg-makeebook-secondary/5"
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => moveChapter(index, "down")}
                          size="sm"
                          variant="outline"
                          className="border-makeebook-secondary/20 hover:bg-makeebook-secondary/5"
                          disabled={index === chapters.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => removeChapter(index)}
                          size="sm"
                          variant="outline"
                          className="border-makeebook-secondary/20 hover:bg-makeebook-secondary/5"
                          disabled={chapters.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      type="text"
                      id={`chapterTitle${index}`}
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                      required
                      placeholder="Enter chapter title"
                      className="border-makeebook-secondary/20 focus:border-makeebook-primary"
                    />
                    <RichTextEditor
                      content={chapter.content}
                      onChange={(content) => handleChapterChange(index, "content", content)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-makeebook-secondary/20">
              <CardHeader className="border-b border-makeebook-secondary/10">
                <CardTitle className="text-makeebook-secondary">Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-makeebook-secondary/20 hover:bg-makeebook-secondary/5 text-makeebook-secondary"
                >
                  <Upload className="mr-2 h-4 w-4" /> Import Word Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-makeebook-secondary/20 hover:bg-makeebook-secondary/5 text-makeebook-secondary"
                >
                  <FileText className="mr-2 h-4 w-4" /> Import Markdown
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

