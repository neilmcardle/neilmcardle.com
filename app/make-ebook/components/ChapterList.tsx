import React from "react";
import { Button } from "@/components/ui/button";
import type { Chapter } from "../types";

interface ChapterListProps {
  chapters: Chapter[];
  currentChapter: number;
  onSwitch: (idx: number) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapter,
  onSwitch,
  onAdd,
  onDelete,
}) => (
  <div className="flex flex-row gap-2 flex-wrap mb-2">
    {chapters.map((ch, idx) => (
      <Button
        key={idx}
        variant={idx === currentChapter ? "default" : "outline"}
        size="sm"
        onClick={() => onSwitch(idx)}
      >
        {ch.title ? ch.title : `Chapter ${idx + 1}`}
        {chapters.length > 1 && (
          <span
            onClick={e => {
              e.stopPropagation();
              onDelete(idx);
            }}
            className="ml-2 text-red-400 hover:text-red-600 cursor-pointer"
            title="Delete chapter"
          >
            ×
          </span>
        )}
      </Button>
    ))}
    <Button type="button" size="sm" onClick={onAdd} className="ml-2">
      + Add Chapter
    </Button>
  </div>
);