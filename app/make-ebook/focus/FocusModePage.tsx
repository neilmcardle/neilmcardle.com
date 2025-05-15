"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { ArrowLeft, Save } from "lucide-react"
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from "lucide-react"

export default function FocusModePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterContent, setChapterContent] = useState("")
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit")
  const [isSaving, setIsSaving] = useState(false)

  // Remove the top padding that's normally added by the main layout
  // and hide the top navigation
  useEffect(() => {
    // Find the main element and remove padding
    const mainElement = document.querySelector("main")
    if (mainElement) {
      mainElement.classList.remove("pt-24", "sm:pt-32")
    }

    // Hide the top navigation
    const navElement = document.querySelector("nav")
    if (navElement) {
      navElement.style.display = "none"
    }

    // Cleanup function to restore styles when component unmounts
    return () => {
      if (mainElement) {
        mainElement.classList.add("pt-24", "sm:pt-32")
      }
      if (navElement) {
        navElement.style.display = ""
      }
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    // Load saved content from localStorage if available
    const savedTitle = localStorage.getItem("makeebook_title")
    const savedAuthor = localStorage.getItem("makeebook_author")
    const savedChapterTitle = localStorage.getItem("makeebook_chapter_title")
    const savedChapterContent = localStorage.getItem("makeebook_chapter_content")

    if (savedTitle) setTitle(savedTitle)
    if (savedAuthor) setAuthor(savedAuthor)
    if (savedChapterTitle) setChapterTitle(savedChapterTitle)
    if (savedChapterContent) setChapterContent(savedChapterContent)
  }, [])

  // Save content to localStorage
  const saveContent = () => {
    setIsSaving(true)
    localStorage.setItem("makeebook_title", title)
    localStorage.setItem("makeebook_author", author)
    localStorage.setItem("makeebook_chapter_title", chapterTitle)
    localStorage.setItem("makeebook_chapter_content", chapterContent)

    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleEditorChange = (e: React.FormEvent<HTMLDivElement>) => {
    setChapterContent(e.currentTarget.innerHTML)
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={goBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <MakeEbookIcon width={24} height={24} className="text-[#1D1D1F]" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveContent} className="flex items-center gap-1">
            {isSaving ? "Saving..." : "Save"}
            <Save className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <Tabs
          defaultValue="edit"
          onValueChange={(value) => setEditorMode(value as "edit" | "preview")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-[#1D1D1F]">
                  Book Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your book title"
                  className="mt-1 bg-white border-[#D2D2D7] focus:border-[#1D1D1F] focus:ring-[#1D1D1F]"
                />
              </div>

              <div>
                <Label htmlFor="author" className="text-[#1D1D1F]">
                  Author
                </Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                  className="mt-1 bg-white border-[#D2D2D7] focus:border-[#1D1D1F] focus:ring-[#1D1D1F]"
                />
              </div>

              <div>
                <Label htmlFor="chapterTitle" className="text-[#1D1D1F]">
                  Chapter Title
                </Label>
                <Input
                  id="chapterTitle"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  className="mt-1 bg-white border-[#D2D2D7] focus:border-[#1D1D1F] focus:ring-[#1D1D1F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="chapterContent" className="text-[#1D1D1F]">
                    Chapter Content
                  </Label>
                  <div className="text-xs text-gray-400">eReader-compatible formatting</div>
                </div>
                <div className="border rounded-md bg-white shadow-sm">
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Bold">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Italic">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Underline">
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 1">
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Heading 2">
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Left">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Center">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Right">
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Bullet List">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Numbered List">
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>
                  <div
                    className="p-4 min-h-[400px] focus:outline-none"
                    contentEditable
                    onInput={handleEditorChange}
                    dangerouslySetInnerHTML={{ __html: chapterContent }}
                    style={{ lineHeight: 1.6 }}
                  ></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="min-h-[600px]">
            <div className="border rounded-lg p-6 space-y-6 min-h-[600px] bg-white shadow-sm">
              {title && <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>}
              {author && <p className="text-center italic mb-12">by {author}</p>}

              {chapterTitle && <h2 className="text-xl font-semibold mt-8 mb-4">{chapterTitle}</h2>}
              {chapterContent && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: chapterContent }} />
              )}

              {!title && !author && !chapterTitle && !chapterContent && (
                <div className="text-center py-12 text-gray-400">
                  <p>Enter content in the Edit tab to see a preview</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
