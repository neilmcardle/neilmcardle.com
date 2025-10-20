export type Chapter = {
  id: string;
  title: string;
  content: string;
  type: 'frontmatter' | 'content' | 'backmatter';
};

export type Endnote = {
  id: string;
  number: number;
  content: string;
  sourceChapterId?: string;
  sourceText?: string;
};

export type EndnoteReference = {
  id: string;
  number: number;
  chapterId: string;
  endnoteId: string;
};

// Reorganized with most common selections at the top
export const CHAPTER_TEMPLATES = {
  common: [
    { title: 'Chapter', description: 'A main content chapter', type: 'content' as const },
    { title: 'Preface', description: 'An introduction by the author', type: 'frontmatter' as const },
    { title: 'Introduction', description: 'An opening section', type: 'frontmatter' as const },
    { title: 'Epilogue', description: 'A concluding section', type: 'backmatter' as const },
  ],
  frontmatter: [
    { title: 'Dedication', description: 'A personal dedication' },
    { title: 'Acknowledgments', description: 'Thank you to contributors' },
    { title: 'Foreword', description: 'An introduction by someone else' },
    { title: 'Prologue', description: 'A preliminary section' },
    { title: 'Custom Front Matter', description: 'Create your own front matter chapter' },
  ],
  content: [
    { title: 'Part', description: 'A major section or part' },
    { title: 'Custom Chapter', description: 'Create your own chapter' },
  ],
  backmatter: [
    { title: 'Endnotes', description: 'Notes and references' },
    { title: 'Bibliography', description: 'List of sources' },
    { title: 'Glossary', description: 'Definitions of terms' },
    { title: 'Index', description: 'Alphabetical list of topics' },
    { title: 'Appendix', description: 'Additional information' },
    { title: 'About the Author', description: 'Author biography' },
    { title: 'Custom Back Matter', description: 'Create your own back matter chapter' },
  ],
} as const;

export interface BookData {
  title: string;
  author: string;
  isbn: string;
  cover: string | null;
  chapters: Chapter[];
  endnotes?: Endnote[];
  endnoteReferences?: EndnoteReference[];
}