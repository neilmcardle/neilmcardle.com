"use client";
import { useRef, useEffect } from "react";
import { Chapter, Endnote, EndnoteReference } from "../types";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  variant: 'confirm' | 'alert' | 'destructive';
  confirmLabel?: string;
  onConfirm: () => void;
}

interface UseEndnotesParams {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  endnotes: Endnote[];
  setEndnotes: React.Dispatch<React.SetStateAction<Endnote[]>>;
  endnoteReferences: EndnoteReference[];
  setEndnoteReferences: React.Dispatch<React.SetStateAction<EndnoteReference[]>>;
  nextEndnoteNumber: number;
  setNextEndnoteNumber: React.Dispatch<React.SetStateAction<number>>;
  selectedChapter: number;
  setSelectedChapter: (i: number) => void;
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
}

export function useEndnotes({
  chapters,
  setChapters,
  endnotes,
  setEndnotes,
  endnoteReferences,
  setEndnoteReferences,
  nextEndnoteNumber,
  setNextEndnoteNumber,
  selectedChapter,
  setSelectedChapter,
  setDialogState,
}: UseEndnotesParams) {
  const prevEndnotesCountRef = useRef(0);

  // Update endnotes chapter content whenever endnotes change
  useEffect(() => {
    if (endnotes.length > 0 || chapters.some(ch => ch.title.toLowerCase() === 'endnotes')) {
      updateEndnotesChapterContent(endnotes);
    }
    // Reset numbering and notify user when all endnotes are deleted
    if (endnotes.length === 0 && prevEndnotesCountRef.current > 0) {
      setNextEndnoteNumber(1);
      setDialogState({
        open: true,
        title: 'Endnotes Removed',
        message: 'All endnotes have been deleted. The Endnotes chapter has been removed from your book.',
        variant: 'alert',
        onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
      });
    }
    prevEndnotesCountRef.current = endnotes.length;
  }, [endnotes]);

  // Handle bidirectional endnote navigation (chapter ↔ endnotes)
  useEffect(() => {
    function handleEndnoteClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      // Check if click is on a link element or its children
      const linkElement = target.closest('a');
      if (!linkElement) return;

      // Check for back-link (endnotes → chapter)
      if (linkElement.classList.contains('endnote-back')) {
        event.preventDefault();
        event.stopPropagation();

        const refNumber = linkElement.getAttribute('data-back-to-ref');

        if (refNumber) {
          // Find which chapter contains this reference
          const ref = endnoteReferences.find(r => r.number === parseInt(refNumber));
          if (ref) {
            const chapterIndex = chapters.findIndex(ch => ch.id === ref.chapterId);
            if (chapterIndex >= 0) {
              setSelectedChapter(chapterIndex);

              // Scroll to reference after chapter switches
              setTimeout(() => {
                const refElement = document.getElementById(`ref${refNumber}`);
                if (refElement) {
                  refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Highlight effect
                  refElement.style.backgroundColor = '#ffeb3b';
                  setTimeout(() => {
                    refElement.style.backgroundColor = '';
                  }, 1000);
                }
              }, 150);
            }
          }
        }
        return;
      }

      // Check for forward-link (chapter → endnotes)
      const endnoteRef = linkElement.getAttribute('data-endnote-ref');
      if (endnoteRef) {
        event.preventDefault();
        event.stopPropagation();

        // Find the endnotes chapter
        const endnotesIndex = chapters.findIndex(ch => ch.title.toLowerCase() === 'endnotes');
        if (endnotesIndex >= 0) {
          setSelectedChapter(endnotesIndex);

          // Scroll to endnote after chapter switches
          setTimeout(() => {
            const endElement = document.getElementById(`end${endnoteRef}`);
            if (endElement) {
              endElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight effect
              endElement.style.backgroundColor = '#ffeb3b';
              setTimeout(() => {
                endElement.style.backgroundColor = '';
              }, 1000);
            }
          }, 150);
        }
      }
    }

    // Attach to document with capture phase to intercept before contenteditable
    document.addEventListener('click', handleEndnoteClick, true);
    return () => document.removeEventListener('click', handleEndnoteClick, true);
  }, [chapters, endnoteReferences, setSelectedChapter]);

  // Two-way endnote sync: detect deletions from either direction
  // Direction 1: user backspaces an endnote reference [1] in a chapter → remove the endnote
  // Direction 2: user backspaces an endnote entry in the Endnotes chapter → remove the reference from the source chapter
  useEffect(() => {
    if (endnotes.length === 0 && endnoteReferences.length === 0) return;

    // --- Direction 1: check for orphaned references (marker deleted from chapter text) ---
    const allChapterHtml = chapters
      .filter(ch => ch.title.toLowerCase() !== 'endnotes')
      .map(ch => ch.content)
      .join('');

    const survivingRefIds = new Set<string>();
    const refMatches = allChapterHtml.matchAll(/data-endnote-id="([^"]+)"/g);
    for (const m of refMatches) {
      survivingRefIds.add(m[1]);
    }

    const orphanedFromChapters = endnoteReferences.filter(r => !survivingRefIds.has(r.endnoteId));

    // --- Direction 2: check for endnote entries deleted from the Endnotes chapter ---
    const endnotesChapter = chapters.find(ch => ch.title.toLowerCase() === 'endnotes');
    let orphanedFromEndnotesChapter: string[] = [];

    if (endnotesChapter && endnotes.length > 0) {
      const survivingEntryIds = new Set<string>();
      const entryMatches = endnotesChapter.content.matchAll(/data-endnote-entry-id="([^"]+)"/g);
      for (const m of entryMatches) {
        survivingEntryIds.add(m[1]);
      }

      // Endnotes in our array but missing from the chapter HTML = user deleted them
      orphanedFromEndnotesChapter = endnotes
        .filter(e => !survivingEntryIds.has(e.id))
        .map(e => e.id);
    }

    // Combine both sets of orphaned endnote IDs
    const allOrphanedIds = new Set([
      ...orphanedFromChapters.map(r => r.endnoteId),
      ...orphanedFromEndnotesChapter,
    ]);

    if (allOrphanedIds.size === 0) return;

    // Remove references from source chapter HTML (for endnotes deleted from the Endnotes chapter)
    if (orphanedFromEndnotesChapter.length > 0) {
      setChapters(prev => prev.map(ch => {
        if (ch.title.toLowerCase() === 'endnotes') return ch;
        let content = ch.content;
        for (const id of orphanedFromEndnotesChapter) {
          content = content.replace(
            new RegExp(`<a[^>]*data-endnote-id="${id}"[^>]*>.*?</a>`, 'gi'),
            ''
          );
        }
        return content !== ch.content ? { ...ch, content } : ch;
      }));
    }

    // Clean up endnotes and references arrays
    setEndnotes(prev => prev.filter(e => !allOrphanedIds.has(e.id)));
    setEndnoteReferences(prev => prev.filter(r => !allOrphanedIds.has(r.endnoteId)));
  }, [chapters]);

  function updateEndnotesChapterContent(currentEndnotes: Endnote[]) {
    // Accept endnotes as parameter to avoid stale closure issues
    setChapters(currentChapters => {
      const endnotesChapterIndex = currentChapters.findIndex(ch => ch.title.toLowerCase() === 'endnotes');

      // Generate endnotes content (create shallow copy to avoid mutating state)
      const endnotesContent = [...currentEndnotes]
        .sort((a, b) => a.number - b.number)
        .map(endnote => {
          const backLink = `<a href="#ref${endnote.number}" id="end${endnote.number}" data-back-to-ref="${endnote.number}" class="endnote-back" style="color: #0066cc; text-decoration: none; margin-left: 8px; cursor: pointer; user-select: none; font-weight: bold; font-size: 14px; padding: 2px 6px; border: 1px solid #0066cc; border-radius: 3px; background-color: #f0f8ff; display: inline-block;">[${endnote.number}]</a>`;
          return `<p data-endnote-entry-id="${endnote.id}">${endnote.number}. ${endnote.content} ${backLink}</p>`;
        })
        .join('');

      const updatedChapters = [...currentChapters];

      if (endnotesChapterIndex === -1) {
        // Only create new endnotes chapter if we have endnotes to show
        if (currentEndnotes.length === 0) return currentChapters;

        const newEndnotesChapter = {
          id: `endnotes-${Date.now()}`,
          title: 'Endnotes',
          content: endnotesContent,
          type: 'backmatter' as const,
        };
        updatedChapters.push(newEndnotesChapter);
      } else {
        // Update existing endnotes chapter (or remove if no endnotes)
        if (currentEndnotes.length === 0) {
          // Remove the endnotes chapter if there are no endnotes
          updatedChapters.splice(endnotesChapterIndex, 1);
        } else {
          updatedChapters[endnotesChapterIndex] = {
            ...updatedChapters[endnotesChapterIndex],
            content: endnotesContent,
          };
        }
      }

      return updatedChapters;
    });
  }

  function createEndnote(endnoteContent: string, sourceChapterId: string) {
    const endnoteId = `endnote-${Date.now()}`;
    const endnoteNumber = nextEndnoteNumber;

    // Create the endnote
    const newEndnote: Endnote = {
      id: endnoteId,
      number: endnoteNumber,
      content: endnoteContent,
      sourceChapterId,
      sourceText: '', // No longer using selected text
    };

    // Create the reference
    const newReference: EndnoteReference = {
      id: `ref${endnoteNumber}`,
      number: endnoteNumber,
      chapterId: sourceChapterId,
      endnoteId,
    };

    setEndnotes(prev => [...prev, newEndnote]);
    setEndnoteReferences(prev => [...prev, newReference]);
    setNextEndnoteNumber(prev => prev + 1);

    // Create a clickable endnote reference with proper ePub structure
    const endnoteLink = `<a class="note-${endnoteNumber}" href="#end${endnoteNumber}" id="ref${endnoteNumber}" title="note ${endnoteNumber}" data-endnote-ref="${endnoteNumber}" data-endnote-id="${endnoteId}" style="color: #0066cc; text-decoration: none;"><sup>[${endnoteNumber}]</sup></a>`;

    return endnoteLink;
  }

  function handleCreateEndnote(endnoteContent: string, chapterId?: string) {
    if (!endnoteContent.trim()) return '';

    const currentChapterId = chapterId || (selectedChapter >= 0 && chapters[selectedChapter] ? chapters[selectedChapter].id : 'unknown');
    const endnoteLink = createEndnote(endnoteContent, currentChapterId);

    return endnoteLink;
  }

  return { handleCreateEndnote, updateEndnotesChapterContent };
}
