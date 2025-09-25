export type Chapter = {
  title: string;
  content: string;
  type: 'frontmatter' | 'content' | 'backmatter';
};

export const CHAPTER_TEMPLATES = {
  frontmatter: [
    { title: 'Preface', description: 'An introduction by the author' },
    { title: 'Dedication', description: 'A personal dedication' },
    { title: 'Acknowledgments', description: 'Thank you to contributors' },
    { title: 'Foreword', description: 'An introduction by someone else' },
    { title: 'Introduction', description: 'An opening section' },
    { title: 'Prologue', description: 'A preliminary section' },
    { title: 'Custom Front Matter', description: 'Create your own front matter chapter' },
  ],
  content: [
    { title: 'Chapter', description: 'A main content chapter' },
    { title: 'Part', description: 'A major section or part' },
    { title: 'Custom Chapter', description: 'Create your own chapter' },
  ],
  backmatter: [
    { title: 'Epilogue', description: 'A concluding section' },
    { title: 'Endnotes', description: 'Notes and references' },
    { title: 'Bibliography', description: 'List of sources' },
    { title: 'Glossary', description: 'Definitions of terms' },
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
}