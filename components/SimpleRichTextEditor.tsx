"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  LinkIcon,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SimpleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = "",
  minHeight = "150px",
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize editor with value only once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  // Handle editor content changes
  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }

  // Format commands
  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleInput()
    editorRef.current?.focus()
  }

  // Apply heading format
  const applyHeading = (level: number) => {
    // First clear any existing heading format
    document.execCommand("removeFormat", false, "")

    // Then apply the new heading format
    if (level === 1) {
      document.execCommand("fontSize", false, "6") // Larger size for H1
      document.execCommand("bold", false, "")
    } else if (level === 2) {
      document.execCommand("fontSize", false, "5") // Smaller size for H2
      document.execCommand("bold", false, "")
    }

    handleInput()
    editorRef.current?.focus()
  }

  // Insert link with security improvements
  const insertLink = () => {
    if (linkUrl && linkText) {
      // Validate URL (only allow http, https, mailto protocols)
      const urlPattern = /^(https?:\/\/|mailto:)/i
      let secureUrl = linkUrl

      // If URL doesn't start with a valid protocol, prepend https://
      if (!urlPattern.test(secureUrl)) {
        secureUrl = `https://${secureUrl}`
      }

      // Sanitize the link text to prevent XSS
      const sanitizedText = linkText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

      // Create link with security attributes
      formatText("insertHTML", `<a href="${secureUrl}" target="_blank" rel="noopener noreferrer">${sanitizedText}</a>`)

      setLinkUrl("")
      setLinkText("")
      setShowLinkPopover(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        [contenteditable] [style*="font-size: xx-large"],
        [contenteditable] [size="6"] {
          font-size: 1.75rem !important;
          font-weight: bold;
          line-height: 1.2;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        [contenteditable] [style*="font-size: x-large"],
        [contenteditable] [size="5"] {
          font-size: 1.5rem !important;
          font-weight: bold;
          line-height: 1.3;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
      `}</style>
      <div className={`border rounded-md ${className}`}>
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("bold")}>
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("italic")}>
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("underline")}>
                  <Underline className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyHeading(1)}>
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyHeading(2)}>
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("justifyLeft")}>
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("justifyCenter")}>
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("justifyRight")}>
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => formatText("insertUnorderedList")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => formatText("insertOrderedList")}>
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 cursor-not-allowed" disabled>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Link functionality is disabled in this demo version only. In the full makeEbook product, you'll be
                  able to add eReader-compatible links to your content.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div
          ref={editorRef}
          contentEditable
          className="p-3 focus:outline-none prose prose-sm max-w-none overflow-auto"
          style={
            {
              minHeight,
              "--heading-1-size": "1.75rem",
              "--heading-2-size": "1.5rem",
            } as React.CSSProperties
          }
          onInput={handleInput}
          placeholder={placeholder}
        />
      </div>
    </>
  )
}

