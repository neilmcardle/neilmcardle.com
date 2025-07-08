export type Chapter = {
  title: string;
  content: string;
};

export interface BookData {
  title: string;
  author: string;
  isbn: string;
  cover: string | null;
  chapters: Chapter[];
}