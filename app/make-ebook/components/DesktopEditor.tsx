'use client';

import { Chapter } from '../types';
import RichTextEditor from './RichTextEditor';

interface DesktopEditorProps {
  chapters: Chapter[];
  selectedChapter: number;
  handleChapterTitleChange: (index: number, value: string) => void;
  handleChapterContentChange: (index: number, value: string) => void;
  handleCreateEndnote: (chapterId: string) => void;
  markDirty: () => void;
}

export default function DesktopEditor({
  chapters,
  selectedChapter,
  handleChapterTitleChange,
  handleChapterContentChange,
  handleCreateEndnote,
  markDirty,
}: DesktopEditorProps) {
  return (
    <>
      {chapters[selectedChapter] && (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <input
            type="text"
            value={chapters[selectedChapter].title}
            onChange={(e) => { handleChapterTitleChange(selectedChapter, e.target.value); markDirty(); }}
            placeholder="Chapter Title"
            className="text-xl font-bold bg-white border border-[#E8E8E8] rounded px-4 py-3 focus:border-black outline-none focus:outline-none focus:ring-0 placeholder:text-[#a0a0a0]"
            style={{ boxShadow: "none" }}
          />
          <div className="flex-1 min-h-0 overflow-hidden">
            <RichTextEditor
              value={chapters[selectedChapter].content}
              onChange={(value: string) => { handleChapterContentChange(selectedChapter, value); markDirty(); }}
              placeholder="Start writing your chapter..."
              onCreateEndnote={handleCreateEndnote}
              chapterId={chapters[selectedChapter].id}
            />
          </div>
        </div>
      )}
    </>
  );
}
