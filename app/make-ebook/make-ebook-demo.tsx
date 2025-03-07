"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Info } from "lucide-react"
import { SimpleRichTextEditor } from "@/components/SimpleRichTextEditor"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function MakeEbookDemo() {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterContent, setChapterContent] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowUpgradeModal(true)
  }

  const handlePreviewToggle = (value: string) => {
    setPreviewMode(value === "preview")
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#F5F5F7] border border-[#D2D2D7] rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#1D1D1F] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-[#1D1D1F] mb-1">eReader-Compatible Formatting</h3>
            <p className="text-sm text-[#86868B]">
              This demo includes only formatting options that are supported by most eReaders, ensuring your eBook will
              pass validation. Links are disabled in this demo for security reasons.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="edit" onValueChange={handlePreviewToggle} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

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
              <Label htmlFor="chapterTitle">Chapter 1 Title</Label>
              <Input
                id="chapterTitle"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Enter chapter title"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="chapterContent">Chapter 1 Content</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground flex items-center cursor-help">
                        <Info className="h-3 w-3 mr-1" />
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
                value={chapterContent}
                onChange={setChapterContent}
                placeholder="Write your chapter content here..."
                minHeight="200px"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" className="text-[#86868B]" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>

            <Button onClick={handleGenerateClick} className="bg-[#1D1D1F] hover:bg-black text-white">
              Generate eBook
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          {title || author || chapterTitle || chapterContent ? (
            <div className="border rounded-lg p-6 space-y-6 min-h-[400px] bg-white">
              {title && <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>}
              {author && <p className="text-center italic mb-12">by {author}</p>}

              {chapterTitle && <h2 className="text-xl font-semibold mt-8 mb-4">{chapterTitle}</h2>}
              {chapterContent && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: chapterContent }} />
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

