"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react"
import { SimpleRichTextEditor } from "@/components/SimpleRichTextEditor"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Chapter = {
  title: string
  content: string
}

export function MakeEbookDemo() {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: "", content: "" }
  ])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowUpgradeModal(true)
  }

  const handlePreviewToggle = (value: string) => {
    setPreviewMode(value === "preview")
  }

  // Chapter management
  const addChapter = () => {
    setChapters([...chapters, { title: "", content: "" }])
    setCurrentChapter(chapters.length)
  }

  const removeChapter = (idx: number) => {
    if (chapters.length === 1) return // must have at least one
    const updated = chapters.filter((_, i) => i !== idx)
    setChapters(updated)
    setCurrentChapter(Math.max(0, idx - 1))
  }

  const updateChapter = (idx: number, field: keyof Chapter, value: string) => {
    setChapters(chapters.map((ch, i) =>
      i === idx ? { ...ch, [field]: value } : ch
    ))
  }

  const reorderChapter = (from: number, to: number) => {
    if (to < 0 || to >= chapters.length) return
    const copy = [...chapters]
    const [moved] = copy.splice(from, 1)
    copy.splice(to, 0, moved)
    setChapters(copy)
    setCurrentChapter(to)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="edit" onValueChange={handlePreviewToggle} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          {/* Focus Mode button removed */}
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

            {/* Chapter Tabs */}
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

              {/* Current Chapter Edit */}
              <div className="border rounded-lg p-4 bg-[#f9f9fa] space-y-4 relative">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="chapterTitle">Chapter Title</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentChapter === 0}
                    aria-label="Move Up"
                    onClick={() => reorderChapter(currentChapter, currentChapter - 1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentChapter === chapters.length - 1}
                    aria-label="Move Down"
                    onClick={() => reorderChapter(currentChapter, currentChapter + 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={chapters.length === 1}
                    aria-label="Delete Chapter"
                    onClick={() => removeChapter(currentChapter)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <Input
                  id="chapterTitle"
                  value={chapters[currentChapter].title}
                  onChange={(e) => updateChapter(currentChapter, "title", e.target.value)}
                  placeholder="Enter chapter title"
                  className="mt-1"
                />

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
                    value={chapters[currentChapter].content}
                    onChange={val => updateChapter(currentChapter, "content", val)}
                    placeholder="Write your chapter content here..."
                    minHeight="200px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Button layout */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
            <Button
              variant="outline"
              className="text-[#86868B] w-full sm:w-auto"
              disabled
            >
              <Lock className="h-4 w-4 mr-2" />
              Cover Image (Pro)
            </Button>

            <Button onClick={handleGenerateClick} className="bg-[#1D1D1F] hover:bg-black text-white w-full sm:w-auto">
              Generate eBook
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-4 p-4">
                <div className="mx-auto bg-[#F5F5F7] p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-[#1D1D1F]" />
                </div>
                <h3 className="text-xl font-semibold">Upgrade to Export</h3>
                <p className="text-[#86868B]">
                  The free version allows you to create and preview your eBook. Upgrade to Pro to export in multiple
                  formats and access all features.
                </p>
                <div className="flex flex-col space-y-3 pt-4">
                  <Button
                    className="bg-[#1D1D1F] hover:bg-black text-white"
                    onClick={() => {
                      setShowUpgradeModal(false)
                      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    View Pricing
                  </Button>
                  <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                    Continue Editing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}