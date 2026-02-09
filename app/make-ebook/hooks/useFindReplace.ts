import { useState, useCallback, useMemo } from 'react';
import { Chapter } from '../types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const matches = useMemo((): ChapterMatch[] => {
    if (!searchTerm) return [];
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    return chapters.map((ch, i) => {
      const plain = stripHtml(ch.content);
      const found = plain.match(regex);
      return {
        chapterIndex: i,
        chapterTitle: ch.title || `Chapter ${i + 1}`,
        count: found ? found.length : 0,
      };
    }).filter(m => m.count > 0);
  }, [chapters, searchTerm, caseSensitive]);

  const totalMatches = useMemo(() => matches.reduce((sum, m) => sum + m.count, 0), [matches]);

  const replaceInChapter = useCallback((chapterIndex: number) => {
    if (!searchTerm) return 0;
    const chapter = chapters[chapterIndex];
    if (!chapter) return 0;

    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    // Replace in the HTML content, but only within text nodes (not inside tags)
    let count = 0;
    const newContent = chapter.content.replace(
      /(<[^>]*>)|([^<]+)/g,
      (_, tag, text) => {
        if (tag) return tag; // Preserve HTML tags
        const replaced = text.replace(regex, () => {
          count++;
          return replaceTerm;
        });
        return replaced;
      }
    );

    if (count > 0) {
      onContentChange(chapterIndex, newContent);
    }
    return count;
  }, [chapters, searchTerm, replaceTerm, caseSensitive, onContentChange]);

  const replaceAll = useCallback(() => {
    let total = 0;
    for (const match of matches) {
      total += replaceInChapter(match.chapterIndex);
    }
    return total;
  }, [matches, replaceInChapter]);

  const goToMatch = useCallback((chapterIndex: number) => {
    onSelectChapter(chapterIndex);
  }, [onSelectChapter]);

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
