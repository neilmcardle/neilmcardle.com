'use client';

import React from 'react';
import { uuidv4 } from '../utils/uuid';
import RichTextEditor from './RichTextEditor';

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
  const handleAdd = () => {
    setChapters([
      ...chapters,
      { id: uuidv4(), title: `Chapter ${chapters.length + 1}`, content: '' },
    ]);
  };

  const handleRemove = (id: string) =>
    setChapters(chapters.filter(c => c.id !== id));

  const updateTitle = (id: string, title: string) =>
    setChapters(chapters.map(c => (c.id === id ? { ...c, title } : c)));

  const updateContent = (id: string, content: string) =>
    setChapters(chapters.map(c => (c.id === id ? { ...c, content } : c)));

  return (
    <section className="p-4 rounded bg-white mt-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center">
        Chapters
        <button
          type="button"
          className="ml-2 text-[#050505] hover:text-[#050505]"
          title={lockedSections.chapters ? 'Unlock to edit' : 'Lock section'}
          onClick={() =>
            setLockedSections((s: any) => ({ ...s, chapters: !s.chapters }))
          }
        >
          {lockedSections.chapters ? '🔒' : '🔓'}
        </button>
      </h2>

      <div className="space-y-8">
        {chapters.map((chapter, i) => (
          <div key={chapter.id} className="border-b pb-8 last:border-b-0">
            <input
              type="text"
              className="w-full mb-3 px-3 py-2 rounded border text-sm"
              placeholder={`Title for Chapter ${i + 1}`}
              value={chapter.title}
              onChange={e => updateTitle(chapter.id, e.target.value)}
              disabled={lockedSections.chapters}
            />

            <RichTextEditor
              value={chapter.content}
              onChange={html => updateContent(chapter.id, html)}
              disabled={lockedSections.chapters}
              placeholder="Write chapter content..."
            />

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemove(chapter.id)}
                disabled={lockedSections.chapters}
                className="text-xs text-red-500 hover:underline disabled:opacity-40"
              >
                Remove Chapter
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddChapter}
          disabled={lockedSections.chapters}
          className="px-5 py-2 rounded bg-[#15161a] text-white text-sm font-semibold disabled:opacity-50"
        >
          Add Chapter
        </button>
      </div>
    </section>
  );
}