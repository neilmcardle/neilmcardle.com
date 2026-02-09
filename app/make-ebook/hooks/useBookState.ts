import { useState, useCallback } from 'react';
import { BookMetadata, Endnote, EndnoteReference } from '../types';
import { LANGUAGES, today } from '../utils/constants';

const INITIAL_METADATA: BookMetadata = {
  title: '',
  author: '',
  blurb: '',
  publisher: '',
  pubDate: today,
  isbn: '',
  language: LANGUAGES[0],
  genre: '',
};

export function useBookState() {
  const [metadata, setMetadata] = useState<BookMetadata>(INITIAL_METADATA);
  const [currentBookId, setCurrentBookId] = useState<string | undefined>(undefined);
  const [endnotes, setEndnotes] = useState<Endnote[]>([]);
  const [endnoteReferences, setEndnoteReferences] = useState<EndnoteReference[]>([]);
  const [nextEndnoteNumber, setNextEndnoteNumber] = useState(1);

  const updateField = useCallback(<K extends keyof BookMetadata>(field: K, value: BookMetadata[K]) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetMetadata = useCallback(() => {
    setMetadata(INITIAL_METADATA);
    setCurrentBookId(undefined);
    setEndnotes([]);
    setEndnoteReferences([]);
    setNextEndnoteNumber(1);
  }, []);

  const loadMetadata = useCallback((data: Partial<BookMetadata> & { id?: string }) => {
    setMetadata({
      title: data.title || '',
      author: data.author || '',
      blurb: data.blurb || '',
      publisher: data.publisher || '',
      pubDate: data.pubDate || today,
      isbn: data.isbn || '',
      language: data.language || LANGUAGES[0],
      genre: data.genre || '',
    });
    if (data.id) setCurrentBookId(data.id);
  }, []);

  return {
    // Individual fields for direct binding
    title: metadata.title,
    author: metadata.author,
    blurb: metadata.blurb,
    publisher: metadata.publisher,
    pubDate: metadata.pubDate,
    isbn: metadata.isbn,
    language: metadata.language,
    genre: metadata.genre,

    // Setters for individual fields
    setTitle: (v: string) => updateField('title', v),
    setAuthor: (v: string) => updateField('author', v),
    setBlurb: (v: string) => updateField('blurb', v),
    setPublisher: (v: string) => updateField('publisher', v),
    setPubDate: (v: string) => updateField('pubDate', v),
    setIsbn: (v: string) => updateField('isbn', v),
    setLanguage: (v: string) => updateField('language', v),
    setGenre: (v: string) => updateField('genre', v),

    // Bulk operations
    metadata,
    setMetadata,
    updateField,
    resetMetadata,
    loadMetadata,

    // Book ID
    currentBookId,
    setCurrentBookId,

    // Endnotes
    endnotes,
    setEndnotes,
    endnoteReferences,
    setEndnoteReferences,
    nextEndnoteNumber,
    setNextEndnoteNumber,
  };
}
