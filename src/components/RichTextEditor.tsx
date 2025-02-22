"use client"

import type React from "react"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border border-makeebook-secondary/20 rounded-md p-2">
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor

