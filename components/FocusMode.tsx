"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
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
  Save,
  X,
} from "lucide-react"

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  initialContent?: {
    title?: string
    author?: string
    chapterTitle?: string
    chapterContent?: string
  }
}

export function FocusMode({ isOpen, onClose, initialContent = {} }: FocusModeProps) {
  const [title, setTitle] = useState(initialContent.title || "")
  const [author, setAuthor] = useState(initialContent.author || "")
  const [chapterTitle, setChapterTitle] = useState(initialContent.chapterTitle || "")
  const [chapterContent, setChapterContent] = useState(initialContent.chapterContent || "")
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load saved content from localStorage if available and no initial content provided
    if (
      !initialContent.title &&
      !initialContent.author &&
      !initialContent.chapterTitle &&
      !initialContent.chapterContent
    ) {
      const savedTitle = localStorage.getItem("makeebook_title")
      const savedAuthor = localStorage.getItem("makeebook_author")
      const savedChapterTitle = localStorage.getItem("makeebook_chapter_title")
      const savedChapterContent = localStorage.getItem("makeebook_chapter_content")

      if (savedTitle) setTitle(savedTitle)
      if (savedAuthor) setAuthor(savedAuthor)
      if (savedChapterTitle) setChapterTitle(savedChapterTitle)
      if (savedChapterContent) setChapterContent(savedChapterContent)
    }

    // Prevent scrolling of the body when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, initialContent])

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header - simplified with only logo */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <MakeEbookIcon width={24} height={24} className="text-[#1D1D1F]" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveContent}
              className="flex items-center gap-1 bg-white text-black border-gray-200 hover:bg-gray-50"
            >
              {isSaving ? "Saving..." : "Save"}
              <Save className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-6 bg-[#F9F9F9]">
          <Tabs
            defaultValue="edit"
            onValueChange={(value) => setEditorMode(value as "edit" | "preview")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
              <TabsTrigger value="edit" className="data-[state=active]:bg-white">
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-white">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-black">
                    Book Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your book title"
                    className="mt-1 bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-300 placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="author" className="text-black">
                    Author
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                    className="mt-1 bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-300 placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="chapterTitle" className="text-black">
                    Chapter Title
                  </Label>
                  <Input
                    id="chapterTitle"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="Enter chapter title"
                    className="mt-1 bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-300 placeholder-gray-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="chapterContent" className="text-black">
                      Chapter Content
                    </Label>
                  </div>
                  <div className="border rounded-md bg-white shadow-sm border-gray-200">
                    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Underline"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Align Left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Align Center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Align Right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Bullet List"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:bg-gray-100"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </div>
                    <div
                      className="p-4 min-h-[400px] focus:outline-none text-black"
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
              <div className="border rounded-lg p-6 space-y-6 min-h-[600px] bg-white shadow-sm border-gray-200">
                {title && <h1 className="text-2xl font-bold text-center mb-8 text-black">{title}</h1>}
                {author && <p className="text-center italic mb-12 text-black">by {author}</p>}

                {chapterTitle && <h2 className="text-xl font-semibold mt-8 mb-4 text-black">{chapterTitle}</h2>}
                {chapterContent && (
                  <div className="prose max-w-none text-black" dangerouslySetInnerHTML={{ __html: chapterContent }} />
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
    </div>
  )
}
