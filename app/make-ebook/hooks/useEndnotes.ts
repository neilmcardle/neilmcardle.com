"use client";
import { useRef, useEffect } from "react";
import { Chapter, Endnote, EndnoteReference } from "../types";
import { scrollMotion } from "../utils/motion";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  variant: "confirm" | "alert" | "destructive";
  confirmLabel?: string;
  onConfirm: () => void;
}

interface UseEndnotesParams {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  endnotes: Endnote[];
  setEndnotes: React.Dispatch<React.SetStateAction<Endnote[]>>;
  endnoteReferences: EndnoteReference[];
  setEndnoteReferences: React.Dispatch<
    React.SetStateAction<EndnoteReference[]>
  >;
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

  useEffect(() => {
    if (
      endnotes.length > 0 ||
      chapters.some((ch) => ch.title.toLowerCase() === "endnotes")
    ) {
      updateEndnotesChapterContent(endnotes);
    }

    if (endnotes.length === 0 && prevEndnotesCountRef.current > 0) {
      setNextEndnoteNumber(1);
      setDialogState({
        open: true,
        title: "Endnotes Removed",
        message:
          "All endnotes have been deleted. The Endnotes chapter has been removed from your book.",
        variant: "alert",
        onConfirm: () => setDialogState((prev) => ({ ...prev, open: false })),
      });
    }
    prevEndnotesCountRef.current = endnotes.length;
  }, [endnotes]);

