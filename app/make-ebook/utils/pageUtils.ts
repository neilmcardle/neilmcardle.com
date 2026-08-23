import { Chapter, EndnoteReference } from "../types";
import { uuidv4 } from "./uuid";

export function ensureChapterIds(chapters: Chapter[]): Chapter[] {
  return chapters.map((chapter) => ({
    ...chapter,
    id: chapter.id || uuidv4(),
  }));
}

export function migrateEndnoteReferences(
  endnoteRefs: EndnoteReference[],
  chapters: Chapter[],
): EndnoteReference[] {
  return endnoteRefs.map((ref) => {
    if (ref.chapterId === "unknown" || !ref.chapterId) {
      const firstContentChapter = chapters.find((ch) => ch.type === "content");
      return {
        ...ref,
        chapterId:
          firstContentChapter?.id || chapters[0]?.id || "fallback-chapter",
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
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return new Date(ms).toLocaleDateString();
}

export function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getContentChapterNumber(chapters: any[], currentIndex: number) {
  let contentChapterCount = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (chapters[i]?.type === "content") {
      contentChapterCount++;
    }
  }
  return contentChapterCount;
}

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function upgradeChapterIds(chapters: Chapter[]): {
  chapters: Chapter[];
  remap: Map<string, string>;
} {
  const remap = new Map<string, string>();
  const upgraded = chapters.map((chapter) => {
    if (isUuid(chapter.id)) return chapter;
    const id = uuidv4();
    if (chapter.id) remap.set(chapter.id, id);
    return { ...chapter, id };
  });
  return {
    chapters:
      remap.size > 0 || upgraded.some((c, i) => c.id !== chapters[i].id)
        ? upgraded
        : chapters,
    remap,
  };
}

export function remapChapterIdsDeep<T>(
  value: T,
  remap: Map<string, string>,
): T {
  if (remap.size === 0 || value == null) return value;
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(
        node as Record<string, unknown>,
      )) {
        if (key === "chapterId" && typeof val === "string" && remap.has(val)) {
          out[key] = remap.get(val);
        } else {
          out[key] = walk(val);
        }
      }
      return out;
    }
    return node;
  };
  return walk(value) as T;
}
