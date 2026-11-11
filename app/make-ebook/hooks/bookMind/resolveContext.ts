import { Chapter as BookChapter } from "../../types";
import { loadBookById } from "../../utils/bookLibrary";
import {
  buildSceneContext,
  buildWideContext,
  pickContextTier,
  RetrievedContext,
} from "../../utils/contextRetrieval";
import { ANALYTICAL_ACTIONS, CHAPTER_SCOPED } from "./actions";
import type { BookMindContext, SendMessageOpts } from "./types";

export function resolveContext(
  ids: { bookId?: string; userId?: string },
  query: string,
  opts: SendMessageOpts,
  legacy?: BookMindContext,
): {
  ctx: RetrievedContext;
  tier: "spotlight" | "scene" | "wide";
  chapters: BookChapter[];
} {
  const { bookId, userId } = ids;
  if (bookId && userId) {
    const book = loadBookById(userId, bookId);
    if (book) {
      const chapters = book.chapters;
      const currentChapter =
        opts.selectedChapterIndex !== undefined &&
        chapters[opts.selectedChapterIndex]
          ? chapters[opts.selectedChapterIndex]
          : chapters[0];
      const brief = book.bookmindMemory?.brief ?? null;

      const tier =
        opts.action && ANALYTICAL_ACTIONS.includes(opts.action)
          ? "wide"
          : opts.action && CHAPTER_SCOPED.includes(opts.action)
            ? "scene"
            : pickContextTier({ query, currentChapter });

      const ctx =
        tier === "wide"
          ? buildWideContext({
              brief,
              chapters,
              query,
              selectedText: opts.selectedText,
            })
          : buildSceneContext({
              brief,
              chapters,
              currentChapterId: currentChapter?.id,
              query,
              selectedText: opts.selectedText,
            });

      const attached = (opts.chapterIds ?? [])
        .map((id) => chapters.find((c) => c.id === id))
        .filter(
          (c): c is BookChapter =>
            !!c &&
            c.id !== ctx.currentChapter?.id &&
            !ctx.retrievedChapters.some((r) => r.chapter.id === c.id),
        )
        .map((chapter) => ({
          chapter,
          reason: "attached by the author",
          score: 1,
        }));
      if (attached.length > 0) {
        ctx.retrievedChapters = [...ctx.retrievedChapters, ...attached];
      }

      return { ctx, tier, chapters };
    }
  }

  const legacyChapters: BookChapter[] = (legacy?.allChapters ?? []).map(
    (c, i) => ({
      id: `legacy-${i}`,
      title: c.title,
      content: c.content,
      type: c.type as BookChapter["type"],
    }),
  );
  const currentChapter =
    legacyChapters.find((c) => c.title === legacy?.chapterTitle) ??
    legacyChapters[0];
  const ctx = buildSceneContext({
    brief: null,
    chapters: legacyChapters,
    currentChapterId: currentChapter?.id,
    query,
    selectedText: opts.selectedText ?? legacy?.selectedText,
  });
  return { ctx, tier: "scene", chapters: legacyChapters };
}