  useEffect(() => {
    function handleEndnoteClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      const linkElement = target.closest("a");
      if (!linkElement) return;

      if (linkElement.classList.contains("endnote-back")) {
        event.preventDefault();
        event.stopPropagation();

        const refNumber = linkElement.getAttribute("data-back-to-ref");

        if (refNumber) {
          const ref = endnoteReferences.find(
            (r) => r.number === parseInt(refNumber),
          );
          if (ref) {
            const chapterIndex = chapters.findIndex(
              (ch) => ch.id === ref.chapterId,
            );
            if (chapterIndex >= 0) {
              setSelectedChapter(chapterIndex);

              setTimeout(() => {
                const refElement = document.getElementById(`ref${refNumber}`);
                if (refElement) {
                  refElement.scrollIntoView({
                    behavior: scrollMotion(),
                    block: "center",
                  });

                  refElement.style.backgroundColor = "#ffeb3b";
                  setTimeout(() => {
                    refElement.style.backgroundColor = "";
                  }, 1000);
                }
              }, 150);
            }
          }
        }
        return;
      }

      const endnoteRef = linkElement.getAttribute("data-endnote-ref");
      if (endnoteRef) {
        event.preventDefault();
        event.stopPropagation();

        const endnotesIndex = chapters.findIndex(
          (ch) => ch.title.toLowerCase() === "endnotes",
        );
        if (endnotesIndex >= 0) {
          setSelectedChapter(endnotesIndex);

          setTimeout(() => {
            const endElement = document.getElementById(`end${endnoteRef}`);
            if (endElement) {
              endElement.scrollIntoView({
                behavior: scrollMotion(),
                block: "center",
              });

              endElement.style.backgroundColor = "#ffeb3b";
              setTimeout(() => {
                endElement.style.backgroundColor = "";
              }, 1000);
            }
          }, 150);
        }
      }
    }

    document.addEventListener("click", handleEndnoteClick, true);
    return () =>
      document.removeEventListener("click", handleEndnoteClick, true);
  }, [chapters, endnoteReferences, setSelectedChapter]);

  useEffect(() => {
    if (endnotes.length === 0 && endnoteReferences.length === 0) return;

    const allChapterHtml = chapters
      .filter((ch) => ch.title.toLowerCase() !== "endnotes")
      .map((ch) => ch.content)
      .join("");

    const survivingRefIds = new Set<string>();
    const refMatches = allChapterHtml.matchAll(/data-endnote-id="([^"]+)"/g);
    for (const m of refMatches) {
      survivingRefIds.add(m[1]);
    }

    const orphanedFromChapters = endnoteReferences.filter(
      (r) => !survivingRefIds.has(r.endnoteId),
    );

    const endnotesChapter = chapters.find(
      (ch) => ch.title.toLowerCase() === "endnotes",
    );
    let orphanedFromEndnotesChapter: string[] = [];

    if (endnotesChapter && endnotes.length > 0) {
      const survivingEntryIds = new Set<string>();
      const entryMatches = endnotesChapter.content.matchAll(
        /data-endnote-entry-id="([^"]+)"/g,
      );
      for (const m of entryMatches) {
        survivingEntryIds.add(m[1]);
      }

      orphanedFromEndnotesChapter = endnotes
        .filter((e) => !survivingEntryIds.has(e.id))
        .map((e) => e.id);
    }

    const allOrphanedIds = new Set([
      ...orphanedFromChapters.map((r) => r.endnoteId),
      ...orphanedFromEndnotesChapter,
    ]);

    if (allOrphanedIds.size === 0) return;

    if (orphanedFromEndnotesChapter.length > 0) {
      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.title.toLowerCase() === "endnotes") return ch;
          let content = ch.content;
          for (const id of orphanedFromEndnotesChapter) {
            content = content.replace(
              new RegExp(`<a[^>]*data-endnote-id="${id}"[^>]*>.*?</a>`, "gi"),
              "",
            );
          }
          return content !== ch.content ? { ...ch, content } : ch;
        }),
      );
    }

    setEndnotes((prev) => prev.filter((e) => !allOrphanedIds.has(e.id)));
    setEndnoteReferences((prev) =>
      prev.filter((r) => !allOrphanedIds.has(r.endnoteId)),
    );
  }, [chapters]);

  function updateEndnotesChapterContent(currentEndnotes: Endnote[]) {
    setChapters((currentChapters) => {
      const endnotesChapterIndex = currentChapters.findIndex(
        (ch) => ch.title.toLowerCase() === "endnotes",
      );

      const endnotesContent = [...currentEndnotes]
        .sort((a, b) => a.number - b.number)
        .map((endnote) => {
          const backLink = `<a href="#ref${endnote.number}" id="end${endnote.number}" data-back-to-ref="${endnote.number}" class="endnote-back" style="color: #0066cc; text-decoration: none; margin-left: 8px; cursor: pointer; user-select: none; font-weight: bold; font-size: 14px; padding: 2px 6px; border: 1px solid #0066cc; border-radius: 3px; background-color: #f0f8ff; display: inline-block;">[${endnote.number}]</a>`;
          return `<p data-endnote-entry-id="${endnote.id}">${endnote.number}. ${endnote.content} ${backLink}</p>`;
        })
        .join("");

      const updatedChapters = [...currentChapters];

      if (endnotesChapterIndex === -1) {
        if (currentEndnotes.length === 0) return currentChapters;

        const newEndnotesChapter = {
          id: `endnotes-${Date.now()}`,
          title: "Endnotes",
          content: endnotesContent,
          type: "backmatter" as const,
        };
        updatedChapters.push(newEndnotesChapter);
      } else {
        if (currentEndnotes.length === 0) {
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

    const newEndnote: Endnote = {
      id: endnoteId,
      number: endnoteNumber,
      content: endnoteContent,
      sourceChapterId,
      sourceText: "", // No longer using selected text
    };

    const newReference: EndnoteReference = {
      id: `ref${endnoteNumber}`,
      number: endnoteNumber,
      chapterId: sourceChapterId,
      endnoteId,
    };

    setEndnotes((prev) => [...prev, newEndnote]);
    setEndnoteReferences((prev) => [...prev, newReference]);
    setNextEndnoteNumber((prev) => prev + 1);

    const endnoteLink = `<a class="note-${endnoteNumber}" href="#end${endnoteNumber}" id="ref${endnoteNumber}" title="note ${endnoteNumber}" data-endnote-ref="${endnoteNumber}" data-endnote-id="${endnoteId}" style="color: #0066cc; text-decoration: none;"><sup>[${endnoteNumber}]</sup></a>`;

    return endnoteLink;
  }

  function handleCreateEndnote(endnoteContent: string, chapterId?: string) {
    if (!endnoteContent.trim()) return "";

    const currentChapterId =
      chapterId ||
      (selectedChapter >= 0 && chapters[selectedChapter]
        ? chapters[selectedChapter].id
        : "unknown");
    const endnoteLink = createEndnote(endnoteContent, currentChapterId);

    return endnoteLink;
  }

  return { handleCreateEndnote, updateEndnotesChapterContent };
}
