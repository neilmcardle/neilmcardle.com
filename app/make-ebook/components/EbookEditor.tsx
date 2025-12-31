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
        {/* Coverly Button */}
        <button
          type="button"
          onClick={() => window.open('https://coverly.figma.site', '_blank', 'noopener,noreferrer')}
          className="flex flex-col items-center w-full gap-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-[#424242] bg-white dark:bg-[#383838] hover:bg-gray-50 dark:hover:bg-[#2f2f2f] shadow transition-all mb-2"
          title="Open Coverly: Book Cover Generator (opens in new tab)"
        >
          <img
            src="/coverly-logo.svg"
            alt="Coverly logo"
            className="h-8 block dark:hidden mb-1"
            style={{ margin: '0 auto' }}
          />
          <img
            src="/dark-coverly-logo.svg"
            alt="Coverly logo dark"
            className="h-8 hidden dark:block mb-1"
            style={{ margin: '0 auto' }}
          />
          <span className="text-xs text-[#4B3A8B] dark:text-[#D1C4F7] text-center leading-tight">Design your own book cover and upload it to MakeEbook</span>
          <span className="flex items-center justify-center gap-1 mt-1 text-xs text-[#6C47FF] dark:text-[#B6A7FF] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14L21 3" /></svg>
            <span>Opens in new tab</span>
          </span>
        </button>
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