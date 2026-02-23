// Utility functions for the make-ebook page
import { Chapter, EndnoteReference } from "../types";

// Migration function to ensure all chapters have IDs
export function ensureChapterIds(chapters: Chapter[]): Chapter[] {
  return chapters.map(chapter => ({
    ...chapter,
    id: chapter.id || `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));
}

// Migration function to update endnote references with unknown chapter IDs
export function migrateEndnoteReferences(endnoteRefs: EndnoteReference[], chapters: Chapter[]): EndnoteReference[] {
  return endnoteRefs.map(ref => {
    if (ref.chapterId === 'unknown' || !ref.chapterId) {
      // Try to find the chapter by context - for now, assign to first content chapter
      const firstContentChapter = chapters.find(ch => ch.type === 'content');
      return {
        ...ref,
        chapterId: firstContentChapter?.id || chapters[0]?.id || 'fallback-chapter'
      };
    }
    return ref;
  });
}

export function formatRelativeTime(ms: number): string {
  const diff = Math.abs(Date.now() - ms);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return new Date(ms).toLocaleDateString();
}

export function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function getContentChapterNumber(chapters: any[], currentIndex: number) {
  // Count only content chapters up to and including the current index
  let contentChapterCount = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (chapters[i]?.type === 'content') {
      contentChapterCount++;
    }
  }
  return contentChapterCount;
}
