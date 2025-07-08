"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import type { Chapter } from "../types";

interface ChapterEditorProps {
  chapter: Chapter;
  onChange: (field: "title" | "content", value: string) => void;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, onChange }) => (
  <div className="flex flex-col gap-2">
    <Input
      id="chapterTitle"
      value={chapter.title || ""}
      onChange={e => onChange("title", e.target.value)}
      placeholder="Chapter title"
      className="mt-2"
    />
    <textarea
      value={chapter.content || ""}
      onChange={e => onChange("content", e.target.value)}
      placeholder="Write your chapter content here..."
      rows={10}
      className="bg-white p-2 border rounded"
    />
  </div>
);