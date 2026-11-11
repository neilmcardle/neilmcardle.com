import { useState, useCallback, useEffect, useMemo } from "react";
import { Chapter } from "../types";
import { editorForChapter, setFindQuery } from "../editor/registry";
import { countInHtml, replaceInHtml } from "../editor/search";

export interface ChapterMatch {
  chapterIndex: number;
  chapterTitle: string;
  count: number;
}

export function useFindReplace(
  chapters: Chapter[],
  onContentChange: (index: number, content: string) => void,
  onSelectChapter: (index: number) => void,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const query = useMemo(
    () => ({ term: searchTerm, caseSensitive }),
    [searchTerm, caseSensitive],
  );

  useEffect(() => {
    setFindQuery(isOpen ? query : { term: "", caseSensitive: false });
  }, [isOpen, query]);

  useEffect(() => () => setFindQuery({ term: "", caseSensitive: false }), []);

  const matches = useMemo((): ChapterMatch[] => {
    if (!isOpen || !query.term) return [];
    return chapters
      .map((ch, i) => ({
        chapterIndex: i,
        chapterTitle: ch.title || `Chapter ${i + 1}`,
        count: countInHtml(ch.content, query),
      }))
      .filter((m) => m.count > 0);
  }, [chapters, query, isOpen]);

  const totalMatches = useMemo(
    () => matches.reduce((sum, m) => sum + m.count, 0),
    [matches],
  );

  const replaceInChapter = useCallback(
    (chapterIndex: number) => {
      if (!query.term) return 0;
      const chapter = chapters[chapterIndex];
      if (!chapter) return 0;
      const editor = editorForChapter(chapter.id);
      if (editor) return editor.replaceAll(query, replaceTerm);
      const { html, count } = replaceInHtml(
        chapter.content,
        query,
        replaceTerm,
      );
      if (count > 0) onContentChange(chapterIndex, html);
      return count;
    },
    [chapters, query, replaceTerm, onContentChange],
  );

  const replaceAll = useCallback(() => {
    let total = 0;
    for (const match of matches) {
      total += replaceInChapter(match.chapterIndex);
    }
    return total;
  }, [matches, replaceInChapter]);

  const goToMatch = useCallback(
    (chapterIndex: number) => {
      onSelectChapter(chapterIndex);
    },
    [onSelectChapter],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    open,
    close,
    searchTerm,
    setSearchTerm,
    replaceTerm,
    setReplaceTerm,
    caseSensitive,
    setCaseSensitive,
    matches,
    totalMatches,
    replaceInChapter,
    replaceAll,
    goToMatch,
  };
}
