import React from "react";

type Chapter = { title: string; content: string };
type Book = {
  title: string;
  author: string;
  publisher: string;
  cover: string;
  chapters: Chapter[];
};

type EbookEditorProps = {
  book: Book;
  setBook: (b: Book) => void;
  selectedChapterIdx: number;
  setSelectedChapterIdx: (idx: number) => void;
};

export default function EbookEditor({ book, setBook, selectedChapterIdx, setSelectedChapterIdx }: EbookEditorProps) {
  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Your eBook Project</h1>
      <p className="mb-4 text-[#737373]">The AI will help you fill this out, or you can edit directly.</p>
      <div className="mb-4">
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Book Title"
          value={book.title}
          onChange={e => setBook({ ...book, title: e.target.value })}
        />
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Author"
          value={book.author}
          onChange={e => setBook({ ...book, author: e.target.value })}
        />
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Publisher"
          value={book.publisher}
          onChange={e => setBook({ ...book, publisher: e.target.value })}
        />
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Cover Image URL"
          value={book.cover}
          onChange={e => setBook({ ...book, cover: e.target.value })}
        />
        {book.cover && (
          <img src={book.cover} alt="Cover" className="mb-2 max-h-56 rounded" />
        )}
      </div>
      <div className="mb-4">
        <strong>Chapters</strong>
        <div className="flex gap-2 mb-2 flex-wrap">
          {book.chapters.map((ch, idx) => (
            <button
              key={idx}
              className={`px-2 py-1 rounded border ${selectedChapterIdx === idx ? "bg-blue-600 text-white" : "bg-white text-black"}`}
              onClick={() => setSelectedChapterIdx(idx)}
              type="button"
            >
              {`Chapter ${idx + 1}${ch.title ? ": " + ch.title : ""}`}
            </button>
          ))}
          <button
            type="button"
            className="px-2 py-1 rounded border bg-green-100 text-green-700"
            onClick={() => setBook(book => ({
              ...book,
              chapters: [...book.chapters, { title: `Chapter ${book.chapters.length + 1}`, content: "" }]
            }))}
          >
            + Add Chapter
          </button>
        </div>
        {book.chapters[selectedChapterIdx] && (
          <fieldset className="border rounded p-2 mb-2">
            <legend className="font-semibold">
              {`Chapter ${selectedChapterIdx + 1}${book.chapters[selectedChapterIdx].title ? ": " + book.chapters[selectedChapterIdx].title : ""}`}
            </legend>
            <input
              className="w-full px-2 py-1 border rounded mb-1"
              placeholder={`Chapter ${selectedChapterIdx + 1} Title`}
              value={book.chapters[selectedChapterIdx].title}
              onChange={e => {
                const chapters = [...book.chapters];
                chapters[selectedChapterIdx].title = e.target.value;
                setBook({ ...book, chapters });
              }}
            />
            <textarea
              className="w-full px-2 py-1 border rounded"
              placeholder={`Chapter ${selectedChapterIdx + 1} Content`}
              value={book.chapters[selectedChapterIdx].content}
              onChange={e => {
                const chapters = [...book.chapters];
                chapters[selectedChapterIdx].content = e.target.value;
                setBook({ ...book, chapters });
              }}
            />
          </fieldset>
        )}
      </div>
      {/* Add Save, Export, etc. if needed */}
    </div>
  );
}