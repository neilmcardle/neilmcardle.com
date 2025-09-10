import React from "react";
import { uuidv4 } from "../utils/uuid";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface ChapterEditorProps {
  chapters: Chapter[];
  setChapters: (chs: Chapter[]) => void;
  lockedSections: any;
  setLockedSections: (s: any) => void;
}

export default function ChapterEditor({
  chapters,
  setChapters,
  lockedSections,
  setLockedSections,
}: ChapterEditorProps) {
  const handleAddChapter = () => {
    setChapters([
      ...chapters,
      { id: uuidv4(), title: `Chapter ${chapters.length + 1}`, content: "" },
    ]);
  };

  const handleRemoveChapter = (id: string) => {
    setChapters(chapters.filter(ch => ch.id !== id));
  };

  const handleChangeTitle = (id: string, value: string) => {
    setChapters(chapters.map(ch => ch.id === id ? { ...ch, title: value } : ch));
  };

  const handleChangeContent = (id: string, value: string) => {
    setChapters(chapters.map(ch => ch.id === id ? { ...ch, content: value } : ch));
  };

  // Optionally add handleMoveChapter for reordering

  return (
    <section className="p-4 rounded-xl border border-[#ececec] bg-white mt-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center">
        Chapters
        <button
          type="button"
          className="ml-2 text-[#b0b3b8] hover:text-[#86868B]"
          title={lockedSections.chapters ? "Unlock to edit" : "Lock section"}
          onClick={() => setLockedSections((s: any) => ({ ...s, chapters: !s.chapters }))}
          tabIndex={0}
        >
          {lockedSections.chapters ? "🔒" : "🔓"}
        </button>
      </h2>
      <div className="space-y-4">
        {chapters.map((chapter, idx) => (
          <div key={chapter.id} className="border-b pb-4 mb-4">
            <input
              className="w-full mb-2 px-3 py-2 rounded-lg border"
              placeholder={`Title for Chapter ${idx + 1}`}
              value={chapter.title}
              onChange={e => handleChangeTitle(chapter.id, e.target.value)}
              disabled={lockedSections.chapters}
            />
            <textarea
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="Chapter content..."
              value={chapter.content}
              onChange={e => handleChangeContent(chapter.id, e.target.value)}
              rows={5}
              disabled={lockedSections.chapters}
            />
            <button
              className="mt-2 text-red-500 text-xs"
              type="button"
              onClick={() => handleRemoveChapter(chapter.id)}
              disabled={lockedSections.chapters}
            >
              Remove Chapter
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 rounded-full bg-[#15161a] text-white font-semibold"
          type="button"
          onClick={handleAddChapter}
          disabled={lockedSections.chapters}
        >
          Add Chapter
        </button>
      </div>
    </section>
  );
}