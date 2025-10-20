import { useState, useCallback, useRef, useEffect } from 'react';

export interface CloudBook {
  id: string;
  userId: string;
  title: string;
  author: string;
  blurb: string | null;
  coverUrl: string | null;
  publisher: string | null;
  pubDate: string | null;
  isbn: string | null;
  language: string | null;
  genre: string | null;
  chapters: Array<{
    id: string;
    title: string;
    content: string;
    type: 'frontmatter' | 'content' | 'backmatter';
  }>;
  tags: string[];
  endnotes: Array<{
    id: string;
    number: number;
    content: string;
    sourceChapterId?: string;
    sourceText?: string;
  }>;
  endnoteReferences: Array<{
    id: string;
    number: number;
    chapterId: string;
    endnoteId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function useCloudBooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBook = useCallback(async (bookData: Partial<CloudBook>): Promise<CloudBook | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create book');
      }

      const { book } = await response.json();
      return book;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBook = useCallback(async (bookId: string, bookData: Partial<CloudBook>): Promise<CloudBook | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update book');
      }

      const { book } = await response.json();
      return book;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBook = useCallback(async (bookId: string): Promise<CloudBook | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/books/${bookId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch book');
      }

      const { book } = await response.json();
      return book;
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllBooks = useCallback(async (): Promise<CloudBook[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/books');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch books');
      }

      const { books } = await response.json();
      return books;
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching books:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBook = useCallback(async (bookId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete book');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting book:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateBook = useCallback(async (bookId: string): Promise<CloudBook | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/books/${bookId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate book');
      }

      const { book } = await response.json();
      return book;
    } catch (err: any) {
      setError(err.message);
      console.error('Error duplicating book:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBook = useCallback(async (bookId: string | undefined, bookData: Partial<CloudBook>): Promise<CloudBook | null> => {
    if (bookId) {
      return await updateBook(bookId, bookData);
    } else {
      return await createBook(bookData);
    }
  }, [createBook, updateBook]);

  return {
    loading,
    error,
    createBook,
    updateBook,
    getBook,
    getAllBooks,
    deleteBook,
    duplicateBook,
    saveBook,
  };
}
