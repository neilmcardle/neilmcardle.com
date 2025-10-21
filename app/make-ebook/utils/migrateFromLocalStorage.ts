import type { CloudBook } from '../hooks/useCloudBooks';

const MIGRATION_FLAG_KEY = 'ebook_localStorage_migration_complete';

export interface LocalStorageBook {
  title: string;
  author: string;
  blurb?: string;
  coverUrl?: string;
  publisher?: string;
  pubDate?: string;
  isbn?: string;
  language?: string;
  genre?: string;
  chapters: Array<{
    id: string;
    title: string;
    content: string;
    type: 'frontmatter' | 'content' | 'backmatter';
  }>;
  tags?: string[];
  endnotes?: Array<{
    id: string;
    number: number;
    content: string;
    sourceChapterId: string;
    sourceText: string;
  }>;
  endnoteReferences?: Array<{
    id: string;
    number: number;
    chapterId: string;
    endnoteId: string;
  }>;
}

export function hasCompletedMigration(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
}

export function markMigrationComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
}

export function getLocalStorageBooks(): LocalStorageBook[] {
  if (typeof window === 'undefined') return [];
  
  const allBooks: LocalStorageBook[] = [];
  const seenBooks = new Set<string>();
  
  try {
    const ebookLibraryJson = localStorage.getItem('ebookLibrary');
    if (ebookLibraryJson) {
      const library = JSON.parse(ebookLibraryJson);
      if (Array.isArray(library)) {
        library.forEach((book: LocalStorageBook) => {
          const bookKey = `${book.title}|${book.author}|${book.chapters?.[0]?.content?.substring(0, 100) || ''}`;
          if (!seenBooks.has(bookKey)) {
            seenBooks.add(bookKey);
            allBooks.push(book);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error reading ebookLibrary from localStorage:', error);
  }
  
  try {
    const makeebookLibraryJson = localStorage.getItem('makeebook_library');
    if (makeebookLibraryJson) {
      const library = JSON.parse(makeebookLibraryJson);
      if (Array.isArray(library)) {
        library.forEach((book: LocalStorageBook) => {
          const bookKey = `${book.title}|${book.author}|${book.chapters?.[0]?.content?.substring(0, 100) || ''}`;
          if (!seenBooks.has(bookKey)) {
            seenBooks.add(bookKey);
            allBooks.push(book);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error reading makeebook_library from localStorage:', error);
  }
  
  return allBooks;
}

export async function migrateLocalStorageBooksToCloud(
  createBook: (book: Omit<CloudBook, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<CloudBook>
): Promise<{ migrated: number; errors: number }> {
  if (hasCompletedMigration()) {
    console.log('Migration already completed, skipping');
    return { migrated: 0, errors: 0 };
  }

  const localBooks = getLocalStorageBooks();
  if (localBooks.length === 0) {
    console.log('No localStorage books to migrate');
    markMigrationComplete();
    return { migrated: 0, errors: 0 };
  }

  console.log(`Migrating ${localBooks.length} books from localStorage to cloud...`);
  
  let migrated = 0;
  let errors = 0;

  for (const localBook of localBooks) {
    try {
      await createBook({
        title: localBook.title || 'Untitled Book',
        author: localBook.author || 'Unknown Author',
        blurb: localBook.blurb || null,
        coverUrl: localBook.coverUrl || null,
        publisher: localBook.publisher || null,
        pubDate: localBook.pubDate || null,
        isbn: localBook.isbn || null,
        language: localBook.language || null,
        genre: localBook.genre || null,
        chapters: localBook.chapters || [],
        tags: localBook.tags || [],
        endnotes: localBook.endnotes || [],
        endnoteReferences: localBook.endnoteReferences || [],
      });
      migrated++;
      console.log(`✓ Migrated book: ${localBook.title}`);
    } catch (error) {
      errors++;
      console.error(`✗ Failed to migrate book "${localBook.title}":`, error);
      if (error instanceof Error) {
        console.error(`  Error message: ${error.message}`);
        console.error(`  Error stack: ${error.stack}`);
      }
    }
  }

  console.log(`Migration summary: ${migrated} books migrated, ${errors} errors out of ${localBooks.length} total`);
  
  // Only mark migration as complete if ALL books were successfully migrated
  // This allows partial failures to be retried on the next login attempt
  if (migrated === localBooks.length && errors === 0) {
    console.log('✓ All books migrated successfully. Marking migration complete and clearing localStorage.');
    markMigrationComplete();
    
    // Clear both localStorage keys now that migration is complete
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ebookLibrary');
        localStorage.removeItem('makeebook_library');
        console.log('✓ Cleared localStorage keys: ebookLibrary, makeebook_library');
      } catch (error) {
        console.error('Error clearing localStorage after migration:', error);
      }
    }
  } else {
    console.warn(`⚠ Migration incomplete: ${errors} errors occurred. Migration will be retried on next login.`);
    console.warn(`  Successfully migrated: ${migrated}/${localBooks.length} books`);
  }
  
  return { migrated, errors };
}
